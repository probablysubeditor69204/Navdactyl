import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pterodactylService } from '@/lib/pterodactyl';

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

        const serverId = parseInt(rawId);
        if (isNaN(serverId)) {
            return NextResponse.json({ error: 'Invalid Server ID' }, { status: 400 });
        }

        // Delete from Pterodactyl
        await pterodactylService.deleteServer(serverId);

        return NextResponse.json({ message: 'Server deleted successfully' });

    } catch (error: any) {
        console.error("Delete Server Error", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
