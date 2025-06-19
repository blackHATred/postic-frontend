import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

const buildPath = path.join(__dirname, 'build');

app.use(express.static(buildPath));

// роутинг
app.get('/*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
  console.log(`Serving static files from ${buildPath}`);
});
