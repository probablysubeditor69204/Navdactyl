"use client"

import { Cpu, HardDrive, Server, Zap, Loader2 } from "lucide-react"

interface PterodactylServer {
    id: number;
    limits: {
        memory: number;
        cpu: number;
        disk: number;
    };
}

interface StatsGridProps {
    servers: PterodactylServer[];
    settings: any;
    loading: boolean;
}

export function StatsGrid({ servers, settings, loading }: StatsGridProps) {

    // Calculate aggregate limits
    const usedMemory = servers.reduce((acc, s) => acc + s.limits.memory, 0)
    const usedCpu = servers.reduce((acc, s) => acc + s.limits.cpu, 0)
    const usedDisk = servers.reduce((acc, s) => acc + s.limits.disk, 0)
    const serverCount = servers.length

    const limitMemory = settings?.freeServerMemory ?? 0
    const limitCpu = settings?.freeServerCpu ?? 0
    const limitDisk = settings?.freeServerDisk ?? 0
    const limitServers = settings?.serverLimit ?? 0

    const stats = [
        { label: "Memory", value: `${usedMemory} / ${limitMemory}MB`, icon: HardDrive },
        { label: "CPU", value: `${usedCpu} / ${limitCpu}%`, icon: Cpu },
        { label: "Storage", value: `${usedDisk} / ${limitDisk}MB`, icon: Server },
        { label: "Server Slots", value: `${serverCount} / ${limitServers}`, icon: Zap },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/30 transition-colors">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#27272a] text-muted-foreground">
                        <stat.icon className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-0.5">
                            {stat.label}
                        </p>
                        <h3 className="text-xl font-bold text-white tracking-tight">
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                                stat.value
                            )}
                        </h3>
                    </div>
                </div>
            ))}
        </div>
    )
}
