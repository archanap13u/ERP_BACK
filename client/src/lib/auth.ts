import bcrypt from 'bcryptjs';

/**
 * Hash a plain text password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a plain text password against a hashed password
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

/**
 * Generate a simple session token (for demonstration)
 * In production, use JWT or similar
 */
export function generateToken(user: any): string {
    // Simple token generation - in production use JWT
    const tokenData = {
        id: user._id || user.id,
        role: user.role,
        organizationId: user.organizationId,
        timestamp: Date.now()
    };
    return Buffer.from(JSON.stringify(tokenData)).toString('base64');
}

/**
 * Verify and decode a session token
 */
export function verifyToken(token: string): any {
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        return JSON.parse(decoded);
    } catch (error) {
        return null;
    }
}

/**
 * Middleware function to require super admin authentication
 */
export function requireSuperAdmin(user: any): boolean {
    return user && user.role === 'SuperAdmin';
}

/**
 * Middleware function to require organization admin authentication
 */
export function requireOrgAdmin(user: any): boolean {
    return user && (user.role === 'SuperAdmin' || user.isOrgAdmin === true);
}
