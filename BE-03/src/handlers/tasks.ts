import type { Request, Response } from "express";
import { pool as db } from "../db.js";

interface Task {
    'id': number,
    'title': string,
    'done': boolean
}

const tasks: Task[] = [
    { id: 1, title: 'Prepare working environment', done: true },
    { id: 2, title: 'Create first endpoint', done: true },
    { id: 3, title: 'Update endpoint', done: false }
]

const getAllTasks = async (req: Request, res: Response) => {
    const data = await db.query('SELECT * FROM tasks');
    res.status(200).json({ tasks: data.rows })
}

const getTask = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const data = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    const task = data.rows[0];

    if (!task) {
        return res.status(404).json({ error: `Task with id (${id}) not found.` })
    }

    res.status(200).json({ task })
}

const createTask = async (req: Request, res: Response) => {
    const { title } = req.body;

    if (!title || title.trim() === '' || typeof title !== 'string') {
        return res.status(400).json({ error: 'Title is required and must not be empty.' })
    }

    const result = await db.query(
        'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *',
        [title, false]
    );

    const newTask = result.rows[0];

    res.status(201).json({ message: 'Task created successfully.', task: newTask })
}

const updateTask = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const taskData = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    const task: Task | undefined = taskData.rows[0];

    if (!task) {
        return res.status(404).json({ error: `Task with id (${id}) not found.` })
    }

    const { title, done } = req.body;

    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
        return res.status(400).json({ error: 'Title must not be empty' });
    }
    if (done !== undefined && typeof done !== 'boolean') {
        return res.status(400).json({ error: 'Done must be a boolean' });
    }

    const newTitle = title !== undefined ? title : task.title;
    const newDone = done !== undefined ? (done ? 1 : 0) : task.done;

    const result = await db.query(
        'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *',
        [newTitle, newDone, id]
    );
    const updatedTask = result.rows[0];

    res.status(200).json({ message: 'Task updated successfully.', updatedTask })
}

const deleteTask = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const task = await db.query('Delete FROM tasks WHERE id = $1', [id]);

    if (task.rowCount === 0) {
        return res.status(404).json({ error: `Task with id (${id}) not found` });
    }

    res.status(204).send();
}

export { getAllTasks, getTask, createTask, updateTask, deleteTask };