"use client"

import { useState, useEffect } from "react"
import {
    Shield,
    Globe,
    Cpu,
    Loader2,
    Save,
    ChevronDown,
    X,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function FreeTierTab() {
    const [settingsLoading, setSettingsLoading] = useState(false)
    const [freeServerMemory, setFreeServerMemory] = useState(4096)
    const [freeServerDisk, setFreeServerDisk] = useState(10240)
    const [freeServerCpu, setFreeServerCpu] = useState(100)
    const [serverLimit, setServerLimit] = useState(2)
    const [nodes, setNodes] = useState<any[]>([])
    const [nodeConfigs, setNodeConfigs] = useState<{ id: number, limit: number }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSettings()
        fetchNodes()
    }, [])

    const fetchNodes = async () => {
        try {
            const res = await fetch("/api/pterodactyl/nodes")
            const data = await res.json()
            if (data.nodes) {
                setNodes(data.nodes)
            }
        } catch (error) {
            console.error("Failed to fetch nodes", error)
        }
    }

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings")
            const data = await res.json()
            if (!data.error) {
                setFreeServerMemory(data.freeServerMemory || 4096)
                setFreeServerDisk(data.freeServerDisk || 10240)
                setFreeServerCpu(data.freeServerCpu || 100)
                setServerLimit(data.serverLimit || 2)

                if (data.allowedNodes) {
                    const parsedConfigs = data.allowedNodes.split(',').map((s: string) => {
                        const [idStr, limitStr] = s.split(':').map(part => part.trim())
                        const id = parseInt(idStr)
                        const limit = limitStr ? parseInt(limitStr) : 100
                        return !isNaN(id) ? { id, limit } : null
                    }).filter(Boolean) as { id: number, limit: number }[]
                    setNodeConfigs(parsedConfigs)
                }
            }
        } catch (error) {
            console.error("Failed to fetch settings", error)
        } finally {
            setLoading(false)
        }
    }

    const selectedNodeIds = nodeConfigs.map(c => c.id)

    const toggleNode = (nodeId: number) => {
        if (selectedNodeIds.includes(nodeId)) {
            setNodeConfigs(prev => prev.filter(c => c.id !== nodeId))
        } else {
            setNodeConfigs(prev => [...prev, { id: nodeId, limit: 50 }])
        }
    }

    const updateNodeLimit = (nodeId: number, newLimit: number) => {
        setNodeConfigs(prev => prev.map(c => c.id === nodeId ? { ...c, limit: newLimit } : c))
    }

    const handleSavePlatformSettings = async (e: React.FormEvent) => {
        e.preventDefault()
        setSettingsLoading(true)

        const allowedNodesString = nodeConfigs.map(c => `${c.id}:${c.limit}`).join(', ')

        try {
            // We need to fetch current settings first to avoid overwriting other fields not present here
            // This is a downside of splitting. A better API would support PATCH or we send only what we changed.
            // Assuming the backend endpoint handles partial updates via 'upsert' but we are sending a full object in the main file.
            // Let's modify the backend or fetch-then-update.
            // Since I cannot easily modify the backend strategy mid-flight without risk, I will FETCH current settings inside save, merge, then save.

            const currentRes = await fetch("/api/admin/settings")
            const currentData = await currentRes.json()

            const res = await fetch("/api/admin/settings", {
                method: "POST",
                body: JSON.stringify({
                    ...currentData, // Merge existing
                    freeServerMemory: Number(freeServerMemory),
                    freeServerDisk: Number(freeServerDisk),
                    freeServerCpu: Number(freeServerCpu),
                    serverLimit: Number(serverLimit),
                    allowedNodes: allowedNodesString,
                }),
                headers: { "Content-Type": "application/json" }
            })

            if (res.ok) {
                toast.success("Free Tier settings updated successfully!")
            } else {
                const data = await res.json()
                toast.error(data.error || "Failed to update settings")
            }
        } catch (error) {
            toast.error("An error occurred while saving settings")
        } finally {
            setSettingsLoading(false)
        }
    }

    if (loading) return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-zinc-500" /></div>

    return (
        <form onSubmit={handleSavePlatformSettings}>
            <div className="grid gap-6 md:grid-cols-2">
                {/* Resource Limits */}
                <Card className="bg-[#18181b] border-[#27272a]">
                    <CardHeader>
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                            <Cpu className="h-5 w-5 text-orange-500" />
                            Default Resources
                        </CardTitle>
                        <CardDescription>
                            Allocated resources for every new free server.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Memory (MB)</Label>
                            <Input type="number" value={freeServerMemory} onChange={(e) => setFreeServerMemory(Number(e.target.value))} className="bg-[#09090b] border-[#27272a]" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Disk Space (MB)</Label>
                            <Input type="number" value={freeServerDisk} onChange={(e) => setFreeServerDisk(Number(e.target.value))} className="bg-[#09090b] border-[#27272a]" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-300">CPU Limit (%)</Label>
                            <Input type="number" value={freeServerCpu} onChange={(e) => setFreeServerCpu(Number(e.target.value))} className="bg-[#09090b] border-[#27272a]" />
                        </div>
                    </CardContent>
                </Card>

                {/* Policies & Expansion */}
                <div className="space-y-6">
                    <Card className="bg-[#18181b] border-[#27272a]">
                        <CardHeader>
                            <CardTitle className="text-lg text-white flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-500" />
                                Usage Policies
                            </CardTitle>
                            <CardDescription>
                                Control how many servers a free user can create.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-zinc-300">Max Servers per User</Label>
                                <Input type="number" value={serverLimit} onChange={(e) => setServerLimit(Number(e.target.value))} className="bg-[#09090b] border-[#27272a]" />
                                <p className="text-xs text-zinc-500">Total number of servers a single account can deploy.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#18181b] border-[#27272a]">
                        <CardHeader>
                            <CardTitle className="text-lg text-white flex items-center gap-2">
                                <Globe className="h-5 w-5 text-purple-500" />
                                Deployment Nodes
                            </CardTitle>
                            <CardDescription>
                                Configure available nodes and their capacity.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-300">Add Node</Label>
                                {/* Dropdown for ADDING nodes */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" role="combobox" className="w-full justify-between bg-[#09090b] border-[#27272a] text-zinc-300 hover:text-white hover:bg-[#1a1a1e]">
                                            Select nodes to enable...
                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[300px] bg-[#18181b] border-[#27272a] text-zinc-300 max-h-[300px] overflow-auto">
                                        <DropdownMenuLabel>Available Nodes</DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-[#27272a]" />
                                        {nodes.length === 0 ? (
                                            <div className="px-2 py-4 text-center text-sm text-zinc-500">
                                                No nodes found. Check connection.
                                            </div>
                                        ) : (
                                            nodes.map((node) => (
                                                <DropdownMenuCheckboxItem
                                                    key={node.id}
                                                    checked={selectedNodeIds.includes(node.id)}
                                                    onCheckedChange={() => toggleNode(node.id)}
                                                    className="hover:bg-[#27272a] focus:bg-[#27272a]"
                                                >
                                                    <span className="flex flex-col">
                                                        <span className="font-medium text-white">{node.name}</span>
                                                        <span className="text-xs text-zinc-500">ID: {node.id} • {node.fqdn}</span>
                                                    </span>
                                                </DropdownMenuCheckboxItem>
                                            ))
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* List of Configured Nodes */}
                            {nodeConfigs.length > 0 && (
                                <div className="space-y-3">
                                    <Label className="text-zinc-300">Configured Nodes</Label>
                                    {nodeConfigs.map((config) => {
                                        const nodeDetails = nodes.find(n => n.id === config.id)
                                        return (
                                            <div key={config.id} className="flex items-center gap-3 p-3 rounded-md bg-[#09090b] border border-[#27272a]">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-white">{nodeDetails?.name || `Node #${config.id}`}</h4>
                                                    <p className="text-[10px] text-zinc-500">{nodeDetails?.fqdn || 'Unknown Host'}</p>
                                                </div>
                                                <div className="w-24">
                                                    <Label className="sr-only">Max Servers</Label>
                                                    <Input
                                                        type="number"
                                                        value={config.limit}
                                                        onChange={(e) => updateNodeLimit(config.id, parseInt(e.target.value) || 0)}
                                                        className="h-8 text-xs bg-[#18181b] border-[#27272a]"
                                                        placeholder="Limit"
                                                    />
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                                                    onClick={() => toggleNode(config.id)}
                                                    type="button"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                            <p className="text-xs text-zinc-500">Set the maximum number of free servers allowed on each node.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <Button type="submit" disabled={settingsLoading} className="bg-white text-black hover:bg-zinc-200 px-8">
                    {settingsLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Free Tier Settings
                </Button>
            </div>
        </form>
    )
}
