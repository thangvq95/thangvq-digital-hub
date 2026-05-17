#!/usr/bin/env python3
import hashlib
import hmac
import json
import os
import sqlite3
import subprocess
import threading
import time
from http.server import BaseHTTPRequestHandler, HTTPServer

BASE_REPO = os.environ.get("BASE_REPO", "/home/thang/Development/thangvq-digital-hub")
WORKTREES_DIR = os.environ.get("WORKTREES_DIR", "/home/thang/worktrees")
HERMES_BIN = os.environ.get("HERMES_BIN", "hermes")
WEBHOOK_SECRET = os.environ.get("WEBHOOK_SECRET", "")
DEDUP_DB = os.environ.get("DEDUP_DB", "/home/thang/.cache/ai-workspace.db")
PORT = int(os.environ.get("PORT", "8080"))

EVENTS_ALLOWLIST = {"check_run", "check_suite", "pull_request", "issues", "push"}
ACTION_ALLOWLIST = {"completed", "rerequested", "requested", "synchronize", "opened", "reopened", "labeled"}


def _ensure_db():
    os.makedirs(os.path.dirname(DEDUP_DB), exist_ok=True)
    conn = sqlite3.connect(DEDUP_DB)
    with conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS seen_events (
                event_id TEXT PRIMARY KEY,
                created_at INTEGER NOT NULL
            )
            """
        )
    conn.close()


def _seen_before(event_id: str) -> bool:
    if not event_id:
        return True
    conn = sqlite3.connect(DEDUP_DB)
    with conn:
        row = conn.execute(
            "SELECT event_id FROM seen_events WHERE event_id = ?", (event_id,)
        ).fetchone()
    conn.close()
    return row is not None


def _mark_seen(event_id: str):
    if not event_id:
        return
    conn = sqlite3.connect(DEDUP_DB)
    with conn:
        conn.execute(
            "INSERT OR IGNORE INTO seen_events(event_id, created_at) VALUES(?, ?)",
            (event_id, int(time.time())),
        )
    conn.close()


def _verify_signature(body: bytes, signature: str) -> bool:
    if not WEBHOOK_SECRET:
        return False
    if not signature or not signature.startswith("sha256="):
        return False
    mac = hmac.new(WEBHOOK_SECRET.encode(), msg=body, digestmod=hashlib.sha256)
    expected = "sha256=" + mac.hexdigest()
    return hmac.compare_digest(expected, signature)


def _run(cmd: list[str], cwd: str | None = None):
    subprocess.run(cmd, cwd=cwd, check=True)


def _safe_ref_name(ref: str) -> str:
    return ref.replace("/", "_")


def _create_worktree(ref: str, run_id: str) -> str:
    os.makedirs(WORKTREES_DIR, exist_ok=True)
    safe_ref = _safe_ref_name(ref)
    # Append run_id to ensure concurrent issues (same branch) don't collide
    worktree_path = os.path.join(WORKTREES_DIR, f"{safe_ref}_{run_id}")
    _run(["git", "-C", BASE_REPO, "fetch", "origin", ref])
    _run(["git", "-C", BASE_REPO, "worktree", "add", "-d", "--force", worktree_path, f"origin/{ref}"])
    return worktree_path


def _remove_worktree(worktree_path: str):
    _run(["git", "-C", BASE_REPO, "worktree", "remove", "--force", worktree_path])


def _run_hermes(worktree_path: str, skill: str, target_desc: str):
    # Run hermes in oneshot mode (-z) with the given skill (-s).
    # We set cwd to the worktree so hermes operates on the isolated code.
    _run([HERMES_BIN, "-s", skill, "-z", target_desc], cwd=worktree_path)


def _extract_pr_number(payload: dict) -> int | None:
    if "pull_request" in payload and payload["pull_request"]:
        return payload["pull_request"].get("number")
    if "check_run" in payload and payload["check_run"]:
        pr_list = payload["check_run"].get("pull_requests", [])
        if pr_list:
            return pr_list[0].get("number")
    if "check_suite" in payload and payload["check_suite"]:
        pr_list = payload["check_suite"].get("pull_requests", [])
        if pr_list:
            return pr_list[0].get("number")
    return None


def _extract_ref(payload: dict, event: str) -> str | None:
    if event == "issues":
        # For new issues, there is no head branch. Clone the default branch to work on.
        return payload.get("repository", {}).get("default_branch", "main")
        
    if "pull_request" in payload and payload["pull_request"]:
        ref = payload["pull_request"].get("head", {}).get("ref")
        if ref:
            return ref
    if "check_run" in payload and payload["check_run"]:
        ref = payload["check_run"].get("check_suite", {}).get("head_branch")
        if ref:
            return ref
    if "check_suite" in payload and payload["check_suite"]:
        ref = payload["check_suite"].get("head_branch")
        if ref:
            return ref
    return None

def _determine_skill_and_target(event: str, payload: dict) -> tuple[str, str] | tuple[None, None]:
    """Parse payload to determine which skill to assign to Hermes"""
    headless_prompt = " (CRITICAL: You are running in a headless automated environment. Do NOT use ask_user tools. Do NOT ask for clarification. Make safe assumptions and proceed. Ensure all CLI commands use non-interactive flags like --yes or --fill. If you must, guess the best approach and create a PR.)"
    
    if event in ("check_run", "check_suite", "pull_request"):
        pr_number = _extract_pr_number(payload)
        if pr_number:
            return "gh-fix-ci", f"Fix PR {pr_number}. FIRST, view the PR details using 'gh pr view {pr_number}'. THEN proceed." + headless_prompt
            
    elif event == "issues":
        issue = payload.get("issue", {})
        issue_number = issue.get("number")
        if issue_number:
            labels = [l.get("name", "").lower() for l in issue.get("labels", [])]
            
            # Explicitly force the LLM to use the gh CLI tool so it doesn't just exit with a text response
            base_prompt = f"FIRST, use the 'gh issue view {issue_number}' command to read the issue description. THEN, "
            
            if "bug" in labels or "sentry" in labels:
                return "diagnose", base_prompt + f"fix the bug in issue #{issue_number}." + headless_prompt
            elif "feature" in labels or "enhancement" in labels:
                return "to-prd", base_prompt + f"implement the feature for issue #{issue_number}." + headless_prompt
            elif "plan" in labels:
                return "writing-plans", base_prompt + f"create a plan for issue #{issue_number}." + headless_prompt
            else:
                return "triage", base_prompt + f"triage issue #{issue_number}." + headless_prompt
                
    return None, None


def _should_process(event: str, action: str) -> bool:
    if event not in EVENTS_ALLOWLIST:
        return False
    if action and action not in ACTION_ALLOWLIST:
        return False
    return True


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(content_length)
        event = self.headers.get("X-GitHub-Event", "")
        delivery = self.headers.get("X-GitHub-Delivery", "")
        signature = self.headers.get("X-Hub-Signature-256", "")

        if not _verify_signature(body, signature):
            self.send_response(401)
            self.end_headers()
            self.wfile.write(b"invalid signature")
            return

        if _seen_before(delivery):
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"duplicate ignored")
            return

        try:
            payload = json.loads(body.decode("utf-8"))
        except json.JSONDecodeError:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"invalid json")
            return

        action = payload.get("action", "")
        if not _should_process(event, action):
            _mark_seen(delivery)
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"ignored")
            return

        # Handle push event: Update BASE_REPO and run GitNexus
        if event == "push":
            ref = payload.get("ref", "")
            if ref in ["refs/heads/main", "refs/heads/master"]:
                def _process_push():
                    try:
                        print(f"Updating BASE_REPO and running gitnexus analyze for {ref}...")
                        branch = ref.split("/")[-1]
                        _run(["git", "-C", BASE_REPO, "fetch", "origin"])
                        _run(["git", "-C", BASE_REPO, "reset", "--hard", f"origin/{branch}"])
                        _run(["gitnexus", "analyze"], cwd=BASE_REPO)
                        print("GitNexus analyze completed successfully.")
                    except Exception as e:
                        print(f"Push processing error for {delivery}: {e}")
                
                threading.Thread(target=_process_push, daemon=True).start()
                _mark_seen(delivery)
                self.send_response(202)
                self.end_headers()
                self.wfile.write(b"accepted push event and updating knowledge graph")
                return
            else:
                _mark_seen(delivery)
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b"ignored push event (not main branch)")
                return

        skill, target_desc = _determine_skill_and_target(event, payload)
        ref = _extract_ref(payload, event)
        
        if not skill or not target_desc or not ref:
            _mark_seen(delivery)
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"ignored: cannot determine skill or ref")
            return

        def _process_background():
            try:
                # Use delivery ID (unique GitHub Webhook ID) as run_id
                worktree = _create_worktree(ref, delivery)
                _run_hermes(worktree, skill, target_desc)
                _remove_worktree(worktree)
            except Exception as e:
                print(f"Background processing error for {delivery}: {e}")

        # Run Hermes in a background thread to avoid blocking the HTTP Server
        threading.Thread(target=_process_background, daemon=True).start()

        _mark_seen(delivery)
        self.send_response(202)
        self.end_headers()
        self.wfile.write(b"accepted and processing in background")


def main():
    _ensure_db()
    server = HTTPServer(("0.0.0.0", PORT), Handler)
    print(f"listening on {PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
