"use client"

import { Input } from "@/components/ui/input"
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { Rocket } from "lucide-react"

export function ServerDetailsCard({ form }: { form: any }) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-purple-500" />
                    Server Identity
                </h3>
                <p className="text-sm text-muted-foreground">Give your new server a recognizable name.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        placeholder="My Awesome Server"
                                        {...field}
                                        className="bg-background border-input text-foreground h-14 px-4 text-lg placeholder:text-muted-foreground/50 focus-visible:ring-blue-500/50"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    )
}
