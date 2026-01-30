"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { DashboardBreadcrumb } from "./breadcrumb"
import { WelcomeBanner } from "@/components/dashboard/overview/welcome-banner"
import { DashboardAlert } from "@/components/dashboard/overview/alert-banner"
import { StatsGrid } from "@/components/dashboard/overview/stats-grid"
import { InstancesList } from "@/components/dashboard/overview/instances-list"

export default function DashboardPage() {
    const { data: session } = useSession()
    const [servers, setServers] = useState([])
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const [serversRes, settingsRes] = await Promise.all([
                    fetch('/api/servers'),
                    fetch('/api/settings')
                ])

                const serversData = await serversRes.json()
                const settingsData = await settingsRes.json()

                if (serversData.servers) setServers(serversData.servers)
                if (!settingsData.error) setSettings(settingsData)
            } catch (err) {
                console.error("Failed to fetch dashboard data", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

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

            {/* Welcome Banner */}
            <WelcomeBanner />

            {/* Green Alert Banner */}
            <DashboardAlert />

            {/* Stats Overview */}
            <StatsGrid servers={servers} settings={settings} loading={loading} />

            {/* Instances Section */}
            <InstancesList servers={servers} loading={loading} />
        </div>
    )
}
