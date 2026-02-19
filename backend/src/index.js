import { config } from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../.env') });
import { createServer } from './app.js';
import { initDatabase } from './models/snag.js';

const PORT = process.env.PORT || 3001;

initDatabase().then(() => {
  const app = createServer();
  app.listen(PORT, () => {
    console.log(`Snag Management API running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
