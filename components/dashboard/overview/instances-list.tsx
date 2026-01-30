"use client"

import Link from "next/link"
import { Server, Loader2, ExternalLink, Cpu, HardDrive } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PterodactylServer {
    id: number;
    uuid: string;
    identifier: string;
    name: string;
    description: string;
    status: string | null;
    limits: {
        memory: number;
        cpu: number;
        disk: number;
    };
}

interface InstancesListProps {
    servers: PterodactylServer[];
    loading: boolean;
}

export function InstancesList({ servers, loading }: InstancesListProps) {
    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-white font-medium">
                    <Server className="h-5 w-5" />
                    <h3>Your Instances ( ... )</h3>
                </div>
                <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[200px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Fetching your servers...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-medium">
                <Server className="h-5 w-5" />
                <h3>Your Instances ( {servers.length} )</h3>
            </div>

            {servers.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[200px]">
                    <p className="text-muted-foreground">No instances found.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {servers.map((server) => (
                        <div key={server.id} className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/50 transition-all duration-300 group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Server className="h-6 w-6" />
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Active
                                </div>
                            </div>

                            <h4 className="text-white font-bold text-lg mb-1 truncate">{server.name}</h4>
                            <p className="text-muted-foreground text-xs mb-6 line-clamp-1">{server.description || 'No description provided'}</p>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-[#09090b] rounded-lg p-3 border border-border/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <HardDrive className="h-3 w-3 text-muted-foreground" />
                                        <p className="text-muted-foreground text-[10px] uppercase font-bold">Memory</p>
                                    </div>
                                    <p className="text-white font-bold text-sm">{server.limits.memory}MB</p>
                                </div>
                                <div className="bg-[#09090b] rounded-lg p-3 border border-border/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Cpu className="h-3 w-3 text-muted-foreground" />
                                        <p className="text-muted-foreground text-[10px] uppercase font-bold">CPU</p>
                                    </div>
                                    <p className="text-white font-bold text-sm group-hover:text-primary transition-colors">{server.limits.cpu}%</p>
                                </div>
                            </div>

                            <Button variant="outline" size="sm" className="w-full text-xs font-semibold bg-transparent hover:bg-primary/10 hover:text-primary hover:border-primary/50" asChild>
                                <Link href={`/dashboard/servers/${server.identifier}`}>
                                    Control Panel
                                    <ExternalLink className="ml-2 h-3 w-3 outline-none" />
                                </Link>
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
