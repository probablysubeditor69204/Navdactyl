import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pterodactylService } from '@/lib/pterodactyl';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !(session.user as any).isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');

        const { data, meta } = await pterodactylService.getAllServers(page);

        return NextResponse.json({ servers: data, pagination: meta?.pagination });

    } catch (error: any) {
        console.error("Admin Fetch Servers Error", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
