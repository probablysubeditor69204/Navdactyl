"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MessageSquare, Send, Loader2, User, ShieldCheck, Clock } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export default function TicketDetailsPage() {
    const { id } = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const [ticket, setTicket] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [message, setMessage] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)

    const fetchTicket = async () => {
        try {
            const res = await fetch(`/api/tickets/${id}`)
            const data = await res.json()
            if (data.ticket) {
                setTicket(data.ticket)
                setTimeout(() => {
                    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
                }, 100)
            } else {
                toast.error(data.error || "Failed to load ticket")
            }
        } catch (error) {
            toast.error("Failed to load ticket")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTicket()
    }, [id])

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!message.trim() || sending) return

        setSending(true)
        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: message }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to send message")

            setMessage("")
            fetchTicket()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setSending(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
            </div>
        )
    }

    if (!ticket) return null

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "OPEN":
                return "bg-blue-500/10 text-blue-500 border-blue-500/20"
            case "ANSWERED":
                return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            case "CLOSED":
                return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
            default:
                return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    className="gap-2 text-muted-foreground hover:text-white"
                    onClick={() => router.push("/dashboard/tickets")}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Tickets
                </Button>

                <Badge
                    variant="outline"
                    className={cn("px-3 py-1 font-bold uppercase tracking-wider text-[10px] rounded-full", getStatusBadge(ticket.status))}
                >
                    <div className={cn(
                        "h-1.5 w-1.5 rounded-full mr-2",
                        ticket.status === 'OPEN' ? "bg-blue-500 animate-pulse" :
                            ticket.status === 'ANSWERED' ? "bg-emerald-500" : "bg-zinc-500"
                    )} />
                    {ticket.status}
                </Badge>
            </div>

            {/* Main Card */}
            <Card className="rounded-xl border-border bg-card shadow-sm">
                <CardHeader className="border-b border-border p-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-white tracking-tight">{ticket.subject}</h2>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                Created {new Date(ticket.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    {/* Messages */}
                    <div className="space-y-6 mb-6">
                        {ticket.messages.map((msg: any) => {
                            const isMe = msg.userId === (session?.user as any)?.id
                            const isAdmin = msg.isAdmin

                            return (
                                <div
                                    key={msg.id}
                                    className={cn("flex flex-col", isMe ? "items-end" : "items-start")}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        {!isMe && (
                                            <div
                                                className={cn(
                                                    "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider",
                                                    isAdmin ? "text-emerald-500" : "text-muted-foreground"
                                                )}
                                            >
                                                {isAdmin ? <ShieldCheck className="h-3 w-3" /> : <User className="h-3 w-3" />}
                                                {isAdmin ? "Support Team" : ticket.user.username}
                                            </div>
                                        )}
                                        <span className="text-[9px] text-muted-foreground/40 font-bold uppercase">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                    <div
                                        className={cn(
                                            "max-w-[85%] px-4 py-3 rounded-lg text-sm font-medium",
                                            isMe
                                                ? "bg-primary text-primary-foreground"
                                                : isAdmin
                                                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-100"
                                                    : "bg-[#18181b] border border-border text-white"
                                        )}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={scrollRef} />
                    </div>

                    {/* Reply Form */}
                    {ticket.status !== "CLOSED" ? (
                        <div className="bg-[#09090b] rounded-lg border border-border p-4">
                            <form onSubmit={handleSend} className="relative">
                                <Textarea
                                    placeholder="Type your reply..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="min-h-[100px] bg-background border-border text-white resize-none pr-14"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSend()
                                        }
                                    }
                                    }
                                />
                                <Button
                                    type="submit"
                                    disabled={!message.trim() || sending}
                                    size="icon"
                                    className="absolute bottom-3 right-3 h-9 w-9"
                                >
                                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-center">
                            <p className="text-sm font-bold text-emerald-500 uppercase tracking-wider">Ticket Closed</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                This ticket has been resolved. Open a new ticket if you need further assistance.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
