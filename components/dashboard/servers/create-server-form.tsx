"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Server, Settings, Zap, Shield, Globe, Cpu, ChevronRight, Sparkles } from "lucide-react"

import { Form } from "@/components/ui/form"
import { ServerDetailsCard } from "@/components/dashboard/create-server/server-details-card"
import { LocationSelector } from "@/components/dashboard/create-server/location-selector"
import { SoftwareSelector } from "@/components/dashboard/create-server/software-selector"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const createServerSchema = z.object({
    name: z.string().min(3, "Server name must be at least 3 characters").max(191),
    nodeId: z.string().min(1, "Please select a location"),
    nestId: z.string().min(1, "Please select a category"),
    eggId: z.string().min(1, "Please select software"),
})

type CreateServerFormValues = z.infer<typeof createServerSchema>

export function CreateServerForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [nodes, setNodes] = useState<any[]>([])
    const [nests, setNests] = useState<any[]>([])
    const [eggs, setEggs] = useState<any[]>([])

    const [loadingResources, setLoadingResources] = useState(true)
    const [loadingEggs, setLoadingEggs] = useState(false)
    const [settings, setSettings] = useState<any>({
        freeServerMemory: 4096,
        freeServerDisk: 10240,
        freeServerCpu: 100
    })

    const form = useForm<CreateServerFormValues>({
        resolver: zodResolver(createServerSchema),
        defaultValues: {
            name: "",
            nodeId: "",
            nestId: "",
            eggId: "",
        },
    })

    const watchAll = form.watch();
    const isReady = !!watchAll.name && !!watchAll.nodeId && !!watchAll.nestId && !!watchAll.eggId;

    useEffect(() => {
        async function fetchInitialResources() {
            try {
                const [nodesRes, nestsRes, settingsRes] = await Promise.all([
                    fetch('/api/pterodactyl/nodes'),
                    fetch('/api/pterodactyl/nests'),
                    fetch('/api/settings')
                ])

                const nodesData = await nodesRes.json()
                const nestsData = await nestsRes.json()
                const settingsData = await settingsRes.json()

                if (nodesData.nodes) setNodes(nodesData.nodes)
                if (nestsData.nests) setNests(nestsData.nests)
                if (!settingsData.error) setSettings((prev: any) => ({ ...prev, ...settingsData }))
            } catch (err) {
                console.error("Failed to fetch resources", err)
                toast.error("Failed to load server options")
            } finally {
                setLoadingResources(false)
            }
        }
        fetchInitialResources()
    }, [])

    const watchNest = form.watch("nestId")
    useEffect(() => {
        if (!watchNest) return

        async function fetchEggs() {
            setLoadingEggs(true)
            setEggs([])
            form.setValue("eggId", "")

            try {
                const res = await fetch(`/api/pterodactyl/nests/${watchNest}/eggs`)
                const data = await res.json()
                if (data.eggs) setEggs(data.eggs)
            } catch (err) {
                toast.error("Failed to load platform software")
            } finally {
                setLoadingEggs(false)
            }
        }
        fetchEggs()
    }, [watchNest, form])

    async function onSubmit(values: CreateServerFormValues) {
        setIsLoading(true)
        try {
            const response = await fetch("/api/servers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: values.name,
                    nodeId: parseInt(values.nodeId),
                    nestId: parseInt(values.nestId),
                    eggId: parseInt(values.eggId),
                }),
            })

            const result = await response.json()
            if (!response.ok) throw new Error(result.error || "Failed to create server")

            toast.success("Server deployment initiated!")
            router.push("/dashboard")
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Failed to create server")
        } finally {
            setIsLoading(false)
        }
    }

    if (loadingResources) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-xl border border-border bg-card shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-medium">Loading configurator...</p>
            </div>
        )
    }

    const allowedNodesList = nodes.filter(node => {
        if (!settings?.allowedNodes) return true;
        const allowedIds = settings.allowedNodes.split(',').map((s: string) => {
            const parts = s.split(':');
            return parseInt(parts[0].trim());
        });
        return allowedIds.includes(node.id);
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12 max-w-4xl mx-auto pb-20">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Create New Instance</h2>
                    <p className="text-muted-foreground">Select your server options and deploy instantly.</p>
                </div>

                <div className="space-y-10">
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-white/50 font-bold uppercase tracking-widest text-xs">
                            <span className="text-primary">01.</span> Identity
                        </div>
                        <ServerDetailsCard form={form} />
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-white/50 font-bold uppercase tracking-widest text-xs">
                            <span className="text-primary">02.</span> Location
                        </div>
                        <LocationSelector form={form} nodes={allowedNodesList} />
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-white/50 font-bold uppercase tracking-widest text-xs">
                            <span className="text-primary">03.</span> Software
                        </div>
                        <SoftwareSelector
                            form={form}
                            nests={nests}
                            eggs={eggs}
                            loadingEggs={loadingEggs}
                            watchNest={watchNest}
                        />
                    </section>
                </div>

                <div className="pt-8 border-t border-border">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Resource Cost</p>
                            <p className="text-2xl font-black text-white">$0.00<span className="text-xs font-bold text-muted-foreground ml-1">/Mo</span></p>
                        </div>
                        <Button
                            type="submit"
                            disabled={isLoading || !isReady}
                            size="lg"
                            className="h-14 px-10 font-bold text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Deploying...
                                </>
                            ) : (
                                <>
                                    Create Server
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}
