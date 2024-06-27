import { db } from '../db/initDatabase.mjs';

export const getUsers = async (req, res) => {
    await db.read();
    res.send(db.data.users || []);
};

export const addUser = async (req, res) => {
    const { body } = req;
    const newId = body.username.trim().toLowerCase();
    const existingUser = db.data.users?.find(u => u.id === newId);

    if (existingUser) {
        res.sendError("User already exists");
        return;
    }

    body.id = newId;
    await db.read();
    db.data.users.push(body);
    await db.write();
    res.sendSuccess();
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    const existingUser = db.data.users?.find(u => u.id === id);

    if (!existingUser) {
        res.sendError("User not found");
        return;
    }

    await db.read();
    const index = db.data.users.findIndex(u => u.id === id);
    db.data.users[index] = body;
    await db.write();
    res.sendSuccess();
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    await db.read();
    db.data.users = db.data.users.filter(u => u.id !== id);
    await db.write();
    res.sendSuccess();
};
