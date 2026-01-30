import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { pterodactylService } from "@/lib/pterodactyl"

export async function POST(
    req: Request,
    { params }: { params: { identifier: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { identifier } = await params
        const body = await req.json()
        const { file, content } = body

        if (!file || typeof content !== 'string') {
            return NextResponse.json({ error: 'Missing file path or content' }, { status: 400 })
        }

        const pteroId = (session.user as any).pteroId
        if (!pteroId) {
            return NextResponse.json({ error: 'User not linked to Pterodactyl' }, { status: 400 })
        }

        // Verify ownership
        const userServers = await pterodactylService.getServersByUserId(pteroId)
        const server = userServers.find(s => s.identifier === identifier)
        const isAdmin = (session.user as any).isAdmin

        if (!server && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        await pterodactylService.writeFile(identifier, file, content)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Write File Error:", error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
