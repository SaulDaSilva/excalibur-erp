# Pilot Access Checklist

This checklist covers the minimum secure path for letting additional family members or staff operate the private ERP over Tailscale.

## 1. Tailscale network access
Do these actions in the Tailscale admin console:

1. Enable device approval.
2. Invite each person using their own email address.
3. Create a group named `erp-users`.
4. Add only approved people to `erp-users`.
5. Apply a grants policy based on `docs/tailscale-grants.example.hujson` so only `erp-users` can reach the ERP host on HTTPS.

Recommended rule:
- ERP users get access only to the ERP host over `tcp:443`
- they should not automatically get broad access to every device in the tailnet

## 2. Device approval and client setup
For each person:

1. Install Tailscale on their laptop or phone.
2. Sign in with the invited Tailscale account.
3. Approve the device in the Tailscale admin console.
4. Verify they can resolve the ERP hostname, for example:
   - `https://excalibur-erp.<tailnet>.ts.net`

Do not allow access from shared or untrusted devices.

## 3. Create the ERP user
VPN access is not enough. Each person also needs a Django user.

Use the helper script on the private host:

```bash
./scripts/create_internal_user.sh usuario1 strong-password VENTAS user@example.com Nombre Apellido
```

Valid roles:
- `ADMIN`
- `VENTAS`
- `BODEGA`
- `GERENCIA`

To create an admin user:

```bash
./scripts/create_internal_user.sh adminuser strong-password ADMIN admin@example.com Admin Principal --admin
```

Rules:
- one ERP user per person
- do not share accounts
- keep superusers limited to trusted operators only

## 4. First-login checklist
For each new user, verify:
- they can open the private ERP URL from a Tailscale-approved device
- they can log in with their own ERP account
- they only have the role they need
- they know the URL and who to contact if access fails

## 5. Disable access cleanly
If someone should stop using the ERP:

1. Remove them from `erp-users` in Tailscale.
2. Disable or rotate their ERP account inside Django.
3. Revoke or remove any untrusted device they used.

## 6. Minimum operating discipline
For the pilot, keep these controls in place:
- only you hold Django superuser initially unless there is a real second admin need
- back up Postgres daily
- do not use the ERP from devices that are not joined to the tailnet
- do not publish the ERP publicly or enable Tailscale Funnel
