import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pterodactylService } from '@/lib/pterodactyl';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: rawId } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !(session.user as any).isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = parseInt(rawId);
        if (isNaN(userId)) {
            return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 });
        }

        // 1. Delete from Pterodactyl
        await pterodactylService.deleteUser(userId);

        // 2. Delete from local database if exists
        await prisma.user.deleteMany({
            where: { pterodactylUserId: userId }
        });

        return NextResponse.json({ message: 'User deleted successfully' });

    } catch (error: any) {
        console.error("Delete User Error", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
