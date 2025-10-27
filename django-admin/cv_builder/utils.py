# accounts/tokens.py
import requests
from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator

from cv_builder.models import Resume


class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return (
                str(user.pk) + str(timestamp) + str(user.is_active)
        )


account_activation_token = AccountActivationTokenGenerator()

CF_API = "https://api.cloudflare.com/client/v4"


def _headers():
    return {
        "Authorization": f"Bearer {settings.CLOUDFLARE_TOKEN}",
        "Content-Type": "application/json"
    }


def _hostname(subdomain: str) -> str:
    return f"{subdomain}.{settings.CLOUDFLARE_DOMAIN}"


def _ensure_dns_cname(hostname: str, tunnel_uuid: str):
    """Upsert CNAME hostname -> <UUID>.cfargotunnel.com (proxied)."""
    zone_id = settings.CLOUDFLARE_ZONE_ID
    cname_target = f"{tunnel_uuid}.cfargotunnel.com"

    # Check if record exists
    r = requests.get(
        f"{CF_API}/zones/{zone_id}/dns_records",
        headers=_headers(),
        params={"type": "CNAME", "name": hostname, "per_page": 1}
    )
    r.raise_for_status()
    result = r.json()["result"]
    if result:
        rec = result[0]
        # Update only if needed
        if rec["content"] != cname_target or not rec.get("proxied", True):
            upd = requests.put(
                f"{CF_API}/zones/{zone_id}/dns_records/{rec['id']}",
                headers=_headers(),
                json={"type": "CNAME", "name": hostname, "content": cname_target, "proxied": True}
            )
            upd.raise_for_status()
    else:
        # Create
        crt = requests.post(
            f"{CF_API}/zones/{zone_id}/dns_records",
            headers=_headers(),
            json={"type": "CNAME", "name": hostname, "content": cname_target, "proxied": True}
        )
        crt.raise_for_status()

def _add_public_hostname_to_tunnel(hostname: str, service_url: str):
    """
    Append a public hostname route to the remote-managed tunnel without
    deleting existing routes. If the hostname already exists, update its service.
    """
    account_id = settings.CLOUDFLARE_ACCOUNT_ID
    tunnel_id = settings.CLOUDFLARE_TUNNEL_ID

    # 1) Fetch current remote config
    getc = requests.get(
        f"{CF_API}/accounts/{account_id}/cfd_tunnel/{tunnel_id}/configurations",
        headers=_headers()
    )
    getc.raise_for_status()
    res = getc.json()

    # Cloudflare returns {"success":..., "result": {"config": {...}}}
    result = (res or {}).get("result") or {}
    config = result.get("config") or {}
    ingress = list(config.get("ingress", []))  # copy to mutate safely

    # 2) If rule already exists: update service if different, else no-op
    for rule in ingress:
        if rule.get("hostname") == hostname:
            if rule.get("service") != service_url:
                rule["service"] = service_url
                break  # will PUT updated config below
            else:
                return  # already present; nothing to change
    else:
        # 3) Insert before the catch-all rule (one without hostname/path)
        catch_all_idx = next(
            (i for i, r in enumerate(ingress) if "hostname" not in r and "path" not in r),
            None
        )
        new_rule = {"hostname": hostname, "service": service_url}
        if catch_all_idx is None:
            ingress.append(new_rule)
            ingress.append({"service": "http_status:404"})  # ensure catch-all exists
        else:
            ingress.insert(catch_all_idx, new_rule)

    # 4) PUT the entire config back (preserve all other keys)
    config["ingress"] = ingress
    putc = requests.put(
        f"{CF_API}/accounts/{account_id}/cfd_tunnel/{tunnel_id}/configurations",
        headers=_headers(),
        json={"config": config},
    )
    putc.raise_for_status()

def _create_access_app(hostname: str):
    """
    Create a self-hosted Access app for the hostname.
    Note: You must add at least one Allow policy after creating the app,
    otherwise the app is deny-by-default.
    """
    account_id = settings.CLOUDFLARE_ACCOUNT_ID
    payload = {
        "name": hostname,
        "domain": hostname,  # primary hostname shown in App Launcher
        "type": "self_hosted",
        "session_duration": "24h",
        "app_launcher_visible": True
        # For multi-domain/path, use the newer `destinations` field instead of only `domain`.
    }
    resp = requests.post(
        f"{CF_API}/accounts/{account_id}/access/apps",
        headers=_headers(),
        json=payload
    )
    resp.raise_for_status()
    return resp.json()["result"]["id"]


def create_published_app_route(subdomain: str, service_url: str = "http://localhost:3001"):
    """
    1) DNS CNAME subdomain.example.com -> <TUNNEL_UUID>.cfargotunnel.com
    2) Add public hostname route inside the Cloudflare Tunnel
    3) Create an Access app (policies not included; add one separately)
    """
    hostname = _hostname(subdomain)
    _ensure_dns_cname(hostname, settings.CLOUDFLARE_TUNNEL_ID)
    _add_public_hostname_to_tunnel(hostname, service_url)
    app_id = _create_access_app(hostname)
    return {"hostname": hostname, "access_app_id": app_id}
