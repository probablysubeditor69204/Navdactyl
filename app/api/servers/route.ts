import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pterodactylService, PterodactylEggAttributes } from '@/lib/pterodactyl';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createServerSchema = z.object({
    name: z.string().min(1).max(191),
    nodeId: z.number(),
    nestId: z.number(),
    eggId: z.number(),
});

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const pteroId = (session.user as any).pteroId;

        if (!pteroId) {
            return NextResponse.json({ servers: [] });
        }

        const servers = await pterodactylService.getServersByUserId(pteroId);

        return NextResponse.json({ servers });

    } catch (error: any) {
        console.error("Fetch Servers Error", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const pteroId = (session.user as any).pteroId;
        if (!pteroId) {
            return NextResponse.json({ error: 'User does not have a Pterodactyl ID linked' }, { status: 400 });
        }

        const body = await req.json();
        const { name, nodeId, nestId, eggId } = createServerSchema.parse(body);

        // Fetch current settings for limits
        const settings = await prisma.setting.findUnique({
            where: { id: 'site-settings' }
        });

        // 1. Check Server Limit
        const existingServers = await pterodactylService.getServersByUserId(pteroId);
        const limit = settings?.serverLimit ?? 2;
        if (existingServers.length >= limit) {
            return NextResponse.json({
                error: `You have reached your server limit (${limit}). Upgrade or delete a server to create more.`
            }, { status: 400 });
        }

        // 2. Check Allowed Nodes
        if (settings?.allowedNodes) {
            // Parse "1:50, 2:10" or "1, 2"
            const allowedConfigs = settings.allowedNodes.split(',').map(s => {
                const part = s.split(':');
                const id = parseInt(part[0].trim());
                const limit = part[1] ? parseInt(part[1].trim()) : 9999;
                return { id, limit };
            });

            const nodeConfig = allowedConfigs.find(c => c.id === nodeId);

            if (!nodeConfig) {
                return NextResponse.json({
                    error: 'This node is not available for free server deployment.'
                }, { status: 403 });
            }

            // Check Node-Specific Limit (Global Servers on Node)
            const allocations = await pterodactylService.getAllocations(nodeId);

            // Count how many are currently assigned
            const currentUsage = allocations.filter(a => a.assigned).length;

            if (currentUsage >= nodeConfig.limit) {
                return NextResponse.json({
                    error: `This node has reached its capacity (${nodeConfig.limit} servers). Please choose another node.`
                }, { status: 400 });
            }
        }

        // Fetch Egg details for Docker Image and Startup
        const eggs = await pterodactylService.getEggs(nestId);
        const egg = eggs.find(e => e.id === eggId);

        if (!egg) {
            return NextResponse.json({ error: 'Selected Egg not found' }, { status: 404 });
        }

        // Fetch Egg Variables to ensure required fields are filled
        const variables = await pterodactylService.getEggVariables(nestId, eggId);
        const environment: Record<string, string> = {};

        variables.forEach(v => {
            environment[v.env_variable] = v.default_value || "";
        });

        // Fetch first free allocation for the node
        const allocations = await pterodactylService.getAllocations(nodeId);
        const freeAllocation = allocations.find(a => !a.assigned);

        if (!freeAllocation) {
            return NextResponse.json({ error: 'No free allocations found on the selected node' }, { status: 400 });
        }

        // Construct Pterodactyl payload with dynamic defaults from settings
        const payload = {
            name,
            user: pteroId,
            egg: eggId,
            docker_image: "ghcr.io/pterodactyl/yolks:java_21",
            startup: egg.startup,
            limits: {
                memory: settings?.freeServerMemory ?? 4096,
                swap: 0,
                disk: settings?.freeServerDisk ?? 10240,
                io: 500,
                cpu: settings?.freeServerCpu ?? 100,
            },
            feature_limits: {
                databases: 2,
                allocations: 1,
                backups: 4,
            },
            allocation: {
                default: freeAllocation.id,
            },
            environment,
            start_on_completion: true,
        };

        const server = await pterodactylService.createServer(payload);

        return NextResponse.json({ message: 'Server created successfully', server });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("Create Server Error", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
