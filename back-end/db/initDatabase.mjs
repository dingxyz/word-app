import { Low, JSONFile } from 'lowdb';

const adapter = new JSONFile('db.json');
export const db = new Low(adapter);

export async function initDatabase() {
    await db.read();
    db.data ||= { words: [], users: [] };
    await db.write();
}
