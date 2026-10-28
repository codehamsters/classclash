# ClassClash

Live at https://classclash.hokora.xyz

Silent multiplayer games for friends sitting apart in the same classroom. One person starts a room and shares the 4-letter code. Everyone else types it in and plays. No sign-up, no sound. A Hide button (or Esc) swaps the screen for fake lecture notes.

Games: Tic-Tac-Toe, Connect Four, Reversi, Battleship (2 players), plus Dots & Boxes, Hangman and Memory (2 to 6 players).

## How it works

There is no database. Besides static files, Vercel runs one tiny route, `/api/ice`, that hands out short-lived TURN credentials.

- Peers find each other through public Nostr relays ([Trystero](https://github.com/dmotz/trystero)), then talk directly over WebRTC. The room code also works as the encryption password for the handshake.
- The room creator is the host. The host checks every move, broadcasts the full room state, and is the only one who can end a game early (others can leave). Every peer keeps the latest state, so if the host leaves, the next player to have joined takes over.
- Game rules are pure functions in `src/games/*.ts`: `init(players)` and `move(state, seat, move) → next | null`.

Known limits:
- Every peer receives the whole state, so a player could read hidden info (Battleship ships, the Hangman word) in devtools.
- Without TURN, peers on different networks (one on mobile data, one on Wi-Fi) or on client-isolated Wi-Fi often can't connect. The joining screen then says so instead of claiming the room is empty. Set the TURN env vars below to fix this.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000. Open two tabs to play yourself.
npm test        # game rule tests (node:test)
npm run build
```

Deploy by importing the repo into Vercel. To let players on different networks connect, create a free TURN key in Cloudflare (Dashboard → Realtime → TURN Server) and set:

- `CF_TURN_KEY_ID`: the TURN key ID
- `CF_TURN_API_TOKEN`: the key's API token

Without them the app still works, but only between players who can reach each other directly.
