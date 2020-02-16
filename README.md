![](https://github.com/direvus/chess/workflows/Node%20CI/badge.svg)

---

# Chess

*HOW ABOUT A NICE GAME OF CHESS?  -- WOPR*

This is a chess library and interactive chessboard web application written
using [Svelte](https://svelte.dev) and WebSocket.

This is **not** a program that plays chess.  It is a program that enables
humans to play chess.

## Features

The application supports:

- Online (WebSocket) or offline (hotseat) play.
- The full set of chess move logic.
- Import and export using Portable Game Notation (PGN).
- Move history and time travel.
- Automatically detect checkmate and stalemate.
- Board rotation.
- Game tags.
- Move annotations (import/export only).

## Absent features

The application currently does not support:

- Game clock / move timing.
- Import/export in formats other than PGN.
