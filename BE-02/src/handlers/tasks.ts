import type { Request, Response } from "express";

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
    res.status(200).json({ tasks: tasks })
}

const getTask = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const task = tasks.find(t => t.id === id)

    if (!task) {
        res.status(404).json({ error: `Task with id (${id}) not found.` })
    }

    res.status(200).json({ task })
}

const createTask = (req: Request, res: Response) => {
    const { title } = req.body;

    if (!title || title.trim() === '' || typeof title !== 'string') {
        res.status(400).json({ error: 'Title is required and must not be empty.' })
    }

    const newTask: Task = { id: nextId++, title, done: false };
    tasks.push(newTask);

    res.status(201).json({ message: 'Task created successfully.', task: newTask })
}

const updateTask = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const task = tasks.find(t => t.id === id);

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

    if (title !== undefined) task.title = title;
    if (done !== undefined) task.done = done;

    res.status(200).json({ message: 'Task updated successfully.', task })
}

const deleteTask = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = tasks.findIndex(t => t.id === id);

    if (index === -1) {
        return res.status(404).json({ error: `Task with id (${id}) not found` });
    }

    tasks.splice(index, 1);
    res.status(204).send();
}

export { getAllTasks, getTask, createTask, updateTask, deleteTask };