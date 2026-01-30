"use client"

import { useEffect, useState } from "react"
import { Shield, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

import { OverviewTab } from "@/components/dashboard/admin/overview-tab"
import { UsersTab } from "@/components/dashboard/admin/users-tab"
import { ServersTab } from "@/components/dashboard/admin/servers-tab"
import { FreeTierTab } from "@/components/dashboard/admin/free-tier-tab"
import { SettingsTab } from "@/components/dashboard/admin/settings-tab"
import { TicketsTab } from "@/components/dashboard/admin/tickets-tab"

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/admin/stats")
                const data = await res.json()
                if (data.stats) {
                    setStats(data)
                }
            } catch (error) {
                console.error("Failed to fetch admin data", error)
                toast.error("Failed to load dashboard data")
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="p-8 text-center text-white">
                <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold">Access Denied</h3>
                <p className="text-muted-foreground">You do not have administrative privileges.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto p-4 md:p-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                        <Shield className="h-8 w-8 text-blue-500" /> Administrative Area
                    </h2>
                    <p className="text-muted-foreground">Manage your entire hosting platform from one place.</p>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-[#18181b] border-[#27272a] p-1 h-12 w-full md:w-auto overflow-x-auto justify-start">
                    <TabsTrigger className="px-6 py-2.5" value="overview">Overview</TabsTrigger>
                    <TabsTrigger className="px-6 py-2.5" value="users">Manage Users</TabsTrigger>
                    <TabsTrigger className="px-6 py-2.5" value="servers">Manage Servers</TabsTrigger>
                    <TabsTrigger className="px-6 py-2.5" value="free-tier">Free Tier</TabsTrigger>
                    <TabsTrigger className="px-6 py-2.5" value="tickets">Support Tickets</TabsTrigger>
                    <TabsTrigger className="px-6 py-2.5" value="settings">Platform Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <OverviewTab stats={stats} />
                </TabsContent>

                <TabsContent value="users">
                    <UsersTab />
                </TabsContent>

                <TabsContent value="servers">
                    <ServersTab />
                </TabsContent>

                <TabsContent value="free-tier">
                    <FreeTierTab />
                </TabsContent>

                <TabsContent value="settings">
                    <SettingsTab />
                </TabsContent>

                <TabsContent value="tickets">
                    <TicketsTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}
