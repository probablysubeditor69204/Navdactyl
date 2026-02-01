import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const username = formData.get('username') as string | null;

        const updateData: any = {};

        if (username) {
            updateData.username = username;
        }

        if (file) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const extension = file.name.split('.').pop();
            const fileName = `${uuidv4()}.${extension}`;
            const path = join(process.cwd(), 'public', 'avatars', fileName);

            await writeFile(path, buffer);
            updateData.avatarUrl = `/avatars/${fileName}`;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No data provided' }, { status: 400 });
        }

        const userId = (session.user as any).id;
        if (!userId) {
            return NextResponse.json({ error: 'Session ID missing' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            user: {
                username: updatedUser.username,
                avatarUrl: updatedUser.avatarUrl
            }
        });

    } catch (error: any) {
        console.error("Profile Update Error", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
