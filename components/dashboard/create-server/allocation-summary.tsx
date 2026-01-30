"use client"

import { Cpu, HardDrive, Zap, Loader2, ShieldCheck, Activity, Terminal, Globe, ChevronRight } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AllocationSummarySidebarProps {
    settings: any
    isLoading: boolean
    watchAll?: any
}

export function AllocationSummarySidebar({ settings, isLoading, watchAll }: AllocationSummarySidebarProps) {
    const isReady = !!watchAll?.name && !!watchAll?.nodeId && !!watchAll?.eggId;

    return (
        <Card className="rounded-2xl border-border bg-card shadow-lg sticky top-8 overflow-hidden">
            <CardHeader className="bg-primary/[0.02] border-b border-border/50 pb-6">
                <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 font-extrabold uppercase tracking-widest rounded-md">Tier: Free</Badge>
                    <div className="flex items-center gap-1.5 opacity-50">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Pricing Alpha</span>
                    </div>
                </div>
                <CardTitle className="text-xl font-bold text-white tracking-tight">Resource Summary</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 pt-6 p-6">
                {/* Hardware Grid */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2.5 rounded-xl text-primary border border-primary/10">
                                <Activity className="h-4 w-4" />
                            </div>
                            <div className="space-y-0.5">
                                <div className="text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-widest leading-none">Memory</div>
                                <div className="text-sm font-bold text-white leading-tight">{settings?.freeServerMemory || 4096} MB</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2.5 rounded-xl text-primary border border-primary/10">
                                <HardDrive className="h-4 w-4" />
                            </div>
                            <div className="space-y-0.5">
                                <div className="text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-widest leading-none">Storage (NVMe)</div>
                                <div className="text-sm font-bold text-white leading-tight">{(settings?.freeServerDisk / 1024) || 10} GB</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2.5 rounded-xl text-primary border border-primary/10">
                                <Cpu className="h-4 w-4" />
                            </div>
                            <div className="space-y-0.5">
                                <div className="text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-widest leading-none">CPU Priority</div>
                                <div className="text-sm font-bold text-white leading-tight">{settings?.freeServerCpu || 100}%</div>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="bg-border/50" />

                <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs px-1">
                        <span className="text-muted-foreground font-bold uppercase tracking-tight opacity-60">Status</span>
                        <span className={cn(
                            "font-bold uppercase tracking-tighter transition-all",
                            isReady ? "text-emerald-500" : "text-amber-500"
                        )}>
                            {isReady ? "READY" : "Pending Config"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs px-1">
                        <span className="text-muted-foreground font-bold uppercase tracking-tight opacity-60">Provisioning</span>
                        <span className="text-white font-bold uppercase tracking-tighter">Automated</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="bg-[#09090b] p-6 flex flex-col gap-4 border-t border-border/50">
                <div className="w-full space-y-4">
                    <div className="flex justify-between items-end mb-1">
                        <div className="space-y-1">
                            <span className="text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-widest">Estimated Cost</span>
                            <div className="text-2xl font-black text-white leading-none">$0.00<span className="text-sm text-muted-foreground/40 font-bold ml-1">USD</span></div>
                        </div>
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 text-[10px] mb-1 font-bold">100% OFF</Badge>
                    </div>

                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full transition-all duration-700 ease-in-out bg-primary",
                                isReady ? "w-full" : "w-[30%] opacity-20"
                            )}
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading || !isReady}
                    className={cn(
                        "w-full font-extrabold h-11 rounded-xl transition-all shadow-md active:scale-[0.98] text-xs uppercase tracking-widest gap-2.5",
                        isReady
                            ? "bg-primary text-primary-foreground hover:opacity-90 shadow-primary/10"
                            : "bg-zinc-800 text-muted-foreground border-border"
                    )}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Deploying...
                        </>
                    ) : (
                        <>
                            Deploy Instance
                            <Zap className="h-3.5 w-3.5 fill-current" />
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
