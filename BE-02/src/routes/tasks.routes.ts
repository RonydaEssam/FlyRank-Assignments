import express from 'express';
import { createTask, deleteTask, getAllTasks, getTask, updateTask } from '../handlers/tasks.js';

const tasksRouter = express.Router();

tasksRouter.get('/tasks', getAllTasks);
tasksRouter.get('/tasks/:id', getTask);
tasksRouter.post('/tasks', createTask);
tasksRouter.put('/tasks/:id', updateTask);
tasksRouter.delete('/tasks/:id', deleteTask);

export { tasksRouter };