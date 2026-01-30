"use client"

import { useState, useEffect } from "react"
import {
    Loader2,
    Search,
    Trash2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function ServersTab() {
    const [servers, setServers] = useState<any[]>([])
    const [serverPagination, setServerPagination] = useState<any>(null)
    const [serverPage, setServerPage] = useState(1)
    const [serversLoading, setServersLoading] = useState(true)
    const [deletingServerId, setDeletingServerId] = useState<number | null>(null)
    const [search, setSearch] = useState("")

    const fetchServers = async (page: number) => {
        setServersLoading(true)
        try {
            const res = await fetch(`/api/admin/servers?page=${page}`)
            const data = await res.json()
            if (data.servers) {
                setServers(data.servers)
                setServerPagination(data.pagination)
            }
        } catch (error) {
            console.error("Failed to fetch servers", error)
            toast.error("Failed to load servers")
        } finally {
            setServersLoading(false)
        }
    }

    useEffect(() => {
        fetchServers(serverPage)
    }, [serverPage])

    const handleDeleteServer = async (id: number) => {
        setDeletingServerId(id)
        try {
            const res = await fetch(`/api/admin/servers/${id}`, { method: 'DELETE' })
            if (res.ok) {
                toast.success("Server deleted successfully")
                setServers(servers.filter((s: any) => s.id !== id))
            } else {
                const data = await res.json()
                toast.error(data.error || "Failed to delete server")
            }
        } catch (err) {
            toast.error("An error occurred")
        } finally {
            setDeletingServerId(null)
        }
    }

    return (
        <Card className="bg-[#18181b] border-[#27272a] min-h-[500px]">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-white">Global Instances</CardTitle>
                    <CardDescription>Monitor and delete servers across all nodes.</CardDescription>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Filter servers..." className="pl-8 bg-[#09090b] border-[#27272a]" onChange={(e) => setSearch(e.target.value)} />
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow className="border-[#27272a]"><TableHead>Server Name</TableHead><TableHead>Resources</TableHead><TableHead>Node</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {serversLoading ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-500" /></TableCell></TableRow>
                        ) : (
                            servers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.identifier.toLowerCase().includes(search.toLowerCase())).map((server: any) => (
                                <TableRow key={server.id} className="border-[#27272a] hover:bg-white/5">
                                    <TableCell className="text-zinc-300 font-medium">
                                        {server.name}
                                        <div className="text-[10px] text-zinc-500 font-mono">{server.identifier}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-[10px] flex gap-2">
                                            <span className="text-zinc-400">{server.limits.cpu}% CPU</span>
                                            <span className="text-zinc-500">|</span>
                                            <span className="text-zinc-400">{server.limits.memory}MB RAM</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-500 text-xs">Node #{server.node}</TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="icon" variant="ghost" className="text-red-500" disabled={deletingServerId === server.id}>
                                                    {deletingServerId === server.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-white">Delete Server?</AlertDialogTitle>
                                                    <AlertDialogDescription className="text-zinc-400">
                                                        This will permanently delete <span className="text-white font-bold">{server.name}</span>. This action is irreversible.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteServer(server.id)} className="bg-red-600 text-white hover:bg-red-700">
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                {serverPagination && serverPagination.total_pages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-xs text-zinc-500">Page {serverPage} of {serverPagination.total_pages}</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setServerPage(p => Math.max(1, p - 1))} disabled={serverPage === 1 || serversLoading}>Previous</Button>
                            <Button variant="outline" size="sm" onClick={() => setServerPage(p => Math.min(serverPagination.total_pages, p + 1))} disabled={serverPage === serverPagination.total_pages || serversLoading}>Next</Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
