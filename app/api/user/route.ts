import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { pterodactylService } from '@/lib/pterodactyl';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const updateProfileSchema = z.object({
    username: z.string().min(3).max(60).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    currentPassword: z.string().min(8).optional(),
});

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { username, email, password, currentPassword } = updateProfileSchema.parse(body);
        const userId = (session.user as any).id;

        const currentUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (password) {
            if (!currentPassword) {
                return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
            }
            const isMatch = await bcrypt.compare(currentPassword, currentUser.password);
            if (!isMatch) {
                return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
            }
        }

        if ((email && email !== currentUser.email) || (username && username !== currentUser.username)) {
            const existing = await prisma.user.findFirst({
                where: {
                    OR: [
                        email ? { email } : {},
                        username ? { username } : {}
                    ],
                    NOT: { id: userId }
                }
            });

            if (existing) {
                return NextResponse.json({ error: 'Email or Username already taken' }, { status: 409 });
            }
        }

        try {
            await pterodactylService.updateUser(currentUser.pterodactylUserId, {
                email: email || currentUser.email,
                username: username || currentUser.username,
                firstName: "Dashboard",
                lastName: "User",
                password: password
            });
        } catch (error: any) {
            console.error("Pterodactyl Update Failed", error);
            return NextResponse.json({ error: `Pterodactyl Update Failed: ${error.message}` }, { status: 500 });
        }

        const updateData: any = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (password) updateData.password = await bcrypt.hash(password, 12);

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                username: updatedUser.username,
                avatarUrl: updatedUser.avatarUrl
            }
        });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("Update Profile Error", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
