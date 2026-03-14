import { config } from 'dotenv';
import { createApp } from './app.js';

config({
  path: new URL('../../../.env', import.meta.url)
});

const app = createApp();
const port = Number(process.env.API_PORT || 4000);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
