"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, MessageSquare, Clock, Loader2, Send, ChevronRight, Inbox, Search } from "lucide-react"
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
    const [searchTerm, setSearchTerm] = useState("")

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

    const filteredTickets = tickets.filter(t =>
        t.subject.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-medium text-lg">
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
                    <DialogContent className="bg-[#18181b] border-[#27272a] sm:max-w-[500px] rounded-xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-white">New Support Ticket</DialogTitle>
                            <DialogDescription className="text-muted-foreground text-sm">
                                Please provide as much detail as possible so we can help you faster.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                                <FormField
                                    control={form.control}
                                    name="subject"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-zinc-400 text-xs font-bold uppercase">Subject</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="What's the issue?"
                                                    className="bg-[#09090b] border-border text-white h-11 rounded-lg"
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
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-zinc-400 text-xs font-bold uppercase">Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Provide details about your problem..."
                                                    className="min-h-[150px] bg-[#09090b] border-border text-white rounded-lg resize-none p-4"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter className="pt-2">
                                    <Button type="submit" disabled={isCreating} className="w-full font-bold h-11">
                                        {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Open Ticket"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* List */}
            <div className="space-y-4">
                {/* Search */}
                <div className="flex items-center gap-4 bg-card border border-border px-4 py-2 rounded-xl">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search your tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-0 h-9 p-0 focus-visible:ring-0 text-white placeholder:text-muted-foreground/50"
                    />
                </div>

                {loading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-40 rounded-xl border border-border bg-card animate-pulse" />
                        ))}
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[200px]">
                        <Inbox className="h-10 w-10 text-muted-foreground/20 mb-4" />
                        <p className="text-muted-foreground">No tickets found.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredTickets.map((ticket) => (
                            <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`} className="group block">
                                <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/50 transition-all duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <MessageSquare className="h-6 w-6" />
                                        </div>
                                        {getStatusBadge(ticket.status)}
                                    </div>

                                    <h4 className="text-white font-bold text-lg mb-1 truncate group-hover:text-primary transition-colors">{ticket.subject}</h4>
                                    <p className="text-muted-foreground text-xs mb-6 line-clamp-1">
                                        {ticket.messages?.[0]?.content}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                                            <Clock className="h-3 w-3" />
                                            Active {new Date(ticket.updatedAt).toLocaleDateString()}
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
