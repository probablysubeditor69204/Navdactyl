import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pterodactylService } from '@/lib/pterodactyl';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ nodeId: string }> }
) {
    try {
        const { nodeId: rawNodeId } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const nodeId = parseInt(rawNodeId);
        if (isNaN(nodeId)) {
            return NextResponse.json({ error: 'Invalid Node ID' }, { status: 400 });
        }

        const allocations = await pterodactylService.getAllocations(nodeId);
        return NextResponse.json({ allocations: allocations.filter(a => !a.assigned) });

    } catch (error: any) {
        console.error("Fetch Allocations Error", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
