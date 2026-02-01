import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const messageSchema = z.object({
    content: z.string().min(2, "Message is too short").max(2000),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const isAdmin = (session.user as any).isAdmin;

        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        user: {
                            select: {
                                username: true,
                                avatarUrl: true
                            }
                        }
                    }
                },
                user: {
                    select: {
                        username: true,
                        email: true,
                        avatarUrl: true
                    }
                }
            }
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        // Security check: Only owner or admin can see ticket
        if (ticket.userId !== userId && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({ ticket });

    } catch (error: any) {
        console.error("Fetch Ticket Details Error", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const isAdmin = (session.user as any).isAdmin;

        const ticket = await prisma.ticket.findUnique({
            where: { id }
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        if (ticket.userId !== userId && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (ticket.status === 'CLOSED') {
            return NextResponse.json({ error: 'This ticket is closed and cannot receive new messages.' }, { status: 400 });
        }

        const body = await req.json();
        const { content } = messageSchema.parse(body);

        const [message] = await prisma.$transaction([
            prisma.ticketMessage.create({
                data: {
                    content,
                    userId,
                    isAdmin,
                    ticketId: id
                }
            }),
            prisma.ticket.update({
                where: { id },
                data: {
                    status: isAdmin ? 'ANSWERED' : 'OPEN',
                    updatedAt: new Date()
                }
            })
        ]);

        return NextResponse.json({ message });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("Add Ticket Message Error", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
