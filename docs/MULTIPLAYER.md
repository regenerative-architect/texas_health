# Trystero / WebRTC Multiplayer Architecture

## Design objective

The default collaboration model is **local-first and direct-first**. It is intended for cross-domain Texas health-access work among families, navigators, clinics, public-health teams, schools, universities, municipalities/counties, nonprofits, businesses, employers, infrastructure operators and other collaborators.

The shared data plane is deliberately separated from personal health stores.

### Shareable workspace records

- workspace title, geography, objective and disciplines;
- non-sensitive project records;
- tasks;
- comments;
- decisions/rationales;
- evidence/provenance records.

### Local-only by default

- medications;
- diagnoses entered by the user;
- insurance/account details;
- household health profiles;
- appointments and personal follow-up records;
- pregnancy/disability information tied to an identifiable person;
- emergency contacts and other sensitive household health details.

## Layer 1 — IndexedDB

Each browser keeps its own durable local copy. Peer networking is an additional synchronization path, not the source of truth for a user's private health records.

## Layer 2 — BroadcastChannel

Joining a workspace first creates a same-device room derived from a SHA-256 digest of the room ID + optional password. Browser tabs/windows on the same origin can exchange presence and snapshots without Trystero or Internet access.

This is a fallback and a useful test mode; it is not cross-device networking.

## Layer 3 — Trystero 0.25.3

The client intentionally pins Trystero 0.25.3.

Discovery strategies exposed in the UI:

1. Nostr — default;
2. MQTT;
3. BitTorrent;
4. IPFS.

The strategy is used for peer discovery/signaling. Once a WebRTC connection exists, workspace action data moves through WebRTC data channels.

The application uses the 0.25.x object action interface:

```js
const snapshot = room.makeAction('snapshot')
snapshot.onMessage = (data, {peerId}) => { /* merge */ }
await snapshot.send(data, {target: peerId})
```

## Public commons

By default the application joins `texas-health-commons-public-v1` using Nostr. The public room sends only ephemeral presence profile fields:

- random peer/instance identifier;
- display alias;
- disciplinary role;
- optional organization label;
- an explicit `verified: false` marker.

No workspace snapshot is automatically published to the public room.

A user can disable public auto-join from the collaboration screen.

## Room password

A workspace can pass a shared `password` to Trystero. Trystero documents this as a stronger way to derive the encryption key used for session descriptions exchanged via the discovery medium. All intended peers need the same secret.

This is **not** organizational identity, per-person authentication or role-based authorization. Exchange shared secrets outside the room and rotate them when membership changes.

The browser app keeps the room password in `sessionStorage` rather than persistent localStorage.

## Peer snapshot synchronization

When a peer joins:

1. peers exchange presence;
2. an existing peer sends its current selected workspace snapshot;
3. incoming records are merged by stable record ID and timestamp;
4. newer records replace older copies;
5. equal-timestamp divergent payloads create a `syncConflicts` record for manual review;
6. a deterministic representation is used temporarily so the workspace can continue operating;
7. later local mutations schedule another snapshot broadcast.

This is intentionally simple eventual consistency, not a CRDT and not a transactionally consistent clinical database.

## TURN: explicit fallback

Direct WebRTC cannot traverse every NAT/firewall configuration. Trystero documents `turnConfig` for the cases where SDP exchange succeeds but peers still cannot establish a direct connection.

The bundle ships with:

```js
turnConfig: []
```

Administrators may add their own `RTCIceServer` entries in `config.js`. TURN traffic is used only for peer pairs that require it. Workspace traffic remains WebRTC-encrypted, but a TURN operator can observe connection metadata/traffic volume and relays ciphertext, so choose infrastructure and governance appropriately.

## Discovery vs TURN vs legacy server

- **Discovery strategy**: helps peers find one another and exchange connection information.
- **WebRTC**: carries peer room application traffic.
- **TURN**: relays WebRTC when direct ICE connectivity fails.
- **BroadcastChannel**: same-device/offline fallback.
- **legacy/http-sync**: old centralized workspace persistence adapter retained for compatibility.
- **legacy/ws-relay**: optional self-hosted Trystero discovery/signaling relay; not the post-connection workspace data path.

## Production hardening

For institutional deployments, add or review:

- organization identity (OIDC/SSO) if verified identity is required;
- explicit authorization and workspace membership governance;
- room-secret lifecycle and revocation;
- managed TURN where network policy requires it;
- CSP and supply-chain pinning/self-hosting;
- data-classification policy preventing PHI in P2P rooms;
- retention/export/deletion procedures;
- security and privacy impact assessment;
- abuse/reporting/moderation process for public discovery rooms;
- accessibility testing;
- end-to-end tests across representative hospital, school, home, mobile and public-network NAT/firewall conditions.

Do not claim this bundle is an EHR, patient portal or HIPAA-compliant clinical messaging system.
