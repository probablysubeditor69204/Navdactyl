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
                        email: true,
                        avatarUrl: true
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
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as any).isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
        }

        // Delete all messages first due to relations
        await prisma.ticketMessage.deleteMany({
            where: { ticketId: id }
        });

        await prisma.ticket.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Admin Delete Ticket Error", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
