"use client"

import { Database, Box, Layers, Cpu, Code2, Loader2 } from "lucide-react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SoftwareSelectorProps {
    form: any
    nests: any[]
    eggs: any[]
    loadingEggs: boolean
    watchNest: string
}

export function SoftwareSelector({ form, nests, eggs, loadingEggs, watchNest }: SoftwareSelectorProps) {
    return (
        <Card className="rounded-xl border-border bg-card shadow-sm">
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="nestId"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                                    <Box className="h-3.5 w-3.5" /> Platform Category
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-11 bg-[#09090b] border-border/50 focus:border-primary/50 transition-colors px-4 font-semibold rounded-lg group">
                                            <SelectValue placeholder="Select Platform Type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-[#18181b] border-border text-white rounded-xl shadow-2xl">
                                        {nests.map((nest) => (
                                            <SelectItem key={nest.id} value={nest.id.toString()} className="rounded-lg focus:bg-primary/10 focus:text-primary py-2.5 font-medium cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <Cpu className="h-4 w-4 opacity-40" />
                                                    {nest.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage className="text-xs" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="eggId"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Code2 className="h-3.5 w-3.5" /> Software Version
                                    </div>
                                    {loadingEggs && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                                </FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={!watchNest || loadingEggs}
                                >
                                    <FormControl>
                                        <SelectTrigger className={cn(
                                            "h-11 bg-[#09090b] border-border/50 focus:border-primary/50 transition-all px-4 font-semibold opacity-100 rounded-lg",
                                            (!watchNest || loadingEggs) && "opacity-40 cursor-not-allowed"
                                        )}>
                                            <SelectValue placeholder={loadingEggs ? "Loading..." : "Select Software"} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-[#18181b] border-border text-white rounded-xl shadow-2xl max-h-[300px]">
                                        {eggs.map((egg) => (
                                            <SelectItem key={egg.id} value={egg.id.toString()} className="rounded-lg focus:bg-primary/10 focus:text-primary py-2.5 font-medium cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <Database className="h-4 w-4 opacity-40" />
                                                    {egg.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {!watchNest && <FormDescription className="text-[10px] text-muted-foreground/40 italic uppercase mt-1">Select category first</FormDescription>}
                                <FormMessage className="text-xs" />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
