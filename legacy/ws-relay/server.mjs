/* Optional legacy/self-hosted Trystero WebSocket signaling relay.
   This relay is NOT the workspace data path after peers connect; WebRTC still carries room traffic. */
import { createWsRelayServer } from '@trystero-p2p/ws-relay/server';
const port=Number(process.env.PORT||8080);
createWsRelayServer({port});
console.log(`Optional Trystero WebSocket signaling relay listening on ${port}`);
