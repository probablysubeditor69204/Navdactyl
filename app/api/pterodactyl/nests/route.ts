import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pterodactylService } from '@/lib/pterodactyl';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const nests = await pterodactylService.getNests();
        return NextResponse.json({ nests });

    } catch (error: any) {
        console.error("Fetch Nests Error", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
