"use client"

import { CreateServerForm } from "@/components/dashboard/servers/create-server-form"
import { DashboardBreadcrumb } from "../breadcrumb"
import { useSession } from "next-auth/react"

export default function ServersPage() {
    const { data: session } = useSession()

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Breadcrumb Area */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                        <DashboardBreadcrumb />
                    </span>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20 shadow-inner">
                    {session?.user?.name?.slice(0, 2).toUpperCase() || "CN"}
                </div>
            </div>

            <div>
                <div className="mb-6">
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Deploy New Server</h2>
                    <p className="text-muted-foreground">
                        Select your preferred location and software to get your game server online instantly.
                    </p>
                </div>

                <CreateServerForm />
            </div>
        </div>
    )
}
