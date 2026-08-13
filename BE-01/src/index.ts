import express from 'express';

const app = express();
const PORT = 3000;

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

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' })
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})