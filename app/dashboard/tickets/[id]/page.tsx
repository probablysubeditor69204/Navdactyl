"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MessageSquare, Send, Loader2, ShieldCheck, User, Clock, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

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
                    const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
                    if (scrollContainer) {
                        scrollContainer.scrollTop = scrollContainer.scrollHeight;
                    }
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const closeTicket = async () => {
        try {
            const res = await fetch(`/api/admin/tickets`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: 'CLOSED' }),
            })

            if (!res.ok) throw new Error("Failed to close ticket")

            toast.success("Ticket closed successfully")
            fetchTicket()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
        )
    }

    if (!ticket) return null

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "OPEN": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "ANSWERED": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "CLOSED": return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
            default: return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-white" onClick={() => router.push("/dashboard/tickets")}>
                    <ArrowLeft className="h-4 w-4" />
                    Back to Tickets
                </Button>

                <div className="flex items-center gap-3">
                    <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border", getStatusVariant(ticket.status))}>
                        <div className={cn("h-1.5 w-1.5 rounded-full",
                            ticket.status === 'OPEN' ? "bg-blue-500 animate-pulse" :
                                ticket.status === 'ANSWERED' ? "bg-emerald-500" : "bg-zinc-500"
                        )} />
                        {ticket.status}
                    </div>
                    {ticket.status !== 'CLOSED' && (
                        <Button variant="outline" size="sm" onClick={closeTicket} className="h-7 text-[10px] font-bold uppercase border-red-500/20 text-red-500 hover:bg-red-500/5">
                            Resolve
                        </Button>
                    )}
                </div>
            </div>

            <Card className="rounded-xl border-border bg-card shadow-sm overflow-hidden flex flex-col h-[calc(100vh-280px)]">
                <div className="p-6 border-b border-border bg-zinc-950/20 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white leading-tight">{ticket.subject}</h2>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Ticket ID: #{ticket.id.split('-')[0]}</p>
                    </div>
                </div>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6 pb-4">
                        {ticket.messages.map((msg: any) => {
                            const isStaff = msg.isAdmin;
                            const isMe = msg.userId === (session?.user as any)?.id;

                            return (
                                <div key={msg.id} className={cn(
                                    "flex gap-3 w-full",
                                    isStaff ? "flex-row" : "flex-row-reverse"
                                )}>
                                    <Avatar className="h-8 w-8 border border-border bg-background">
                                        <AvatarImage src={msg.user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${msg.user?.username || msg.userId}`} />
                                        <AvatarFallback className="text-[10px] font-bold uppercase">
                                            {(msg.user?.username || (isStaff ? "ST" : "US")).substring(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className={cn(
                                        "flex flex-col space-y-1.5 max-w-[80%]",
                                        isStaff ? "items-start" : "items-end"
                                    )}>
                                        <div className={cn(
                                            "flex items-center gap-2 px-1",
                                            isStaff ? "flex-row" : "flex-row-reverse"
                                        )}>
                                            <span className={cn("text-[10px] font-bold uppercase tracking-wider", isStaff ? "text-emerald-500" : "text-primary")}>
                                                {isStaff ? "Staff" : isMe ? "You" : ticket.user.username}
                                            </span>
                                            <span className="text-[9px] text-muted-foreground font-medium grayscale opacity-50">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <div className={cn(
                                            "px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed",
                                            isStaff
                                                ? "bg-zinc-900 border border-border text-zinc-100 rounded-tl-none"
                                                : "bg-primary text-primary-foreground rounded-tr-none"
                                        )}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>

                <div className="p-6 bg-zinc-950/20 border-t border-border mt-auto">
                    {ticket.status === 'CLOSED' ? (
                        <div className="flex items-center justify-center py-2 w-full text-center">
                            <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase tracking-widest text-[10px]">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                This ticket has been resolved
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSend} className="relative">
                            <div className="bg-[#09090b] rounded-xl border border-border overflow-hidden focus-within:border-primary/50 transition-all">
                                <Textarea
                                    placeholder="Type your message..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="min-h-[100px] w-full bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3 resize-none pr-12 text-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                />
                                <div className="absolute bottom-2 right-2">
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={!message.trim() || sending}
                                        className="h-9 w-9"
                                    >
                                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </Card>
        </div>
    )
}
