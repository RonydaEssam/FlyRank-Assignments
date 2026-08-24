import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import { metaRouter } from './routes/meta.routes.js';
import { tasksRouter } from './routes/tasks.routes.js';
import './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openapiFile = fs.readFileSync(path.join(__dirname, 'openapi.yaml'), 'utf8');
const openapiSpec = YAML.parse(openapiFile);

const app = express();
const PORT = 3000;

app.use(express.json())

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.use('/', metaRouter);
app.use('/', tasksRouter);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})