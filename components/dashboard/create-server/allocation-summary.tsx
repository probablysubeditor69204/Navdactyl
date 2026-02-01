"use client"

import { Cpu, HardDrive, Zap, Loader2, ShieldCheck, Activity, Terminal, Globe, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AllocationSummarySidebarProps {
    settings: any
    isLoading: boolean
    watchAll?: any
}

export function AllocationSummarySidebar({ settings, isLoading, watchAll }: AllocationSummarySidebarProps) {
    const isReady = !!watchAll?.name && !!watchAll?.nodeId && !!watchAll?.eggId;

    return (
        <Card className="rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] sticky top-8 overflow-hidden border-primary/5">
            <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between mb-6">
                    <Badge className="bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] px-3 py-1 text-[9px] rounded-full shadow-lg shadow-primary/20">Alpha Tier</Badge>
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">System Online</span>
                    </div>
                </div>
                <CardTitle className="text-2xl font-black text-white tracking-tighter">Instance Summary</CardTitle>
            </CardHeader>

            <CardContent className="space-y-8 p-8 pt-4">
                {/* Resources List */}
                <div className="space-y-5">
                    <div className="flex items-center justify-between p-4 bg-background/40 rounded-3xl border border-white/5 group hover:bg-background/60 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-2.5 rounded-2xl text-primary group-hover:scale-110 transition-transform duration-500">
                                <Activity className="h-4 w-4" />
                            </div>
                            <div className="space-y-0.5">
                                <div className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Memory</div>
                                <div className="text-sm font-black text-white">{settings?.freeServerMemory || 4096} <span className="text-[10px] text-muted-foreground font-bold">MB</span></div>
                            </div>
                        </div>
                        <ShieldCheck className="h-3 w-3 text-emerald-500/40" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-background/40 rounded-3xl border border-white/5 group hover:bg-background/60 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-2.5 rounded-2xl text-primary group-hover:scale-110 transition-transform duration-500">
                                <HardDrive className="h-4 w-4" />
                            </div>
                            <div className="space-y-0.5">
                                <div className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Storage</div>
                                <div className="text-sm font-black text-white">{(settings?.freeServerDisk / 1024) || 10} <span className="text-[10px] text-muted-foreground font-bold">GB</span></div>
                            </div>
                        </div>
                        <ShieldCheck className="h-3 w-3 text-emerald-500/40" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-background/40 rounded-3xl border border-white/5 group hover:bg-background/60 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-2.5 rounded-2xl text-primary group-hover:scale-110 transition-transform duration-500">
                                <Zap className="h-4 w-4" />
                            </div>
                            <div className="space-y-0.5">
                                <div className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">CPU Limit</div>
                                <div className="text-sm font-black text-white">{settings?.freeServerCpu || 100} <span className="text-[10px] text-muted-foreground font-bold">%</span></div>
                            </div>
                        </div>
                        <ShieldCheck className="h-3 w-3 text-emerald-500/40" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Provisioning</span>
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                isReady ? "text-emerald-500" : "text-amber-500"
                            )}>
                                {isReady ? "Ready to Launch" : "Configuration Pending"}
                            </span>
                            {isReady ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <AlertCircle className="h-3 w-3 text-amber-500 animate-pulse" />}
                        </div>
                    </div>

                    <div className="h-1.5 w-full bg-background rounded-full overflow-hidden p-0.5 border border-white/5">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(var(--primary),0.5)]",
                                isReady ? "w-full bg-primary" : "w-[30%] bg-zinc-800"
                            )}
                        />
                    </div>
                </div>
            </CardContent>

            <CardFooter className="bg-background/60 p-8 flex flex-col gap-6 border-t border-white/5">
                <div className="w-full flex justify-between items-end">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Service Cost</span>
                        <div className="text-4xl font-black text-white tracking-tighter">$0.00<span className="text-xs text-muted-foreground font-bold ml-1 uppercase">/Mo</span></div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-black text-emerald-500 border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 rounded-lg mb-1">PROMO ACTIVE</Badge>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading || !isReady}
                    className={cn(
                        "w-full h-16 rounded-[1.5rem] transition-all duration-500 font-black text-[11px] uppercase tracking-[0.2em] gap-3 shadow-2xl relative overflow-hidden group active:scale-95",
                        isReady
                            ? "bg-primary text-primary-foreground hover:shadow-primary/30"
                            : "bg-zinc-900 border border-white/5 text-muted-foreground/40 grayscale"
                    )}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Initializing...
                        </>
                    ) : (
                        <>
                            Provision Instance
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
