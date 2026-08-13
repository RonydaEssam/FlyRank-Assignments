import express from 'express';

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.status(200).json({
        name: 'Task Api',
        version: '1.0',
        endpoints: ['/tasks']
    });
})

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' })
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})