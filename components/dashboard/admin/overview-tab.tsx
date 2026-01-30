"use client"

import {
    Users,
    Server,
    Globe,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface OverviewTabProps {
    stats: any
}

export function OverviewTab({ stats }: OverviewTabProps) {
    if (!stats) return null

    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-[#18181b] border-[#27272a] shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.stats.users}</div>
                        <Users className="h-4 w-4 text-blue-500 absolute top-4 right-4" />
                    </CardContent>
                </Card>
                <Card className="bg-[#18181b] border-[#27272a] shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Instances</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.stats.servers}</div>
                        <Server className="h-4 w-4 text-emerald-500 absolute top-4 right-4" />
                    </CardContent>
                </Card>
                <Card className="bg-[#18181b] border-[#27272a] shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Active Nodes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.stats.nodes}</div>
                        <Globe className="h-4 w-4 text-purple-500 absolute top-4 right-4" />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-[#09090b]/50 border-[#27272a] relative overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest text-center">Allocated CPU</CardDescription>
                        <CardTitle className="text-2xl font-bold text-white text-center">{stats.stats.usage.cpu}%</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-[#09090b]/50 border-[#27272a] relative overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest text-center">Allocated RAM</CardDescription>
                        <CardTitle className="text-2xl font-bold text-white text-center">{(stats.stats.usage.memory / 1024).toFixed(1)} GB</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-[#09090b]/50 border-[#27272a] relative overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest text-center">Allocated Disk</CardDescription>
                        <CardTitle className="text-2xl font-bold text-white text-center">{(stats.stats.usage.disk / 1024).toFixed(1)} GB</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-[#18181b] border-[#27272a]">
                    <CardHeader><CardTitle className="text-lg text-white">Recent Deployments</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                {stats.recentServers.slice(0, 5).map((s: any) => (
                                    <TableRow key={s.id} className="border-[#27272a] hover:bg-white/5">
                                        <TableCell className="text-zinc-300 py-3">{s.name}</TableCell>
                                        <TableCell className="text-zinc-500 text-xs py-3">User #{s.user}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card className="bg-[#18181b] border-[#27272a]">
                    <CardHeader><CardTitle className="text-lg text-white">Recent Users</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                {stats.recentUsers.slice(0, 5).map((u: any) => (
                                    <TableRow key={u.id} className="border-[#27272a] hover:bg-white/5">
                                        <TableCell className="text-zinc-300 py-3">{u.username}</TableCell>
                                        <TableCell className="text-right py-3"><Badge variant="outline" className="text-[10px]">{u.root_admin ? "Admin" : "User"}</Badge></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
