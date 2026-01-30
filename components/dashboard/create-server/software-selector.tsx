"use client"

import { Database, Box, Layers } from "lucide-react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface SoftwareSelectorProps {
    form: any
    nests: any[]
    eggs: any[]
    loadingEggs: boolean
    watchNest: string
}

export function SoftwareSelector({ form, nests, eggs, loadingEggs, watchNest }: SoftwareSelectorProps) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Layers className="h-5 w-5 text-emerald-500" />
                    Software Platform
                </h3>
                <p className="text-sm text-muted-foreground">Choose the game engine and version you want to run.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="nestId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-muted-foreground flex items-center gap-2">
                                    <Box className="h-3 w-3" /> Category
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="bg-background border-input text-foreground h-12">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-card border-border text-foreground">
                                        {nests.map((nest) => (
                                            <SelectItem key={nest.id} value={nest.id.toString()}>
                                                {nest.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="eggId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-muted-foreground flex items-center gap-2">
                                    <Database className="h-3 w-3" /> Engine Version
                                </FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    disabled={!watchNest || loadingEggs}
                                >
                                    <FormControl>
                                        <SelectTrigger className="bg-background border-input text-foreground h-12 disabled:opacity-50">
                                            <SelectValue placeholder={loadingEggs ? "Loading..." : "Select Version"} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-card border-border text-foreground">
                                        {eggs.map((egg) => (
                                            <SelectItem key={egg.id} value={egg.id.toString()}>
                                                {egg.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
    )
}
