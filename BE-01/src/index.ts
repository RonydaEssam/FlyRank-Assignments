import express from 'express';
import { error } from 'node:console';

const app = express();
const PORT = 3000;

app.use(express.json())

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

app.get('/', (req, res) => {
    res.status(200).json({
        name: 'Task Api',
        version: '1.0',
        endpoints: ['/tasks']
    });
})

app.get('/tasks', (req, res) => {
    res.status(200).json({ tasks: tasks })
})

app.get('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    const task = tasks.find(t => t.id === id)

    if (!task) {
        res.status(404).json({ error: `Task with id (${id}) not found.` })
    }

    res.status(200).json({ task })
})

app.post('/tasks', (req, res) => {
    const { title } = req.body;

    if (!title || title.trim() === '' || typeof title !== 'string') {
        res.status(400).json({ error: 'Title is required and must not be empty.' })
    }

    const newTask: Task = { id: nextId++, title, done: false };
    tasks.push(newTask);

    res.status(201).json({ message: 'Task created successfully.', task: newTask })
})

app.put('/tasks/:id', (req, res) => {
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
})

app.delete('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = tasks.findIndex(t => t.id === id);

    if (index === -1) {
        return res.status(404).json({ error: `Task with id (${id}) not found` });
    }

    tasks.splice(index, 1);
    res.status(204).send();
})

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' })
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})