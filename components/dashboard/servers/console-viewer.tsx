"use client"

import { useEffect, useRef, useState } from "react"
import { Play, RotateCcw, Square, Terminal, Zap, Hash, Cpu, HardDrive, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
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

interface ConsoleViewerProps {
    identifier: string;
    serverName: string;
}

export function ConsoleViewer({ identifier, serverName }: ConsoleViewerProps) {
    const [logs, setLogs] = useState<string[]>([])
    const [status, setStatus] = useState<string>("offline")
    const [stats, setStats] = useState<any>(null)
    const [command, setCommand] = useState("")
    const [loading, setLoading] = useState(false)
    const [eulaMissing, setEulaMissing] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const socketRef = useRef<WebSocket | null>(null)

    useEffect(() => {
        connectWebsocket()
        return () => {
            if (socketRef.current) socketRef.current.close()
        }
    }, [identifier])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [logs])

    const connectWebsocket = async () => {
        try {
            setLogs(prev => [...prev, "[System] Connecting to server console..."])
            const res = await fetch(`/api/servers/${identifier}/websocket`)

            if (!res.ok) {
                const errorData = await res.json()
                setLogs(prev => [...prev, `[System] Error: ${errorData.error || 'Failed to fetch websocket credentials'}`])
                return
            }

            const data = await res.json()

            if (data.error) {
                setLogs(prev => [...prev, `[System] Error: ${data.error}`])
                return
            }

            const socketData = data.data || data;

            if (!socketData.socket || !socketData.token) {
                setLogs(prev => [...prev, "[System] Error: Invalid websocket credentials received"])
                return
            }

            setLogs(prev => [...prev, `[System] Connecting to ${socketData.socket}...`])
            const socket = new WebSocket(socketData.socket)
            socketRef.current = socket

            socket.onopen = () => {
                setLogs(prev => [...prev, "[System] WebSocket connected, authenticating..."])
                socket.send(JSON.stringify({ event: "auth", args: [socketData.token] }))
            }

            socket.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data)

                    switch (msg.event) {
                        case "auth success":
                            setLogs(prev => [...prev, "[System] Authentication successful!"])
                            setLogs(prev => [...prev, "[System] ✓ Connected - You'll see new logs as they appear"])
                            // Request initial server status
                            socket.send(JSON.stringify({ event: "send stats" }))
                            break
                        case "status":
                            setStatus(msg.args[0])
                            break
                        case "console output":
                            const logLine = msg.args[0];
                            // Check for EULA message
                            if (logLine.toLowerCase().includes("you need to agree to the eula in order to run the server")) {
                                setEulaMissing(true);
                            }

                            // Limit to last 200 lines for performance
                            setLogs(prev => {
                                const newLogs = [...prev, logLine];
                                if (newLogs.length > 200) {
                                    return newLogs.slice(-200);
                                }
                                return newLogs;
                            })
                            break
                        case "stats":
                            const statsData = JSON.parse(msg.args[0])
                            setStats(statsData)
                            break
                        case "token expiring":
                            setLogs(prev => [...prev, "[System] Token expiring, reconnecting..."])
                            connectWebsocket()
                            break
                    }
                } catch (err) {
                    console.error("WebSocket message parse error:", err)
                }
            }

            socket.onerror = (error) => {
                console.error("WebSocket error:", error)
                setLogs(prev => [...prev, "[System] WebSocket error occurred. This is often caused by Wings CORS (allowed_origins) or a firewall."])
            }

            socket.onclose = (event) => {
                const reason = event.wasClean ? "Clean close" : "Abnormal closure (check Wings allowed_origins)";
                setLogs(prev => [...prev, `[System] Connection closed (code: ${event.code}, ${reason}). Reconnecting in 5s...`])
                setTimeout(connectWebsocket, 5000)
            }

        } catch (error) {
            console.error("WS Error", error)
            setTimeout(connectWebsocket, 5000)
        }
    }

    const handleAcceptEula = async () => {
        setLoading(true);
        try {
            // Write eula=true to eula.txt
            const res = await fetch(`/api/servers/${identifier}/files/write`, {
                method: "POST",
                body: JSON.stringify({
                    file: "eula.txt",
                    content: "eula=true"
                }),
                headers: { "Content-Type": "application/json" }
            });

            if (!res.ok) {
                toast.error("Failed to write to eula.txt");
                setLoading(false);
                return;
            }

            toast.success("EULA Accepted! Restarting server...");
            setEulaMissing(false);

            // Trigger restart
            await handlePowerAction("restart");

        } catch (error) {
            toast.error("Failed to accept EULA");
            setLoading(false);
        }
    };

    const handlePowerAction = async (action: string) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/servers/${identifier}/power`, {
                method: "POST",
                body: JSON.stringify({ signal: action }),
                headers: { "Content-Type": "application/json" }
            })
            if (!res.ok) {
                const data = await res.json()
                toast.error(data.error || "Action failed")
            }
        } catch (error) {
            toast.error("Network error")
        } finally {
            setLoading(false)
        }
    }

    const handleSendCommand = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!command.trim()) return

        try {
            await fetch(`/api/servers/${identifier}/command`, {
                method: "POST",
                body: JSON.stringify({ command: command.trim() }),
                headers: { "Content-Type": "application/json" }
            })
            setCommand("")
        } catch (error) {
            toast.error("Failed to send command")
        }
    }

    const handleDeleteServer = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/servers/${identifier}/delete`, {
                method: "DELETE"
            })
            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "Failed to delete server")
                setLoading(false)
                return
            }

            toast.success("Server deleted successfully")
            // Redirect to dashboard after a moment
            setTimeout(() => {
                window.location.href = "/dashboard"
            }, 1000)
        } catch (error) {
            toast.error("Network error deleting server")
            setLoading(false)
        }
    }

    const formatBytes = (bytes: number) => {
        if (!bytes || bytes <= 0) return "0.00 B"
        const i = Math.floor(Math.log(bytes) / Math.log(1024))
        const index = Math.max(0, i);
        return (bytes / Math.pow(1024, index)).toFixed(2) + " " + ["B", "KB", "MB", "GB", "TB"][index]
    }

    return (
        <div className="space-y-6">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Status</p>
                        <div className="flex items-center gap-2">
                            <div className={cn("h-2 w-2 rounded-full animate-pulse",
                                status === "running" ? "bg-emerald-500" :
                                    status === "starting" ? "bg-yellow-500" : "bg-red-500")}
                            />
                            <p className="text-sm font-bold text-white capitalize">{status}</p>
                        </div>
                    </div>
                    <Zap className={cn("h-5 w-5", status === "running" ? "text-emerald-500" : "text-muted-foreground")} />
                </div>
                <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">CPU Load</p>
                        <p className="text-sm font-bold text-white">{stats?.cpu_absolute?.toFixed(2) || "0.00"}%</p>
                    </div>
                    <Cpu className="h-5 w-5 text-blue-500" />
                </div>
                <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Memory Usage</p>
                        <p className="text-sm font-bold text-white">{formatBytes(stats?.memory_bytes) || "0.00 MB"}</p>
                    </div>
                    <HardDrive className="h-5 w-5 text-purple-500" />
                </div>
                <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Network (RX/TX)</p>
                        <p className="text-sm font-bold text-white">{formatBytes(stats?.network_rx_bytes)} / {formatBytes(stats?.network_tx_bytes)}</p>
                    </div>
                    <Hash className="h-5 w-5 text-amber-500" />
                </div>
            </div>

            {/* Console Area */}
            <div className="flex items-center gap-2 mb-4">
                <Terminal className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-white tracking-tight">Console</h3>
            </div>

            {eulaMissing && (
                <div className="mb-4 bg-amber-500/10 border border-amber-500/50 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                            <h4 className="font-bold text-amber-500">EULA Acceptance Required</h4>
                            <p className="text-sm text-zinc-400">You must accept the Minecraft EULA to run this server.</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleAcceptEula}
                        disabled={loading}
                        className="bg-amber-500 hover:bg-amber-600 text-black font-bold border-none"
                    >
                        I Accept (eula=true)
                    </Button>
                </div>
            )}

            <div className="relative group">
                <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="outline" className="h-8 bg-zinc-900/80 border-zinc-700 text-white" onClick={() => setLogs([])}>Clear</Button>
                </div>
                <div
                    ref={scrollRef}
                    className="h-[500px] w-full bg-[#050505] border border-border rounded-xl p-6 font-mono text-[13px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent selection:bg-primary/30"
                >
                    {logs.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-20">
                            <Terminal className="h-12 w-12 mb-4" />
                            <p>Connecting to {serverName}...</p>
                        </div>
                    )}
                    {logs.map((log, i) => (
                        <div key={i} className="whitespace-pre-wrap break-all mb-0.5 text-zinc-300">
                            <span className="opacity-30 mr-2">[{new Date().toLocaleTimeString()}]</span>
                            {log}
                        </div>
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <form onSubmit={handleSendCommand} className="flex-1 w-full relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Terminal className="h-4 w-4" />
                    </div>
                    <Input
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        onPaste={(e) => {
                            // Allow default paste behavior
                            e.stopPropagation();
                        }}
                        placeholder="Type a command..."
                        className="bg-background border-border pl-10 h-10 w-full"
                    />
                </form>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button
                        disabled={loading || status !== "offline"}
                        onClick={() => handlePowerAction("start")}
                        className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    >
                        <Play className="h-4 w-4 fill-current" /> Start
                    </Button>
                    <Button
                        disabled={loading || status === "offline"}
                        onClick={() => handlePowerAction("restart")}
                        className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    >
                        <RotateCcw className="h-4 w-4" /> Restart
                    </Button>
                    <Button
                        disabled={loading || status === "offline"}
                        onClick={() => handlePowerAction(status === "stopping" ? "kill" : "stop")}
                        className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white gap-2"
                    >
                        <Square className="h-4 w-4 fill-current" /> {status === "stopping" ? "Kill" : "Stop"}
                    </Button>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="border border-red-900/50 bg-red-950/10 rounded-xl p-6 mt-8">
                <h3 className="text-red-500 font-bold mb-2">Danger Zone</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-zinc-400 text-sm">Delete this server permanently.</p>
                        <p className="text-zinc-500 text-xs">This action cannot be undone. All data will be lost.</p>
                    </div>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={loading}>
                                Delete Server
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription className="text-zinc-400">
                                    This action cannot be undone. This will permanently delete your server
                                    <span className="font-bold text-white"> {serverName} </span>
                                    and remove all data associated with it.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700 hover:text-white">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteServer} className="bg-red-600 text-white hover:bg-red-700">
                                    Delete Server
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    )
}
