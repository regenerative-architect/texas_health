# Validation Report — v4.0.0

Build date: 2026-09-28.

## Passed in the packaging environment

- `node --check` on every bundled `.js` and `.mjs` file.
- `npm test` static validator:
  - required-file inventory;
  - manifest and bundled JSON parsing;
  - v4 version consistency;
  - index/config linkage;
  - inline-script compilation;
  - Trystero 0.25.3 and action-object integration markers;
  - Nostr/MQTT/BitTorrent/IPFS strategy references;
  - password / TURN / join-error / snapshot markers;
  - splash, guide and public-room markers;
  - reduced-motion CSS;
  - WebLLM dedicated-worker and IndexedDB-cache markers;
  - service-worker precache path existence;
  - required source-registry entries.
- Node BroadcastChannel smoke test successfully transmitted a structured presence payload between two channels.
- Local HTTP smoke test returned the application, v4 manifest and P2P client asset successfully.
- Legacy HTTP adapter `/api/health` returned a successful v4 legacy-service response.
- ZIP archive integrity tested after packaging.

## Attempted but not passed

A Chromium headless DOM smoke test was attempted through the local HTTP server. Chromium timed out in this container because its DBus environment is unavailable and produced no DOM. This is recorded as **inconclusive**, not passed.

## Not claimed tested

- live Trystero peer discovery across two independent browsers/networks;
- NAT traversal across representative ISPs/hospital/school/VPN networks;
- a configured TURN server (none is bundled);
- all four public discovery strategies against their live infrastructure;
- WebLLM model download/inference on a real WebGPU device;
- formal WCAG 2.2 AA conformance audit;
- HIPAA or other regulatory compliance;
- production penetration/security testing.

Those require deployment-specific browsers, networks, hardware, identity/privacy policy and infrastructure.
