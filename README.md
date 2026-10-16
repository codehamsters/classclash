# ClassClash

Silent multiplayer games for friends sitting apart in the same classroom. One person starts a room and shares the 4-letter code. Everyone else types it in and plays. No sign-up, no sound. A Hide button (or Esc) swaps the screen for fake lecture notes.

Games: Tic-Tac-Toe, Connect Four, Reversi, Battleship (2 players), plus Dots & Boxes, Hangman and Memory (2 to 6 players).

## How it works

There is no backend and no database. Vercel only serves static files.

- Peers find each other through public Nostr relays ([Trystero](https://github.com/dmotz/trystero)), then talk directly over WebRTC. The room code also works as the encryption password for the handshake.
- The host is whichever present player has the lowest peer id. The host checks every move and broadcasts the full room state. Every peer keeps the latest state, so if the host leaves, the next player takes over.
- Game rules are pure functions in `src/games/*.ts`: `init(players)` and `move(state, seat, move) → next | null`.

Known limits:
- Every peer receives the whole state, so a player could read hidden info (Battleship ships, the Hangman word) in devtools.
- Strict networks that block WebRTC or relay websockets, such as some school Wi-Fi, can stop peers from connecting. If that happens, players can switch to mobile data. Adding a TURN server (`turnConfig` in `src/lib/room.ts`) would fix it.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000. Open two tabs to play yourself.
npm test        # game rule tests (node:test)
npm run build
```

Deploy by importing the repo into Vercel. No env vars needed.
