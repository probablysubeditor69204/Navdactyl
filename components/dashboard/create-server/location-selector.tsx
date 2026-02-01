"use client"

import { Globe, Check, MapPin, Activity } from "lucide-react"
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface LocationSelectorProps {
    form: any
    nodes: any[]
}

export function LocationSelector({ form, nodes }: LocationSelectorProps) {
    return (
        <FormField
            control={form.control}
            name="nodeId"
            render={({ field }) => (
                <FormItem>
                    <FormControl>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {nodes.map((node) => {
                                const percentage = node.limit > 0 ? (node.usage / node.limit) * 100 : 0;
                                const isFull = node.usage >= node.limit;
                                const isSelected = field.value === node.id.toString();

                                return (
                                    <div
                                        key={node.id}
                                        onClick={() => !isFull && field.onChange(node.id.toString())}
                                        className={cn(
                                            "relative cursor-pointer rounded-xl border p-5 transition-all duration-300 group shadow-sm bg-card",
                                            isSelected
                                                ? "border-primary ring-1 ring-primary/20 bg-primary/5"
                                                : "border-border hover:border-primary/40",
                                            isFull && "opacity-50 cursor-not-allowed bg-muted/50 grayscale"
                                        )}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "h-10 w-10 rounded-lg flex items-center justify-center transition-colors shadow-inner border border-border/50",
                                                    isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary group-hover:bg-primary/20"
                                                )}>
                                                    <Globe className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-base leading-tight group-hover:text-primary transition-colors">{node.name}</div>
                                                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter mt-0.5">{node.fqdn}</div>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20 animate-in zoom-in duration-300">
                                                    <Check className="h-3.5 w-3.5 text-primary-foreground stroke-[3px]" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3 bg-[#09090b] rounded-lg p-4 border border-border/50">
                                            <div className="flex justify-between text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/50 items-center">
                                                <span className="flex items-center gap-1.5">
                                                    <Activity className="h-3 w-3" />
                                                    Capacity
                                                </span>
                                                <span className="text-white/80 font-mono">
                                                    {Math.round(percentage)}%
                                                </span>
                                            </div>
                                            <Progress value={percentage} className="h-1.5 bg-zinc-900 border-none" />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                </FormItem>
            )}
        />
    )
}
