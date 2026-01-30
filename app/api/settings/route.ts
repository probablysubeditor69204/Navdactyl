import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const settings = await prisma.setting.findUnique({
            where: { id: 'site-settings' }
        });

        if (!settings) {
            return NextResponse.json({
                siteTitle: "Navdactyl",
                dashboardGreeting: "Welcome to Navdactyl Dashboard. Happy Hosting!",
                freeServerMemory: 4096,
                freeServerDisk: 10240,
                freeServerCpu: 100,
                serverLimit: 2,
                allowedNodes: ""
            });
        }

        // Return only non-sensitive settings
        return NextResponse.json({
            siteTitle: settings.siteTitle,
            faviconUrl: settings.faviconUrl,
            dashboardGreeting: settings.dashboardGreeting,
            announcementText: settings.announcementText,
            showAnnouncement: settings.showAnnouncement,
            turnstileEnabled: settings.turnstileEnabled,
            turnstileSiteKey: settings.turnstileSiteKey,
            freeServerMemory: settings.freeServerMemory,
            freeServerDisk: settings.freeServerDisk,
            freeServerCpu: settings.freeServerCpu,
            serverLimit: settings.serverLimit,
            allowedNodes: settings.allowedNodes,
        });

    } catch (error) {
        console.error("Public Settings API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
