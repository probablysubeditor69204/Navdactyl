"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Server, Globe, Box, Database, Save, RotateCcw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const createServerSchema = z.object({
    name: z.string().min(3, "Server name must be at least 3 characters").max(191),
    nodeId: z.string().min(1, "Please select a node"),
    nestId: z.string().min(1, "Please select a nest"),
    eggId: z.string().min(1, "Please select an egg"),
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
    const [settings, setSettings] = useState<any>(null)

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
                if (!settingsData.error) setSettings(settingsData)
            } catch (err) {
                console.error("Failed to fetch dashboard resources", err)
                toast.error("Could not load nodes or nests")
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
                toast.error("Failed to load eggs for selected nest")
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

            toast.success("Server created successfully!")
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
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <Card className="bg-[#18181b] border-[#27272a] shadow-xl">
            <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                    <Server className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-white">Create New Instance</CardTitle>
                </div>
                <CardDescription>
                    Configure your new game server. Resource limits are pre-set to {settings?.freeServerMemory || 4096}MB RAM, {settings?.freeServerDisk / 1024 || 10}GB Disk, and {settings?.freeServerCpu || 100}% CPU.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-zinc-400">Server Name</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                placeholder="My Awesome Minecraft Server"
                                                {...field}
                                                className="bg-[#09090b] border-[#27272a] text-white focus:border-blue-500/50 transition-colors"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormDescription className="text-zinc-500">
                                        Give your server a recognizable name.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Node Selection */}
                            <FormField
                                control={form.control}
                                name="nodeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-zinc-400 flex items-center gap-2">
                                            <Globe className="h-3 w-3" /> Location / Node
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-[#09090b] border-[#27272a] text-white">
                                                    <SelectValue placeholder="Select a node" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-[#18181b] border-[#27272a] text-white">
                                                {nodes
                                                    .filter(node => {
                                                        if (!settings?.allowedNodes) return true;
                                                        const allowedIds = settings.allowedNodes.split(',').map((id: string) => parseInt(id.trim()));
                                                        return allowedIds.includes(node.id);
                                                    })
                                                    .map((node) => (
                                                        <SelectItem key={node.id} value={node.id.toString()}>
                                                            {node.name} <span className="text-[10px] text-zinc-500 ml-2">({node.fqdn})</span>
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Nest Selection */}
                            <FormField
                                control={form.control}
                                name="nestId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-zinc-400 flex items-center gap-2">
                                            <Box className="h-3 w-3" /> Category / Nest
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-[#09090b] border-[#27272a] text-white">
                                                    <SelectValue placeholder="Select a nest" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-[#18181b] border-[#27272a] text-white">
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
                        </div>

                        {/* Egg Selection */}
                        <FormField
                            control={form.control}
                            name="eggId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-zinc-400 flex items-center gap-2">
                                        <Database className="h-3 w-3" /> Software / Egg
                                    </FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={!watchNest || loadingEggs}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-[#09090b] border-[#27272a] text-white">
                                                <SelectValue placeholder={loadingEggs ? "Loading..." : "Select an egg"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-[#18181b] border-[#27272a] text-white">
                                            {eggs.map((egg) => (
                                                <SelectItem key={egg.id} value={egg.id.toString()}>
                                                    {egg.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {!watchNest && (
                                        <FormDescription className="text-zinc-600 italic">
                                            Select a Nest first to see available server software.
                                        </FormDescription>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Summary of Defaults */}
                        <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10 space-y-3">
                            <p className="text-[10px] uppercase font-bold text-blue-400 tracking-widest">Default Resource Allocation</p>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="bg-[#27272a] text-zinc-300 border-zinc-700 font-mono">RAM: {settings?.freeServerMemory || 4096}MB</Badge>
                                <Badge variant="secondary" className="bg-[#27272a] text-zinc-300 border-zinc-700 font-mono">DISK: {(settings?.freeServerDisk / 1024) || 10}GB</Badge>
                                <Badge variant="secondary" className="bg-[#27272a] text-zinc-300 border-zinc-700 font-mono">CPU: {settings?.freeServerCpu || 100}%</Badge>
                                <Badge variant="secondary" className="bg-[#27272a] text-zinc-300 border-zinc-700 font-mono">DBs: 2</Badge>
                                <Badge variant="secondary" className="bg-[#27272a] text-zinc-300 border-zinc-700 font-mono">Backups: 4</Badge>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-11"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Server...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Deploy Server
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => form.reset()}
                                className="bg-transparent border-[#27272a] text-zinc-400 hover:text-white"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
