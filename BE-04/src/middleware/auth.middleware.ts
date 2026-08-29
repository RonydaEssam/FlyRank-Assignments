import type { Request, Response, NextFunction } from "express";
import { supabase } from "../supabase.js";

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email?: string;
        created_at: string;
    };
}

const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] === '') {
        return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = {
        id: data.user.id,
        created_at: data.user.created_at,
        ...(data.user.email ? { email: data.user.email } : {})
    };

    next();
}

export { requireAuth };
export type { AuthenticatedRequest };