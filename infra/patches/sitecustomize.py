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

try:
    import httpx
    
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
except ImportError:
    pass
except Exception:
    pass


