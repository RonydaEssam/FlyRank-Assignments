import type { Request, Response } from "express";
import { db } from "../db.js";

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

let nextId = 4;

const getAllTasks = (req: Request, res: Response) => {
    const data = db.prepare('SELECT * FROM tasks').all();
    res.status(200).json({ tasks: data })
}

const getTask = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const data = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

    if (!data) {
        return res.status(404).json({ error: `Task with id (${id}) not found.` })
    }

    res.status(200).json({ data })
}

const createTask = (req: Request, res: Response) => {
    const { title } = req.body;

    if (!title || title.trim() === '' || typeof title !== 'string') {
        return res.status(400).json({ error: 'Title is required and must not be empty.' })
    }

    const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
    const result = insert.run(title, 0);

    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid)

    res.status(201).json({ message: 'Task created successfully.', task: newTask })
}

const updateTask = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task | undefined;

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

    db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(newTitle, newDone, id);

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

    res.status(200).json({ message: 'Task updated successfully.', updatedTask })
}

const deleteTask = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

    if (task === -1) {
        return res.status(404).json({ error: `Task with id (${id}) not found` });
    }

    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);

    res.status(204).send();
}

export { getAllTasks, getTask, createTask, updateTask, deleteTask };