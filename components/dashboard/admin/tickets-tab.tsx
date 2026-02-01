"use client"

import { useEffect, useState } from "react"
import { MessageSquare, Clock, User, ChevronRight, Loader2, Search, Mail, Trash2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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

export function TicketsTab() {
    const [tickets, setTickets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

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

    useEffect(() => {
        fetchTickets()
    }, [])

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        setIsDeleting(id)
        try {
            const res = await fetch(`/api/admin/tickets?id=${id}`, {
                method: "DELETE",
            })

            if (!res.ok) throw new Error("Failed to delete ticket")

            toast.success("Ticket deleted successfully")
            fetchTickets()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsDeleting(null)
        }
    }

    const filteredTickets = tickets.filter(t =>
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.user?.username.toLowerCase().includes(search.toLowerCase()) ||
        t.user?.email.toLowerCase().includes(search.toLowerCase())
    )

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "OPEN":
                return (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        Open
                    </div>
                )
            case "ANSWERED":
                return (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Staff Reply
                    </div>
                )
            case "CLOSED":
                return (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-500/10 text-zinc-500 text-[10px] font-bold uppercase tracking-wider border border-zinc-500/20">
                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                        Closed
                    </div>
                )
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
            <div className="flex items-center gap-4 bg-card border border-border px-4 py-2 rounded-xl">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by subject, username or email..."
                    value={search}
                    onChange={(e) => setSearch - Term(e.target.value)}
                    className="bg-transparent border-0 h-9 p-0 focus-visible:ring-0 text-white placeholder:text-muted-foreground/50"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTickets.length === 0 ? (
                    <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center">
                        <p className="text-muted-foreground font-medium">No matching tickets found.</p>
                    </div>
                ) : (
                    filteredTickets.map((ticket) => (
                        <div key={ticket.id} className="relative group">
                            {/* Card Content & Link */}
                            <Link href={`/dashboard/tickets/${ticket.id}`} className="block">
                                <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/50 transition-all duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="h-10 w-10 relative">
                                            <Avatar className="h-10 w-10 border border-primary/20 bg-primary/5 rounded-lg group-hover:scale-110 transition-transform">
                                                <AvatarImage src={ticket.user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${ticket.user?.username}`} />
                                                <AvatarFallback className="text-xl font-bold uppercase rounded-lg">
                                                    {ticket.user?.username.substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full border-2 border-card">
                                                <MessageSquare className="h-2 w-2" />
                                            </div>
                                        </div>
                                        {/* Status moved to absolute container below */}
                                        <div className="h-5" /> {/* Spacer */}
                                    </div>

                                    <h4 className="text-white font-bold text-lg mb-1 truncate group-hover:text-primary transition-colors">{ticket.subject}</h4>
                                    <div className="space-y-1 mb-6">
                                        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                                            <User className="h-3 w-3 text-primary/40" />
                                            {ticket.user.username}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                                            <Mail className="h-3 w-3 text-primary/40" />
                                            {ticket.user.email}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                                            <Clock className="h-3 w-3" />
                                            Activity {new Date(ticket.updatedAt).toLocaleDateString()}
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                    </div>
                                </div>
                            </Link>

                            {/* Floating Actions & Status Container (Above the link) */}
                            <div className="absolute top-6 right-6 z-30 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                                        >
                                            {isDeleting === ticket.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-[#18181b] border-[#27272a]">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-white">Delete Ticket?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-zinc-500">
                                                This will permanently remove the ticket and all messages. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-transparent border-zinc-800 text-white hover:bg-zinc-800">Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={(e) => handleDelete(ticket.id, e as any)}
                                                className="bg-red-600 text-white hover:bg-red-700 font-bold"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                {getStatusBadge(ticket.status)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
