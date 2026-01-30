import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createTicketSchema = z.object({
    subject: z.string().min(5, "Subject must be at least 5 characters").max(100),
    message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        const tickets = await prisma.ticket.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        return NextResponse.json({ tickets });

    } catch (error: any) {
        console.error("Fetch Tickets Error", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // Check for active ticket - 1 per user limit
        const activeTicket = await prisma.ticket.findFirst({
            where: {
                userId,
                status: { in: ['OPEN', 'ANSWERED'] }
            }
        });

        if (activeTicket) {
            return NextResponse.json({ error: 'You already have an active ticket. Please wait for it to be resolved.' }, { status: 400 });
        }

        const body = await req.json();
        const { subject, message } = createTicketSchema.parse(body);

        const ticket = await prisma.ticket.create({
            data: {
                subject,
                userId,
                messages: {
                    create: {
                        content: message,
                        userId,
                        isAdmin: false
                    }
                }
            }
        });

        return NextResponse.json({ message: 'Ticket created successfully', ticket });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("Create Ticket Error", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
