"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutGrid,
    PlusCircle,
    Ticket,
    ShoppingCart,
    Coins,
    MessageSquare,
    User,
    Users,
    Server,
    Settings,
    ShieldCheck,
    LogOut
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut, useSession } from "next-auth/react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const isAdmin = (session?.user as any)?.isAdmin

    return (
        <div className={cn("pb-4 bg-[#050505] border-r border-[#27272a] h-full flex flex-col justify-between", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">

                    {/* Admin Section (Conditional) */}
                    {isAdmin && (
                        <div className="mb-6">
                            <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                                Admin Area
                            </h3>
                            <div className="space-y-1">
                                <Button variant={pathname === "/dashboard/admin" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
                                    <Link href="/dashboard/admin">
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                        Admin Panel
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Overview Section */}
                    <div className="mb-6">
                        <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                            Overview
                        </h3>
                        <div className="space-y-1">
                            <Button variant={pathname === "/dashboard" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
                                <Link href="/dashboard">
                                    <LayoutGrid className="mr-2 h-4 w-4" />
                                    Home
                                </Link>
                            </Button>
                            <Button variant={pathname === "/dashboard/servers" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
                                <Link href="/dashboard/servers">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create Server
                                </Link>
                            </Button>
                            <Button variant={pathname === "/dashboard/tickets" ? "secondary" : "ghost"} className="w-full justify-start">
                                <Ticket className="mr-2 h-4 w-4" />
                                Tickets
                            </Button>
                            <Button variant={pathname === "/dashboard/marketplace" ? "secondary" : "ghost"} className="w-full justify-start">
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Market Place
                            </Button>
                        </div>
                    </div>

                    {/* Misc Section */}
                    <div className="mb-6">
                        <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                            Misc
                        </h3>
                        <div className="space-y-1">
                            <Button variant={pathname === "/dashboard/coins" ? "secondary" : "ghost"} className="w-full justify-start">
                                <Coins className="mr-2 h-4 w-4" />
                                Earn Coins
                            </Button>
                            <Button variant={pathname === "/dashboard/chat" ? "secondary" : "ghost"} className="w-full justify-start">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Global Chat
                            </Button>
                        </div>
                    </div>

                    {/* Profile Section */}
                    <div>
                        <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                            Profile
                        </h3>
                        <div className="space-y-1">
                            <Button variant={pathname === "/dashboard/account" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
                                <Link href="/dashboard/account">
                                    <User className="mr-2 h-4 w-4" />
                                    Edit Profile
                                </Link>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-500/10" onClick={() => signOut()}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Logo at Bottom */}
            <div className="p-4 border-t border-[#27272a] flex items-center justify-center">
                <div className="h-10 w-10 rounded-full border border-[#27272a] bg-[#09090b] flex items-center justify-center">
                    <span className="font-bold text-lg text-white">N</span>
                </div>
            </div>
        </div>
    )
}

