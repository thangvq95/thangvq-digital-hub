# infra/patches/sitecustomize.py
"""
WHY THIS FILE EXISTS (ROOT CAUSE DOCUMENTATION):
------------------------------------------------
The custom OpenAI gateway endpoint (https://9router.phieucaphe.com/v1) is protected by Cloudflare WAF.
Cloudflare is configured to block or challenge POST requests (e.g. /v1/chat/completions) originating
from cloud/datacenter IPs (like DigitalOcean SGP1) if they carry default developer User-Agents such as:
  - "OpenAI/Python/1.30.1"
  - "httpx/0.24.0"
  - "python-requests/2.x.x"

When these requests are blocked, the gateway returns:
  - HTTP 403 Forbidden ("Your request was blocked.")

However, requests with standard browser-like User-Agents (e.g. Mozilla/5.0) or standard "curl" are fully allowed.

THE SOLUTION:
-------------
This script is a Python `sitecustomize.py` startup hook loaded globally into Hermes Agent containers
via the `PYTHONPATH` environment variable in docker-compose.yml. 

It transparently monkeypatches both `httpx.Client` and `httpx.AsyncClient` initialization to intercept
and override any outgoing OpenAI/Python default User-Agents with a standard, premium Chrome browser
User-Agent. This allows Hermes Agent to chat seamlessly with 9Router without altering core libraries
or the hermes-agent codebase.
"""

import sys
import logging

logging.basicConfig(level=logging.INFO)


logger = logging.getLogger("hermes_patches")

try:
    import httpx
    
    # 1. Patch httpx.Client.__init__
    original_client_init = httpx.Client.__init__

    def patched_client_init(self, *args, **kwargs):
        headers = kwargs.get('headers') or {}
        # Ensure dict format
        if not isinstance(headers, dict):
            try:
                headers = dict(headers)
            except Exception:
                headers = {}
        
        # Override User-Agent
        headers['User-Agent'] = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        kwargs['headers'] = headers
        original_client_init(self, *args, **kwargs)
    
    httpx.Client.__init__ = patched_client_init
    
    # 2. Patch httpx.AsyncClient.__init__
    original_async_client_init = httpx.AsyncClient.__init__
    def patched_async_client_init(self, *args, **kwargs):
        headers = kwargs.get('headers') or {}
        if not isinstance(headers, dict):
            try:
                headers = dict(headers)
            except Exception:
                headers = {}
        
        headers['User-Agent'] = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        kwargs['headers'] = headers
        original_async_client_init(self, *args, **kwargs)
        
    httpx.AsyncClient.__init__ = patched_async_client_init
    logger.info("Successfully applied httpx User-Agent override monkeypatch!")
except ImportError:
    pass
except Exception as e:
    logger.error(f"Failed to apply httpx patch: {e}")
