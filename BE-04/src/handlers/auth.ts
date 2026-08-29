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

const protectedProfile = async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] === '') {
        return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    res.status(200).json({
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at
    });
}

export { signup, login, publicInfo, protectedProfile };