import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as any).isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tickets = await prisma.ticket.findMany({
            orderBy: { updatedAt: 'desc' },
            include: {
                user: {
                    select: {
                        username: true,
                        email: true
                    }
                }
            }
        });

        return NextResponse.json({ tickets });

    } catch (error: any) {
        console.error("Admin Fetch Tickets Error", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

const statusSchema = z.object({
    status: z.enum(['OPEN', 'ANSWERED', 'CLOSED']),
});

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as any).isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { id, status } = body;

        statusSchema.parse({ status });

        const ticket = await prisma.ticket.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json({ ticket });

    } catch (error: any) {
        console.error("Admin Update Ticket Status Error", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
