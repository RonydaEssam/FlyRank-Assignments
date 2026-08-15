import type { Request, Response } from "express";

const root = (req: Request, res: Response) => {
    res.status(200).json({
        name: 'Task Api',
        version: '1.0',
        endpoints: ['/tasks']
    });
}

const health = (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' })
}

export { root, health };