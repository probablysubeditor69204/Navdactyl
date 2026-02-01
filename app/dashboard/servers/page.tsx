"use client"

import { CreateServerForm } from "@/components/dashboard/servers/create-server-form"
import { DashboardBreadcrumb } from "../breadcrumb"
import { useSession } from "next-auth/react"

export default function ServersPage() {
    const { data: session } = useSession()

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Minimal Breadcrumb */}
            <div className="flex items-center justify-between">
                <DashboardBreadcrumb />
            </div>

            <CreateServerForm />
        </div>
    )
}
