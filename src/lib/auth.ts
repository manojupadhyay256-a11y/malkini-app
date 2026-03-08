import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.SESSION_SECRET || 'malkini-app-secret-key-super-secure';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1y') // 1 year expiration
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function createSession(userId: number, userName: string) {
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    const session = await encrypt({ userId, userName, expires });

    const cookieStore = await cookies();
    cookieStore.set('session', session, {
        expires,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
}

export async function verifySession() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) return null;

    const session = await decrypt(sessionCookie);
    if (!session?.userId) return null;

    return { userId: session.userId as number, userName: session.userName as string };
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
}
