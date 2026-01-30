"use client"

import { useEffect, useState } from "react"
import { MessageSquare, Clock, User, CheckCircle2, ChevronRight, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function TicketsTab() {
    const [tickets, setTickets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const res = await fetch("/api/admin/tickets")
                const data = await res.json()
                if (data.tickets) {
                    setTickets(data.tickets)
                }
            } catch (error) {
                toast.error("Failed to load admin tickets")
            } finally {
                setLoading(false)
            }
        }
        fetchTickets()
    }, [])

    const filteredTickets = tickets.filter(t =>
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.user?.username.toLowerCase().includes(search.toLowerCase()) ||
        t.user?.email.toLowerCase().includes(search.toLowerCase())
    )

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "OPEN":
                return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Open</Badge>
            case "ANSWERED":
                return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Answered</Badge>
            case "CLOSED":
                return <Badge variant="outline" className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Closed</Badge>
            default:
                return null
        }
    }

    if (loading) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
                <CardHeader className="bg-zinc-950/20 border-b border-border/50 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                                <MessageSquare className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold tracking-tight">Support Tickets</CardTitle>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Manage all user inquiries</p>
                            </div>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Input
                                placeholder="Search by subject, user or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-[#09090b] h-10 px-4 rounded-xl border-border/50 text-sm"
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                        {filteredTickets.length === 0 ? (
                            <div className="p-12 text-center">
                                <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                                <p className="text-muted-foreground font-medium italic">No tickets found matching your search.</p>
                            </div>
                        ) : (
                            filteredTickets.map((ticket) => (
                                <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`} className="block hover:bg-zinc-900/40 transition-colors group">
                                    <div className="flex items-center p-6 gap-6">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-white font-bold text-base truncate leading-none group-hover:text-primary transition-colors">{ticket.subject}</h4>
                                                {getStatusBadge(ticket.status)}
                                            </div>
                                            <div className="flex items-center gap-4 flex-wrap">
                                                <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                                                    <User className="h-3 w-3 text-primary/60" />
                                                    {ticket.user.username} ({ticket.user.email})
                                                </div>
                                                <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                                                    <Clock className="h-3 w-3" />
                                                    Last Activity {new Date(ticket.updatedAt).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight className="h-4 w-4 text-white" />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
