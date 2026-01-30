"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Server, Settings } from "lucide-react"

import { Form } from "@/components/ui/form"
import { ServerDetailsCard } from "@/components/dashboard/create-server/server-details-card"
import { LocationSelector } from "@/components/dashboard/create-server/location-selector"
import { SoftwareSelector } from "@/components/dashboard/create-server/software-selector"
import { AllocationSummarySidebar } from "@/components/dashboard/create-server/allocation-summary"

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
                if (!settingsData.error) setSettings(prev => ({ ...prev, ...settingsData }))
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
            <div className="flex h-[450px] w-full flex-col items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
                <div className="bg-primary/5 p-4 rounded-full mb-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
                <h3 className="text-white font-bold text-lg mb-1">Loading Options</h3>
                <p className="text-muted-foreground text-sm">Initializing deployment configurator...</p>
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-8 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest mb-2">
                            <Server className="h-3 w-3" />
                            Configurator
                        </div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight">Deploy Instance</h1>
                        <p className="text-muted-foreground text-sm font-medium">Configure your new high-performance cloud server.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-card border border-border px-4 py-2.5 rounded-xl shadow-sm">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-bold text-white uppercase tracking-tight">API Integrated</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="space-y-10 lg:col-span-2">
                        <ServerDetailsCard form={form} />
                        <LocationSelector form={form} nodes={allowedNodesList} />
                        <SoftwareSelector
                            form={form}
                            nests={nests}
                            eggs={eggs}
                            loadingEggs={loadingEggs}
                            watchNest={watchNest}
                        />
                    </div>

                    <div className="lg:col-span-1">
                        <AllocationSummarySidebar settings={settings} isLoading={isLoading} watchAll={watchAll} />
                    </div>
                </div>
            </form>
        </Form>
    )
}
