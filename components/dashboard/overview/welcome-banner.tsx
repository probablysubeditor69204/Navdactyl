"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

export function WelcomeBanner() {
    const { data: session } = useSession()
    const [greeting, setGreeting] = useState("Welcome to Navdactyl Dashboard. Happy Hosting!")

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch("/api/admin/settings")
                const data = await res.json()
                if (data.dashboardGreeting) {
                    setGreeting(data.dashboardGreeting)
                }
            } catch (error) {
                console.error("Failed to fetch site settings", error)
            }
        }
        fetchSettings()
    }, [])

    return (
        <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="text-8xl font-black italic">NAV</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2 relative z-10">
                Hi, {session?.user?.name || "User"}! 👋
            </h1>
            <p className="text-zinc-400 font-medium relative z-10">
                {greeting}
            </p>
        </div>
    )
}
