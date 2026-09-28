/* Texas Health Navigator OS runtime configuration. No secrets belong here. */
window.TXH_CONFIG = Object.freeze({
  version: '4.0.0',
  collaborationApi: (location.protocol === 'http:' || location.protocol === 'https:') ? location.origin : '',
  syncIntervalMs: 5000,
  trysteroVersion: '0.25.3',
  trysteroAppId: 'texas-health-navigator-os-v4',
  publicRoomId: 'texas-health-commons-public-v1',
  publicRoomAutoJoin: true,
  p2pDefaultStrategy: 'nostr',
  // TURN is deliberately empty by default. Add your own ICE server objects only when direct WebRTC cannot traverse a NAT/firewall.
  // Example: [{urls:['turn:turn.example.org:3478'],username:'...',credential:'...'}]
  turnConfig: [],
  webllmVersion: '0.2.85',
  webllmModuleUrl: 'https://esm.run/@mlc-ai/web-llm@0.2.85',
  webllmWorkerUrl: './modules/webllm-worker.js',
  maxSharedPayloadBytes: 1500000,
  languageCoverage: {en:'full core UI', es:'core navigation and safety; technical modules partially translated'}
});
