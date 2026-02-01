import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { pterodactylService } from '@/lib/pterodactyl';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please enter an email and password');
                }

                // Turnstile Verification
                const settings = await prisma.setting.findUnique({
                    where: { id: 'site-settings' }
                });

                if (settings?.turnstileEnabled && settings.turnstileSecretKey) {
                    const token = (credentials as any)?.turnstileToken;
                    if (!token) {
                        throw new Error('Please complete the CAPTCHA');
                    }

                    try {
                        const formData = new URLSearchParams();
                        formData.append('secret', settings.turnstileSecretKey);
                        formData.append('response', token);

                        const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                            method: 'POST',
                            body: formData,
                        });

                        const outcome = await res.json();
                        if (!outcome.success) {
                            throw new Error('CAPTCHA verification failed. Please try again.');
                        }
                    } catch (error: any) {
                        console.error("Turnstile verification error:", error);
                        throw new Error(error.message || 'Security check failed');
                    }
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user) {
                    throw new Error('No user found with this email');
                }

                const isMatch = await bcrypt.compare(credentials.password, user.password);

                if (!isMatch) {
                    throw new Error('Incorrect password');
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.username,
                    isAdmin: user.isAdmin,
                    avatarUrl: user.avatarUrl,
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.isAdmin = (user as any).isAdmin;
                token.avatarUrl = (user as any).avatarUrl;
            }

            if (trigger === "update" && session?.user) {
                if (session.user.name) token.name = session.user.name;
                if (session.user.email) token.email = session.user.email;
                if (session.user.avatarUrl) token.avatarUrl = session.user.avatarUrl;
            }

            // Periodically refresh data from DB
            if (token.id) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { isAdmin: true, avatarUrl: true, username: true }
                });
                if (dbUser) {
                    token.isAdmin = dbUser.isAdmin;
                    token.avatarUrl = dbUser.avatarUrl;
                    token.name = dbUser.username;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token.id) {
                let user = await prisma.user.findUnique({
                    where: { id: token.id as string }
                });

                if (user) {
                    // Sync isAdmin status from Pterodactyl
                    try {
                        const pteroUser = await pterodactylService.getUserByEmail(user.email);
                        if (pteroUser && pteroUser.root_admin !== user.isAdmin) {
                            user = await prisma.user.update({
                                where: { id: user.id },
                                data: { isAdmin: pteroUser.root_admin }
                            });
                        }
                    } catch (error) {
                        console.error("Session sync admin status error:", error);
                    }

                    (session.user as any).id = user.id;
                    (session.user as any).name = user.username;
                    (session.user as any).pteroId = user.pterodactylUserId;
                    (session.user as any).pteroUuid = user.pterodactylUuid;
                    (session.user as any).isAdmin = user.isAdmin;
                    (session.user as any).avatarUrl = user.avatarUrl;
                    session.user!.email = user.email;
                }
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
