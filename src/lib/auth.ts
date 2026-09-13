import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { UserRole } from '@prisma/client';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'oficina-mecanica-super-secret-jwt-token-key-2026-prod'
);

const COOKIE_NAME = 'oficina_session';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  workshopId: string;
  workshopName: string;
}

export async function createSessionToken(payload: SessionUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      workshopId: payload.workshopId as string,
      workshopName: (payload.workshopName as string) || 'Oficina',
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });
}

export async function removeSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getTenantContext(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || !user.workshopId) {
    throw new Error('Sessão expirada ou não autenticada.');
  }
  return user;
}

export async function authenticateUser(email: string, passwordPlain: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { workshop: true },
  });

  if (!user || user.status !== 'ATIVO') {
    return { success: false, error: 'Usuário não encontrado ou inativo.' };
  }

  const isPasswordValid = await bcrypt.compare(passwordPlain, user.passwordHash);
  if (!isPasswordValid) {
    return { success: false, error: 'E-mail ou senha incorretos.' };
  }

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    workshopId: user.workshopId,
    workshopName: user.workshop?.name || 'Oficina',
  };

  const token = await createSessionToken(sessionUser);
  await setSessionCookie(token);

  return { success: true, user: sessionUser };
}
