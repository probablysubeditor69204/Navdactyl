"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

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
    // Initialize settings with defaults to avoid flash of undefined content
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

    // Fetch Initial Resources
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
                console.error("Failed to fetch dashboard resources", err)
                toast.error("Could not load deployment resources")
            } finally {
                setLoadingResources(false)
            }
        }
        fetchInitialResources()
    }, [])

    // Fetch Eggs when Nest changes
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
                toast.error("Failed to load software options")
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

            if (!response.ok) {
                throw new Error(result.error || "Failed to create server")
            }

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
            <div className="flex h-[400px] w-full items-center justify-center rounded-lg border border-border bg-card/50">
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium">Initializing Deployment System...</p>
                </div>
            </div>
        )
    }

    // Filter Allowed Nodes Logic
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

                    {/* Left Column: Configuration Components */}
                    <div className="space-y-6 lg:col-span-2">
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

                    {/* Right Column: Allocation Summary */}
                    <div className="lg:col-span-1">
                        <AllocationSummarySidebar settings={settings} isLoading={isLoading} />
                    </div>

                </div>
            </form>
        </Form>
    )
}
