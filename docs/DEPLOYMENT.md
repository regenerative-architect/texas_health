# Deployment

## Static PWA (recommended default)

Any ordinary HTTPS static host can serve the application. No centralized collaboration backend is required for Trystero/WebRTC.

For local development:

```bash
npm start
```

Then open `http://127.0.0.1:8787/`.

The bundled server intentionally does not serve files under `legacy/`.

## HTTPS

Production PWA/service-worker use requires HTTPS. `localhost` / `127.0.0.1` are acceptable secure-context development exceptions in modern browsers.

## Content Security Policy

Trystero discovery and WebLLM require external network connections in the default CDN-based build. The sample static server allows HTTPS and WSS connections and the configured ESM CDNs. Institutional deployments should narrow the CSP to vetted endpoints or vendor/self-host dependencies.

## TURN

No TURN service is configured. Add administrator-controlled ICE server objects to `TXH_CONFIG.turnConfig` only if representative network testing demonstrates that direct WebRTC cannot connect.

Do not commit permanent TURN credentials into a public repository. Prefer an operational process that issues short-lived credentials where supported.

## Legacy HTTP synchronization adapter

The old centralized prototype remains under `legacy/http-sync`. It is optional and is not the default multiplayer architecture.

```bash
npm run legacy:http
```

It must not be treated as a regulated clinical system.

## Optional self-hosted Trystero WebSocket relay

The `legacy/ws-relay` directory demonstrates Trystero's self-hosted signaling relay. It is not installed by the root project.

```bash
cd legacy/ws-relay
npm install
npm start
```

To use it from the client, add the ws-relay strategy package/client configuration intentionally; the default user-facing choices remain Nostr, MQTT, BitTorrent and IPFS as requested.

## Deployment checks

Before institutional use, test:

- service-worker update/recovery;
- browsers/devices actually used by staff and families;
- WebRTC across representative firewalls/NATs/VPNs;
- TURN behavior if configured;
- CSP under the final host;
- keyboard/screen-reader/mobile accessibility;
- storage quotas and backup/restore;
- public-room privacy controls;
- conflict resolution under concurrent edits;
- WebLLM model compatibility and memory usage;
- privacy/security/compliance boundaries for the actual data policy.
