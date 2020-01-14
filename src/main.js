import App from './App.svelte';

const app = new App({
  target: document.body,
  props: {
    turn: 0,
    moves: [],
    game: Array.from('♖♗♘♕♔♗♘♖♙♙♙♙♙♙♙♙                                ♟♟♟♟♟♟♟♟♜♞♝♛♚♝♞♜')
  }
});

export default app;
