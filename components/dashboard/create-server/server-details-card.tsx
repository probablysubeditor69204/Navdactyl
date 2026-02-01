"use client"

import { Input } from "@/components/ui/input"
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { Fingerprint } from "lucide-react"

export function ServerDetailsCard({ form }: { form: any }) {
    return (
        <Card className="rounded-xl border-border bg-card shadow-sm">
            <CardContent className="p-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                                <Fingerprint className="h-3.5 w-3.5" />
                                Server Name
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter instance name..."
                                    className="h-11 bg-[#09090b] border-border/50 focus:border-primary/50 transition-colors px-4 font-medium rounded-lg"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    )
}
