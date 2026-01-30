import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pterodactylService } from '@/lib/pterodactyl';
import { z } from 'zod';

const commandSchema = z.object({
    command: z.string().min(1),
});

export async function POST(
    req: Request,
    { params }: { params: { identifier: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { identifier } = await params;
        const pteroId = (session.user as any).pteroId;

        if (!pteroId) {
            return Response.json({ error: 'User not linked to Pterodactyl' }, { status: 400 });
        }

        const userServers = await pterodactylService.getServersByUserId(pteroId);
        const ownsServer = userServers.some(s => s.identifier === identifier);

        if (!ownsServer && !(session.user as any).isAdmin) {
            return Response.json({ error: 'Forbidden: You do not own this server' }, { status: 403 });
        }

        const body = await req.json();
        const { command } = commandSchema.parse(body);

        await pterodactylService.sendCommand(identifier, command);

        return Response.json({ success: true });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return Response.json({ error: error.issues }, { status: 400 });
        }
        console.error("Send Command Error:", error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
