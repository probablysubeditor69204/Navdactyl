import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pterodactylService } from '@/lib/pterodactyl';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !(session.user as any).isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [usersRes, serversRes, nodes] = await Promise.all([
            pterodactylService.getUsers(),
            pterodactylService.getAllServers(),
            pterodactylService.getNodes()
        ]);

        const users = usersRes.data;
        const servers = serversRes.data;

        // Calculate aggregate stats
        const totalMemory = servers.reduce((acc, s) => acc + s.limits.memory, 0);
        const totalCpu = servers.reduce((acc, s) => acc + s.limits.cpu, 0);
        const totalDisk = servers.reduce((acc, s) => acc + s.limits.disk, 0);

        return NextResponse.json({
            stats: {
                users: users.length,
                servers: servers.length,
                nodes: nodes.length,
                usage: {
                    memory: totalMemory,
                    cpu: totalCpu,
                    disk: totalDisk
                }
            },
            recentServers: servers.slice(0, 5),
            recentUsers: users.slice(0, 5)
        });

    } catch (error: any) {
        console.error("Admin Stats Error", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
