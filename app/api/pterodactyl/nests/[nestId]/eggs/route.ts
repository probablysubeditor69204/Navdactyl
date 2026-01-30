import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pterodactylService } from '@/lib/pterodactyl';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ nestId: string }> }
) {
    try {
        const { nestId: rawNestId } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const nestId = parseInt(rawNestId);
        if (isNaN(nestId)) {
            return NextResponse.json({ error: 'Invalid Nest ID' }, { status: 400 });
        }

        const eggs = await pterodactylService.getEggs(nestId);
        return NextResponse.json({ eggs });

    } catch (error: any) {
        console.error("Fetch Eggs Error", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
