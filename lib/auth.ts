import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'fallback-secret-key-for-development-only';

export async function hashPassword(password: string): Promise<string> {
    return await hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await compare(password, hashedPassword);
}

export function generateToken(userId: string, role: string): string {
    return sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string; role: string } | null {
    try {
        if (!token || typeof token !== 'string') {
            return null;
        }
        const decoded = verify(token, JWT_SECRET) as { userId: string; role: string };
        return decoded;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}
