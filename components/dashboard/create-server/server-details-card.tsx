"use client"

import { Input } from "@/components/ui/input"
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Fingerprint } from "lucide-react"

export function ServerDetailsCard({ form }: { form: any }) {
    return (
        <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/[0.02] border-b border-border/50 pb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Fingerprint className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl font-bold">Instance Identity</CardTitle>
                </div>
                <CardDescription className="text-muted-foreground">General information to identify your instance.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground/80">Server Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter instance name..."
                                    className="h-11 bg-[#09090b] border-border/50 focus:border-primary/50 transition-colors px-4 font-medium"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    )
}
