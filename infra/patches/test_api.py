# infra/patches/test_api.py
import sys

# Try to import sitecustomize to apply patch
try:
    import sitecustomize
    print("sitecustomize imported successfully!")
except ImportError:
    print("sitecustomize not found!")

import httpx

try:
    r = httpx.post(
        "https://9router.phieucaphe.com/v1/chat/completions",
        headers={"Authorization": "Bearer sk-fdf3946d30eab0d6-o4k1rw-ced68e40"},
        json={
            "model": "coding",
            "messages": [{"role": "user", "content": "Hello"}]
        }
    )
    print("HTTP Status Code:", r.status_code)
    print("Response Content (first 200 chars):", r.text[:200])
except Exception as e:
    print("Error occurred during request:", e)
