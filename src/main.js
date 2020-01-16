import App from './App.svelte';
import { Game } from './chess.js';

const app = new App({
  target: document.body,
  props: {
    game: new Game()
  }
});

export default app;
