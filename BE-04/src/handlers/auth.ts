import type { Request, Response } from "express";
import { supabase } from "../supabase.js";

const signup = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ user: data.user });
}

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return res.status(401).json({ error: 'Invalid login credentials' });
    }

    res.status(200).json({
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token
    });
}

const publicInfo = (req: Request, res: Response) => {
    res.status(200).json({ message: 'Welcome stranger! This info is public.' });
}

const protectedProfile = (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] === '') {
        return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];

    // Not verifying the token yet, that's Stage 3.
    res.status(200).json({ message: 'Token received (not yet verified)' });
}

export { signup, login, publicInfo, protectedProfile };