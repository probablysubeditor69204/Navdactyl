import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { pterodactylService } from "@/lib/pterodactyl"
import { redirect } from "next/navigation"
import { ConsoleViewer } from "@/components/dashboard/servers/console-viewer"
import { ArrowLeft, Server } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = 'force-dynamic'

export default async function ServerManagementPage({
    params
}: {
    params: { identifier: string }
}) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/auth/login")
    }

    const { identifier } = await params
    const pteroId = (session.user as any).pteroId

    if (!pteroId) {
        redirect("/dashboard")
    }

    const userServers = await pterodactylService.getServersByUserId(pteroId)
    const server = userServers.find(s => s.identifier === identifier)

    if (!server) {
        redirect("/dashboard")
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <Server className="h-5 w-5 text-muted-foreground" />
                            <h1 className="text-2xl font-bold tracking-tight uppercase">{server.name}</h1>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">{server.identifier}</p>
                    </div>
                </div>
                <a
                    href={`${process.env.PTERODACTYL_PANEL_URL}/server/${identifier}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button variant="outline" className="border-zinc-800 bg-zinc-900/50">
                        Open Control Panel
                    </Button>
                </a>
            </div>

            <ConsoleViewer identifier={identifier} serverName={server.name} />
        </div>
    )
}
