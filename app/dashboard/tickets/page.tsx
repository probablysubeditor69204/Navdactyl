"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, MessageSquare, Clock, Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const ticketSchema = z.object({
    subject: z.string().min(5, "Subject must be at least 5 characters").max(100),
    message: z.string().min(10, "Message must be at least 10 characters").max(2000),
})

type TicketValues = z.infer<typeof ticketSchema>

export default function TicketsPage() {
    const [tickets, setTickets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [open, setOpen] = useState(false)

    const form = useForm<TicketValues>({
        resolver: zodResolver(ticketSchema),
        defaultValues: {
            subject: "",
            message: "",
        },
    })

    const fetchTickets = async () => {
        try {
            const res = await fetch("/api/tickets")
            const data = await res.json()
            if (data.tickets) setTickets(data.tickets)
        } catch (error) {
            toast.error("Failed to load tickets")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTickets()
    }, [])

    const onSubmit = async (values: TicketValues) => {
        setIsCreating(true)
        try {
            const res = await fetch("/api/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to create ticket")
            }

            toast.success("Ticket created successfully")
            setOpen(false)
            form.reset()
            fetchTickets()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsCreating(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "OPEN":
                return (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse" />
                        Open
                    </Badge>
                )
            case "ANSWERED":
                return (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5" />
                        Answered
                    </Badge>
                )
            case "CLOSED":
                return (
                    <Badge variant="outline" className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 mr-1.5" />
                        Closed
                    </Badge>
                )
            default:
                return null
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-medium">
                    <MessageSquare className="h-5 w-5" />
                    <h3>Support Tickets ( {tickets.length} )</h3>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="font-bold gap-2">
                            <Plus className="h-4 w-4" />
                            New Ticket
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#18181b] border-[#27272a] sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-white">Create Support Ticket</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Describe your issue and we'll get back to you soon.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                                <FormField
                                    control={form.control}
                                    name="subject"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white">Subject</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Brief description of your issue"
                                                    className="bg-[#09090b] border-[#27272a] text-white h-11"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white">Message</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Detailed explanation of your problem..."
                                                    className="min-h-[150px] bg-[#09090b] border-[#27272a] text-white resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <Button type="submit" disabled={isCreating} className="w-full font-bold h-11">
                                        {isCreating ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4 mr-2" />
                                                Submit Ticket
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Tickets Grid */}
            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-[140px] rounded-xl border border-border bg-card animate-pulse" />
                    ))}
                </div>
            ) : tickets.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[200px]">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                    <p className="text-muted-foreground">No tickets yet. Create one if you need help!</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {tickets.map((ticket) => (
                        <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`} className="group">
                            <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/50 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <MessageSquare className="h-6 w-6" />
                                    </div>
                                    {getStatusBadge(ticket.status)}
                                </div>

                                <h4 className="text-white font-bold text-lg mb-1 truncate">{ticket.subject}</h4>
                                <p className="text-muted-foreground text-xs mb-4 line-clamp-2">
                                    {ticket.messages?.[0]?.content || 'No messages yet'}
                                </p>

                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase">
                                    <Clock className="h-3 w-3" />
                                    {new Date(ticket.updatedAt).toLocaleDateString()}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
