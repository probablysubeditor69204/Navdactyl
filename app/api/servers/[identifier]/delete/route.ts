import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pterodactylService } from '@/lib/pterodactyl';

export async function DELETE(
    req: Request,
    { params }: { params: { identifier: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { identifier } = await params;
        const pteroId = (session.user as any).pteroId;

        if (!pteroId) {
            return NextResponse.json({ error: 'User not linked to Pterodactyl' }, { status: 400 });
        }

        // Verify ownership
        const userServers = await pterodactylService.getServersByUserId(pteroId);
        const server = userServers.find(s => s.identifier === identifier);

        if (!server && !(session.user as any).isAdmin) {
            return NextResponse.json({ error: 'Forbidden: You do not own this server' }, { status: 403 });
        }

        if (!server) {
            return NextResponse.json({ error: 'Server not found' }, { status: 404 });
        }

        // Delete the server
        await pterodactylService.deleteServer(server.id, true);

        return NextResponse.json({ message: 'Server deleted successfully' });

    } catch (error: any) {
        console.error("Delete Server Error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
