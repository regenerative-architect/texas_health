# Texas Health Access Navigator OS v4.0.0

A public-ready, local-first Texas health-access navigation and multidisciplinary collaboration suite. It combines individual/family navigation with community and institutional planning across health, mobility, broadband, housing, food, water, energy, education, accessibility and resilience.

## Safety boundary

This project supports healthcare-access navigation, education, planning and public-health coordination. It does **not** diagnose, prescribe, change medication doses, guarantee program eligibility, replace clinicians or delay emergency care. In the U.S., call 911 for a life-threatening emergency; call/text 988 for suicide or mental-health crisis support.

Shared peer rooms are for **non-sensitive project coordination**, not clinical records. Do not put patient names, diagnoses, medication lists, insurance identifiers, pregnancy/disability details or other protected/sensitive health information into public or peer rooms. Peer IDs, aliases, roles and organization names are self-asserted and are **not verified identities**.

## What changed in v4

- Added **Trystero 0.25.3** decentralized peer discovery and direct browser-to-browser WebRTC collaboration.
- Uses **Nostr discovery by default** with selectable MQTT, BitTorrent and IPFS strategies through Trystero's shared room/action API.
- Uses the modern **0.25.x action-object API** (`room.makeAction(...)`, `.send(...)`, `.onMessage`).
- Added peer snapshot synchronization for workspaces, projects, tasks, comments, decisions and evidence when participants join.
- Added conflict-aware IndexedDB record merging and a local conflict-review queue.
- Added **same-device BroadcastChannel fallback** that works without Trystero or Internet connectivity.
- Added an optional shared Trystero `password` for stronger SDP/session-description encryption. Passwords remain in session storage.
- Added an explicitly configurable **TURN fallback**. No TURN credentials are bundled; direct WebRTC is attempted first.
- Retained the previous Node/HTTP synchronization server only as an optional legacy adapter and added an optional self-hosted Trystero WebSocket signaling relay.
- Added a dedicated-worker **WebLLM 0.2.85** architecture using `WebWorkerMLCEngineHandler` / `CreateWebWorkerMLCEngine`, IndexedDB model caching and a deterministic non-model planning fallback.
- Added an animated splash experience with connectivity → evidence → collaboration progression, network rings, loading track, reduced-motion support and immediate entry.
- Added keyboard/focus/click accessible explanatory tooltips for room IDs, discovery strategy, room passwords, disciplinary roles and peer networking.
- Added **Simplified Advanced Guides** with four levels: one-minute explanation → actionable steps → advanced explanation → expert/implementation detail.
- Added guides for Texas health collaboration, Trystero/WebRTC, Texas broadband-project status, mapping challenges, multidisciplinary project design, WebLLM, PWA/offline architecture and evidence/provenance.
- Expanded Texas-specific operational information covering Medicaid transportation, health centers, aging/disability navigation, Medicare counseling, shortage designations, CHWs, maternal-health data, rural pediatric tele-connectivity, BEAD, hospital price transparency, school health, environmental health and medical-bill rights.
- Preserved the original local-first records, calculators, scenario tools, source registry, evidence system, exports/imports, accessibility controls and PWA shell.

## Bundle tree

```text
texas_health_navigator_os_bundle/
├── index.html
├── config.js
├── manifest.webmanifest
├── sw.js
├── offline.html
├── package.json
├── README.md
├── CHANGELOG.md
├── LICENSE
├── SHA256SUMS.txt
├── assets/
│   └── suite.css
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
├── modules/
│   ├── advanced-suite.js
│   ├── collab-client.js
│   ├── p2p-collab.js
│   ├── suite-enhancements.js
│   ├── webllm-adapter.js
│   └── webllm-worker.js
├── data/
│   ├── cross-domain-system.json
│   ├── source-registry.json
│   ├── texas-health-facts.json
│   └── texas-health-reference-2026.json
├── schemas/
│   ├── backup.schema.json
│   ├── sync-conflict.schema.json
│   └── workspace.schema.json
├── docs/
│   ├── DATA-SOURCES.md
│   ├── DEPLOYMENT.md
│   ├── MULTIPLAYER.md
│   ├── SECURITY-PRIVACY.md
│   ├── SIMPLIFIED-ADVANCED-GUIDES.md
│   ├── TESTING.md
│   └── WEBLLM.md
├── tools/
│   └── static-server.mjs
├── tests/
│   ├── broadcastchannel-smoke.mjs
│   └── validate.mjs
└── legacy/
    ├── texas-health-access-navigator-os-2026-09-27.html
    ├── http-sync/
    │   ├── package.json
    │   └── server.mjs
    └── ws-relay/
        ├── package.json
        └── server.mjs
```

## Fastest start

Requires Node 20+ only for the included local static server.

```bash
npm start
```

Open `http://127.0.0.1:8787/`.

The normal application does **not** require the legacy synchronization server.

### Standalone `file://`

Opening `index.html` directly still provides much of the educational, calculator and local-data experience. However:

- a service worker does not run under `file://`;
- installable PWA behavior requires HTTPS or localhost;
- Trystero CDN modules and Internet discovery require connectivity;
- BroadcastChannel same-device room traffic can still work when the browser permits it for the local-file context;
- WebLLM package/model downloads require connectivity for first use and WebGPU-capable browser support;
- live official directories and source pages are online-only.

## Trystero / WebRTC collaboration

1. Open **Peer Collaboration**.
2. Create or select a workspace.
3. Choose a display alias and disciplinary role. These are labels, not verified identity.
4. Use a room ID. For intended/private working groups, use a non-obvious room ID plus a shared password exchanged outside the app.
5. Choose discovery: Nostr (default), MQTT, BitTorrent or IPFS.
6. Join the room. A same-device BroadcastChannel room activates first; Trystero then attempts Internet peer discovery when online.
7. Existing peers send their current workspace snapshot to a new peer. Subsequent project/task/comment/decision/evidence changes trigger debounced snapshot synchronization.
8. Review any equal-timestamp divergent records in **Conflict review**.

Trystero's discovery medium exchanges peer connection information. After peers connect, application room traffic uses WebRTC data channels. This bundle pins `0.25.3` as requested even if a newer upstream release exists.

### Public commons

The app auto-joins `texas-health-commons-public-v1` through Nostr by default. It broadcasts **presence only**; it does not automatically publish workspace records. Disable the public commons from Peer Collaboration if desired.

### TURN

WebRTC cannot establish direct connectivity across every NAT/firewall combination. `config.js` deliberately ships with:

```js
turnConfig: []
```

If an administrator supplies TURN credentials, Trystero can relay traffic for peer pairings that cannot connect directly. TURN is a fallback, not hidden infrastructure, and is different from peer discovery.

See `docs/MULTIPLAYER.md`.

## WebLLM

The Local WebLLM Copilot uses a **dedicated Web Worker** so model inference does not run on the main UI thread. The worker imports the pinned WebLLM 0.2.85 package. Model artifacts can be cached in IndexedDB through WebLLM's documented cache backend.

If WebGPU, a worker, a model or network access is unavailable, the app provides a deterministic local planning scaffold rather than fabricating an AI response.

Do not use the copilot for diagnosis, prescribing, medication changes or definitive eligibility decisions. Verify generated factual claims against current sources.

See `docs/WEBLLM.md`.

## PWA and offline behavior

The versioned service worker precaches the application shell, local data registries, icons and modules. It does **not** pretend that uncached official websites, Trystero discovery infrastructure or model downloads work offline.

Offline-capable functions include bundled education, calculators, local records, saved plans/projects, search over bundled material, exports and same-device collaboration where the browser supports BroadcastChannel.

## Local data sovereignty

IndexedDB holds structured application data. localStorage is used for lightweight preferences; a room password is kept only in sessionStorage. Users can export/import validated JSON, hash exports with SHA-256, reset selected stores and retain local operation without an account.

SHA-256 can demonstrate that bytes have not changed. It does not by itself prove authorship, identity or creation time.

## Current Texas content

The source registry prioritizes Texas HHSC/DSHS, Texas Broadband Development Office, TCEQ, TxDOT, CMS, HRSA, CDC and other authoritative sources. The 2026 reference file includes retrieval dates, evidence class, limitations and operational relevance.

The application intentionally distinguishes:

- **FACT** — supported by cited/registered evidence;
- **INFERENCE** — reasoned interpretation;
- **MODEL/SCENARIO** — simplified planning output;
- **HYPOTHESIS** — unverified proposition.

Never treat a bundled date-sensitive fact as permanently current. Recheck the linked source before consequential decisions.

## Testing

Run:

```bash
npm test
```

The validator checks required files, JSON/manifest validity, local references, version consistency, Trystero/WebLLM integration markers, service-worker precache references, P2P action-object usage and required guide/splash features. `npm test` also runs a Node BroadcastChannel smoke test.

Browser-to-browser WebRTC across independent networks requires real browsers and network conditions and is **not** claimed tested by the static validator. See `docs/TESTING.md` for the exact packaging-time test record, including the inconclusive Chromium attempt.

## Deployment

For a simple local or static-host preview:

```bash
HOST=0.0.0.0 PORT=8787 npm start
```

For production, serve the static PWA over HTTPS. Review CSP, vendor/pin third-party modules if your organization requires supply-chain control, provide TURN only when needed, and perform security/accessibility/privacy testing appropriate to the deployment.

The optional legacy HTTP synchronization adapter can be started with:

```bash
npm run legacy:http
```

The optional Trystero WebSocket **discovery/signaling** relay has its own dependency and is not required by the default Nostr strategy:

```bash
cd legacy/ws-relay
npm install
npm start
```

See `docs/DEPLOYMENT.md`.

## Accessibility and language

The interface targets WCAG 2.2 AA practices: semantic landmarks, keyboard navigation, visible focus, large targets, reduced motion, scalable text, accessible forms/dialogs, focus-capable tooltips and print styles. This is not a formal accessibility certification.

English is the complete core experience. Spanish translation coverage is partial in technical v4 modules and is labeled accordingly.

## Zero-harm / anti-inversion

The system is intended to improve access, continuity, literacy, affordability, resilience, evidence quality and cooperation. It must not be used to diagnose people, discriminate, conceal uncertainty, weaponize vulnerability data, bypass safety requirements or convert planning metrics into judgments of human worth.

## Attribution

Systems architecture/concept: **Foster + Navi / Planetary Restoration Archive**.

Trystero, WebLLM and external sources remain under their own licenses/terms. This project uses their public APIs/integration patterns and does not copy proprietary source code.
