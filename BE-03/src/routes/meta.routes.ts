import express from 'express';
import { health, root } from '../handlers/meta.js';

const metaRouter = express.Router();

metaRouter.get('/', root);

metaRouter.get('/health', health);

export { metaRouter }