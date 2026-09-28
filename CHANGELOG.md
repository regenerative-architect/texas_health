# Changelog

## 4.0.0 — 2026-09-28

- Replaced server-first remote collaboration with Trystero 0.25.3 direct-first WebRTC collaboration.
- Added Nostr default discovery plus selectable MQTT, BitTorrent and IPFS strategies.
- Added modern 0.25.x action-object messaging for presence, workspace snapshots and notices.
- Added peer-join snapshot synchronization for projects, tasks, comments, decisions and evidence.
- Added conflict-aware IndexedDB merging and conflict records.
- Added optional shared room-password support using Trystero session-description encryption.
- Added explicit TURN configuration with no bundled/default TURN credentials.
- Added same-device BroadcastChannel collaboration independent of Trystero/network access.
- Added default public Texas Health Commons presence room with explicit unverified-identity warnings and user disable control.
- Moved the previous Node/HTTP collaboration server into `legacy/http-sync` and added an optional Trystero WebSocket signaling relay under `legacy/ws-relay`.
- Moved WebLLM computation to a dedicated worker and added a deterministic no-model fallback.
- Added animated, accessible splash with connectivity/evidence/collaboration progression and immediate entry.
- Added focus/click/keyboard accessible explanatory tooltips.
- Added Simplified Advanced Guides: one-minute → actions → advanced → expert/implementation.
- Added Texas broadband/health-connectivity guidance, mapping guidance and expanded source-backed 2026 Texas health field information.
- Added v4 data reference file, expanded source registry, deployment docs and stronger static validation.

## 3.0.0 — 2026-09-28

- Preserved original 2026-09-27 health-access navigator as the functional base and legacy snapshot.
- Added Texas source-backed system snapshot.
- Added environmental/occupational health and school-health collaboration modules.
- Added cross-domain Texas health dependency map.
- Added workspaces, task board, decisions, comments and evidence collaboration records.
- Added BroadcastChannel same-device collaboration.
- Added optional authenticated revisioned multiplayer server with no npm dependencies.
- Added WebLLM/WebGPU local planning copilot adapter.
- Added PWA manifest, service worker, offline page and icons.
- Added machine-readable source/fact/system registries and JSON schemas.
- Added migration-tolerant imports for older backups.

## 2026.09.27

Original Texas Health Access Navigator OS baseline.
