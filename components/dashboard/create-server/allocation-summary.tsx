"use client"

import { CheckCircle2, Cpu, HardDrive, Zap, Loader2 } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface AllocationSummarySidebarProps {
    settings: any
    isLoading: boolean
}

export function AllocationSummarySidebar({ settings, isLoading }: AllocationSummarySidebarProps) {
    return (
        <div className="sticky top-6">
            <Card className="overflow-hidden border-border bg-card shadow-lg">
                <CardHeader className="bg-muted/50 pb-4">
                    <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Resource Allocation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-muted p-2 rounded-md">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                </div>
                                <span className="text-sm font-medium text-foreground">Memory</span>
                            </div>
                            <span className="font-mono text-sm font-bold text-foreground bg-muted px-2 py-1 rounded">
                                {settings?.freeServerMemory || 4096} MB
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-muted p-2 rounded-md">
                                    <HardDrive className="h-4 w-4 text-blue-500" />
                                </div>
                                <span className="text-sm font-medium text-foreground">Storage</span>
                            </div>
                            <span className="font-mono text-sm font-bold text-foreground bg-muted px-2 py-1 rounded">
                                {(settings?.freeServerDisk / 1024) || 10} GB
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-muted p-2 rounded-md">
                                    <Cpu className="h-4 w-4 text-orange-500" />
                                </div>
                                <span className="text-sm font-medium text-foreground">CPU Limit</span>
                            </div>
                            <span className="font-mono text-sm font-bold text-foreground bg-muted px-2 py-1 rounded">
                                {settings?.freeServerCpu || 100}%
                            </span>
                        </div>
                    </div>

                    <Separator className="bg-border" />

                    <div className="space-y-2 pt-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Databases</span>
                            <span className="text-foreground font-medium">2 Included</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Allocations</span>
                            <span className="text-foreground font-medium">1 Default</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Backups</span>
                            <span className="text-foreground font-medium">4 Slots</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/30 p-4">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 transition-all"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Provisioning...
                            </>
                        ) : (
                            <>
                                Deploy Server
                                <Zap className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            <p className="mt-4 text-center text-xs text-muted-foreground px-4">
                By deploying this server, you agree to our Terms of Service and Acceptable Use Policy.
            </p>
        </div>
    )
}
