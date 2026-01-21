import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

export function generateToken(user: any): string {
    const tokenData = {
        id: user._id || user.id,
        role: user.role,
        organizationId: user.organizationId,
        timestamp: Date.now()
    };
    return Buffer.from(JSON.stringify(tokenData)).toString('base64');
}

export function verifyToken(token: string): any {
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        return JSON.parse(decoded);
    } catch (error) {
        return null;
    }
}
