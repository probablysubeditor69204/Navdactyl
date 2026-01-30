import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pterodactylService } from '@/lib/pterodactyl';
import bcrypt from 'bcryptjs';
import { z, ZodError } from 'zod';

const registerSchema = z.object({
    username: z.string().min(3).max(60),
    email: z.string().email(),
    password: z.string().min(8),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, email, password } = registerSchema.parse(body);

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email or username already exists' },
                { status: 409 }
            );
        }

        let pteroUser;

        try {
            pteroUser = await pterodactylService.createUser({
                email,
                username,
                firstName: "Dashboard",
                lastName: "User",
                password
            });
        } catch (err: any) {
            console.error("Pterodactyl Creation Error", err);
            return NextResponse.json(
                { error: `Pterodactyl Error: ${err.message}` },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                pterodactylUserId: pteroUser.id,
                pterodactylUuid: pteroUser.uuid,
                isAdmin: pteroUser.root_admin || false,
            }
        });

        return NextResponse.json({
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username
            }
        }, { status: 201 });

    } catch (error: any) {
        if (error instanceof ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("Registration Error", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
