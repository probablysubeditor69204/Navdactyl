"use client"

import { Globe, Check } from "lucide-react"
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface LocationSelectorProps {
    form: any
    nodes: any[]
}

export function LocationSelector({ form, nodes }: LocationSelectorProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-500" />
                        Deployment Region
                    </h3>
                    <p className="text-sm text-muted-foreground">Select a physical location for your server.</p>
                </div>
            </div>

            <FormField
                control={form.control}
                name="nodeId"
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {nodes.length === 0 ? (
                                    <div className="col-span-full py-12 text-center rounded-xl border border-dashed border-border bg-card/50">
                                        <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                        <p className="text-muted-foreground font-medium">No free deployment nodes available.</p>
                                        <p className="text-xs text-muted-foreground mt-1">Please check back later.</p>
                                    </div>
                                ) : (
                                    nodes.map((node) => {
                                        const percentage = node.limit > 0 ? (node.usage / node.limit) * 100 : 0;
                                        const isFull = node.usage >= node.limit;

                                        return (
                                            <div
                                                key={node.id}
                                                onClick={() => !isFull && field.onChange(node.id.toString())}
                                                className={cn(
                                                    "relative cursor-pointer rounded-xl border transition-all duration-200 overflow-hidden group bg-card",
                                                    isFull
                                                        ? "opacity-60 cursor-not-allowed border-border"
                                                        : field.value === node.id.toString()
                                                            ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/20 shadow-lg shadow-blue-500/10"
                                                            : "border-border hover:border-blue-500/50 hover:shadow-md"
                                                )}
                                            >
                                                {/* Active Indicator Strip */}
                                                {field.value === node.id.toString() && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                                                )}

                                                <div className="p-4 space-y-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn(
                                                                "h-10 w-10 rounded-lg flex items-center justify-center transition-colors border shadow-sm",
                                                                field.value === node.id.toString()
                                                                    ? "bg-blue-500 border-blue-600 text-white"
                                                                    : "bg-background border-border text-muted-foreground"
                                                            )}>
                                                                <Globe className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-foreground group-hover:text-blue-500 transition-colors">{node.name}</div>
                                                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">{node.fqdn}</div>
                                                            </div>
                                                        </div>
                                                        {field.value === node.id.toString() && (
                                                            <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center animate-in zoom-in spin-in-90 duration-300 shadow-md">
                                                                <Check className="h-3 w-3 text-white" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-xs items-center">
                                                            <span className={cn(
                                                                "font-medium",
                                                                isFull ? "text-red-500" : "text-muted-foreground"
                                                            )}>
                                                                {isFull ? "Node Full" : "Capacity"}
                                                            </span>
                                                            <span className="text-foreground font-mono text-[10px] bg-background border px-1.5 py-0.5 rounded-md">
                                                                {node.usage} / {node.limit}
                                                            </span>
                                                        </div>

                                                        <Progress
                                                            value={percentage}
                                                            className="h-2 bg-secondary/50"
                                                            indicatorClassName={cn(
                                                                percentage >= 100 ? "bg-red-500" :
                                                                    percentage > 80 ? "bg-amber-500" : "bg-blue-500"
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}
