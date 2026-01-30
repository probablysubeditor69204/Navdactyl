import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pterodactylService } from '@/lib/pterodactyl';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [nodes, settings] = await Promise.all([
            pterodactylService.getNodes(),
            prisma.setting.findUnique({ where: { id: "site-settings" } })
        ]);

        // Parse configured limits: id:limit
        const configuredLimits: Record<number, number> = {};
        if (settings?.allowedNodes) {
            settings.allowedNodes.split(',').forEach((s: string) => {
                const [idStr, limitStr] = s.split(':');
                const id = parseInt(idStr.trim());
                if (!isNaN(id)) {
                    configuredLimits[id] = limitStr ? parseInt(limitStr.trim()) : 100;
                }
            });
        }

        // Enhance nodes with usage data
        const enhancedNodes = await Promise.all(nodes.map(async (node) => {
            let usage = 0;
            const limit = configuredLimits[node.id] ?? -1; // -1 indicates not part of free tier

            // Only fetch allocations if the node is actually allowed/configured
            if (limit !== -1) {
                try {
                    const allocations = await pterodactylService.getAllocations(node.id);
                    // Count assigned allocations as a proxy for slots used
                    usage = allocations.filter(a => a.assigned).length;
                } catch (e) {
                    console.error(`Failed to fetch allocations for node ${node.id}`, e);
                }
            }

            return {
                ...node,
                usage,
                limit,
                isAllowed: limit !== -1
            };
        }));

        return NextResponse.json({ nodes: enhancedNodes });

    } catch (error: any) {
        console.error("Fetch Nodes Error", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
