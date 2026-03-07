// ─── User types & demo accounts ───────────────────────────────────────────────
export type UserRole = 'admin' | 'analyst';

export interface User {
    id: string;
    name: string;
    email: string;
    password: string; // plain text — MVP demo only
    role: UserRole;
}

export const DEMO_USERS: User[] = [
    {
        id: 'u1',
        name: 'Admin',
        email: 'admin@politisense.ai',
        password: 'Admin@123',
        role: 'admin',
    },
    {
        id: 'u2',
        name: 'Analyst',
        email: 'analyst@politisense.ai',
        password: 'Analyst@123',
        role: 'analyst',
    },
];

// ─── Registered users (DEMO_USERS + signups stored in memory) ─────────────────
// In a real app this would be a database. Here we start with demo accounts.
let registeredUsers: User[] = [...DEMO_USERS];

// ─── Session (localStorage) ───────────────────────────────────────────────────
const SESSION_KEY = 'ps_session_user_id';

export function getSessionUser(): User | null {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    return registeredUsers.find(u => u.id === id) ?? null;
}

export function login(email: string, password: string): User | null {
    const user = registeredUsers.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (user) localStorage.setItem(SESSION_KEY, user.id);
    return user ?? null;
}

export function logout(): void {
    localStorage.removeItem(SESSION_KEY);
}

export function signup(name: string, email: string, password: string): User | null {
    const exists = registeredUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return null; // duplicate email
    const newUser: User = {
        id: `u${Date.now()}`,
        name,
        email,
        password,
        role: 'analyst',
    };
    registeredUsers = [...registeredUsers, newUser];
    localStorage.setItem(SESSION_KEY, newUser.id);
    return newUser;
}
