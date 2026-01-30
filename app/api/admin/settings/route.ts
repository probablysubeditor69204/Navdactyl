import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        let settings = await prisma.setting.findUnique({
            where: { id: 'site-settings' }
        });

        if (!settings) {
            settings = await prisma.setting.create({
                data: { id: 'site-settings' }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !(session.user as any).isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const settings = await prisma.setting.upsert({
            where: { id: 'site-settings' },
            update: {
                siteTitle: data.siteTitle,
                siteDescription: data.siteDescription,
                faviconUrl: data.faviconUrl,
                dashboardGreeting: data.dashboardGreeting,
                announcementText: data.announcementText,
                showAnnouncement: data.showAnnouncement,
                turnstileEnabled: data.turnstileEnabled,
                turnstileSiteKey: data.turnstileSiteKey,
                turnstileSecretKey: data.turnstileSecretKey,
                freeServerMemory: data.freeServerMemory,
                freeServerDisk: data.freeServerDisk,
                freeServerCpu: data.freeServerCpu,
                serverLimit: data.serverLimit,
                allowedNodes: data.allowedNodes,
                pterodactylAccountKey: data.pterodactylAccountKey,
            },
            create: {
                id: 'site-settings',
                siteTitle: data.siteTitle,
                siteDescription: data.siteDescription,
                faviconUrl: data.faviconUrl,
                dashboardGreeting: data.dashboardGreeting || 'Welcome to Navdactyl Dashboard. Happy Hosting!',
                announcementText: data.announcementText || 'Welcome to Subdactyl Dashboard. Happy Hosting!',
                showAnnouncement: data.showAnnouncement ?? true,
                turnstileEnabled: data.turnstileEnabled ?? false,
                turnstileSiteKey: data.turnstileSiteKey,
                turnstileSecretKey: data.turnstileSecretKey,
                freeServerMemory: data.freeServerMemory ?? 4096,
                freeServerDisk: data.freeServerDisk ?? 10240,
                freeServerCpu: data.freeServerCpu ?? 100,
                serverLimit: data.serverLimit ?? 2,
                allowedNodes: data.allowedNodes || "",
                pterodactylAccountKey: data.pterodactylAccountKey || "",
            }
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error("Update Settings Error", error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
