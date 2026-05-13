# infra/patches/sitecustomize.py
"""
WHY THIS FILE EXISTS (ROOT CAUSE DOCUMENTATION):
------------------------------------------------
The custom OpenAI gateway endpoint (https://9router.phieucaphe.com/v1) is protected by Cloudflare WAF
AND served via Cloudflare Tunnel (cloudflared) running on the Mac Mini host.

ISSUE 1 — Cloudflare WAF blocks datacenter IPs with default User-Agents:
  Cloudflare is configured to block or challenge POST requests (e.g. /v1/chat/completions) originating
  from cloud/datacenter IPs (like DigitalOcean SGP1) if they carry default developer User-Agents such as:
    - "OpenAI/Python/1.30.1"
    - "httpx/0.24.0"
    - "python-requests/2.x.x"
  When blocked: HTTP 403 Forbidden ("Your request was blocked.")
  Fix: Override User-Agent to a Chrome browser string.

ISSUE 2 — Cloudflare Tunnel Error 1033 when host DNS is set to 1.1.1.1:
  When the Mac Mini (tunnel host) uses Cloudflare DNS (1.1.1.1), cloudflared's internal routing
  can create a conflict where Cloudflare's network cannot reach the tunnel endpoint, resulting in:
    - HTTP 530 / Error 1033: "Cloudflare Tunnel error — unable to reach it"
  Root cause: httpx defaults to HTTP/2 (h2), which is incompatible with how cloudflared handles
  multiplexed connections under certain Cloudflare DNS routing paths. Forcing HTTP/1.1 resolves this.
  Fix: Disable HTTP/2 in all httpx clients by patching the default http2 parameter.
"""

import sys

try:
    import httpx

    # --- FIX 1: Override User-Agent to bypass Cloudflare WAF ---
    # Patch httpx.Request.__init__ to globally intercept and override any User-Agent headers
    # since request-specific headers in OpenAI/httpx override default client headers.
    original_request_init = httpx.Request.__init__

    def patched_request_init(self, *args, **kwargs):
        original_request_init(self, *args, **kwargs)
        try:
            self.headers['User-Agent'] = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        except Exception:
            pass

    httpx.Request.__init__ = patched_request_init

    # --- FIX 2: Force HTTP/1.1 to prevent Cloudflare Tunnel Error 1033 ---
    # When Cloudflare DNS (1.1.1.1) is active on the tunnel host, HTTP/2 multiplexing
    # causes routing conflicts. Forcing HTTP/1.1 ensures stable connectivity.
    original_client_init = httpx.Client.__init__
    original_async_client_init = httpx.AsyncClient.__init__

    def patched_client_init(self, *args, **kwargs):
        kwargs['http2'] = False
        original_client_init(self, *args, **kwargs)

    def patched_async_client_init(self, *args, **kwargs):
        kwargs['http2'] = False
        original_async_client_init(self, *args, **kwargs)

    httpx.Client.__init__ = patched_client_init
    httpx.AsyncClient.__init__ = patched_async_client_init

except ImportError:
    pass
except Exception:
    pass
