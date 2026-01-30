"use client"

import { useEffect, useState } from "react"
import { Zap } from "lucide-react"

export function DashboardAlert() {
    const [settings, setSettings] = useState<any>(null)

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch("/api/admin/settings")
                const data = await res.json()
                if (!data.error) {
                    setSettings(data)
                }
            } catch (error) {
                console.error("Failed to fetch site settings", error)
            }
        }
        fetchSettings()
    }, [])

    if (!settings || !settings.showAnnouncement) return null

    return (
        <div className="rounded-lg border border-[#14532d] bg-[#052e16] p-4 flex items-center gap-3 shadow-sm animate-in fade-in duration-500">
            <div className="p-1 rounded-full border border-[#4ade80]">
                <Zap className="h-3 w-3 text-[#4ade80]" fill="currentColor" />
            </div>
            <span className="text-[#4ade80] font-medium text-sm">
                {settings.announcementText}
            </span>
        </div>
    )
}
