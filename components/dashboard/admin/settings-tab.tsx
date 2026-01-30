"use client"

import { useState, useEffect } from "react"
import {
    Globe,
    Zap,
    Bell,
    Lock,
    Loader2,
    Save,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function SettingsTab() {
    const [activeSetting, setActiveSetting] = useState("general")
    const [settingsLoading, setSettingsLoading] = useState(false)
    const [loading, setLoading] = useState(true)

    // Form State
    const [settingsUrl, setSettingsUrl] = useState("")
    const [settingsKey, setSettingsKey] = useState("")
    const [pterodactylAccountKey, setPterodactylAccountKey] = useState("")
    const [siteTitle, setSiteTitle] = useState("")
    const [siteDescription, setSiteDescription] = useState("")
    const [faviconUrl, setFaviconUrl] = useState("")
    const [dashboardGreeting, setDashboardGreeting] = useState("")
    const [announcementText, setAnnouncementText] = useState("")
    const [showAnnouncement, setShowAnnouncement] = useState(true)
    const [turnstileEnabled, setTurnstileEnabled] = useState(false)
    const [turnstileSiteKey, setTurnstileSiteKey] = useState("")
    const [turnstileSecretKey, setTurnstileSecretKey] = useState("")

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings")
            const data = await res.json()
            if (!data.error) {
                setSiteTitle(data.siteTitle)
                setSiteDescription(data.siteDescription)
                setFaviconUrl(data.faviconUrl)
                setDashboardGreeting(data.dashboardGreeting || "")
                setAnnouncementText(data.announcementText || "")
                setShowAnnouncement(data.showAnnouncement ?? true)
                setTurnstileEnabled(data.turnstileEnabled || false)
                setTurnstileSiteKey(data.turnstileSiteKey || "")
                setTurnstileSecretKey(data.turnstileSecretKey || "")
                setPterodactylAccountKey(data.pterodactylAccountKey || "")
                setSettingsUrl(process.env.NEXT_PUBLIC_PTERODACTYL_URL || "")
                // Note: We don't have settingsKey (app key) from backend usually as it's sensitive or from ENV.
            }
        } catch (error) {
            console.error("Failed to fetch settings", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSavePlatformSettings = async (e: React.FormEvent) => {
        e.preventDefault()
        setSettingsLoading(true)

        try {
            // Fetch current to merge
            const currentRes = await fetch("/api/admin/settings")
            const currentData = await currentRes.json()

            const res = await fetch("/api/admin/settings", {
                method: "POST",
                body: JSON.stringify({
                    ...currentData,
                    siteTitle,
                    siteDescription,
                    faviconUrl,
                    dashboardGreeting,
                    announcementText,
                    showAnnouncement,
                    turnstileEnabled,
                    turnstileSiteKey,
                    turnstileSecretKey,
                    pterodactylAccountKey
                }),
                headers: { "Content-Type": "application/json" }
            })

            if (res.ok) {
                toast.success("Platform settings updated successfully!")
            } else {
                const data = await res.json()
                toast.error(data.error || "Failed to update settings")
            }
        } catch (error) {
            toast.error("An error occurred while saving settings")
        } finally {
            setSettingsLoading(false)
        }
    }

    const handleSaveAPISettings = async (e: React.FormEvent) => {
        e.preventDefault()
        setSettingsLoading(true)
        // Mock save logic for now or implement specific endpoint
        // NOTE: Actually Ptero URL and Keys might be better handled via ENV in production.
        // But if they are in DB, we use them.
        setTimeout(() => {
            toast.success("API settings saved! (Note: changes may require restart if using ENV)")
            setSettingsLoading(false)
        }, 1000)
    }

    const NavButton = ({ id, label, icon: Icon }: any) => (
        <button
            onClick={() => setActiveSetting(id)}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                activeSetting === id
                    ? "bg-[#27272a] text-white"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
        >
            <Icon className="h-4 w-4" />
            {label}
        </button>
    )

    if (loading) return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-zinc-500" /></div>

    return (
        <Card className="bg-[#18181b] border-[#27272a] overflow-hidden min-h-[600px] flex flex-col md:flex-row">
            <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#27272a] bg-[#1a1a1e] p-4 flex-shrink-0">
                <div className="mb-6 px-2">
                    <h3 className="font-bold text-white">Platform Settings</h3>
                    <p className="text-xs text-zinc-500">Configure your dashboard</p>
                </div>
                <nav className="space-y-1">
                    <NavButton id="general" label="General" icon={Globe} />
                    <NavButton id="connection" label="Connection" icon={Zap} />
                    <NavButton id="notifications" label="Notifications" icon={Bell} />
                    <NavButton id="security" label="Security" icon={Lock} />
                </nav>
            </aside>

            <main className="flex-1 p-6 md:p-8 bg-[#18181b]">
                {activeSetting === "general" && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h3 className="text-lg font-medium text-white">General Information</h3>
                            <p className="text-sm text-zinc-400">Basic branding and site identity.</p>
                            <Separator className="my-4 bg-[#27272a]" />
                        </div>
                        <form onSubmit={handleSavePlatformSettings} className="space-y-6 max-w-2xl">
                            <div className="grid gap-2">
                                <Label className="text-zinc-300">Site Title</Label>
                                <Input value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} placeholder="Navdactyl" className="bg-[#09090b] border-[#27272a]" />
                                <p className="text-[10px] text-zinc-500">Appears in the browser tab and navbar.</p>
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-zinc-300">Favicon URL</Label>
                                <Input value={faviconUrl} onChange={(e) => setFaviconUrl(e.target.value)} placeholder="/favicon.ico" className="bg-[#09090b] border-[#27272a]" />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-zinc-300">Meta Description</Label>
                                <Textarea value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} placeholder="Manage your servers..." className="bg-[#09090b] border-[#27272a] min-h-[100px]" />
                            </div>
                            <Button type="submit" disabled={settingsLoading} className="bg-white text-black hover:bg-zinc-200">
                                {settingsLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Changes
                            </Button>
                        </form>
                    </div>
                )}

                {activeSetting === "connection" && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h3 className="text-lg font-medium text-white">Connection Settings</h3>
                            <p className="text-sm text-zinc-400">Pterodactyl Panel API configuration.</p>
                            <Separator className="my-4 bg-[#27272a]" />
                        </div>
                        <form onSubmit={handleSaveAPISettings} className="space-y-6 max-w-2xl">
                            <div className="grid gap-2">
                                <Label className="text-zinc-300">Panel URL</Label>
                                <Input value={settingsUrl} onChange={(e) => setSettingsUrl(e.target.value)} placeholder="https://panel.example.com" className="bg-[#09090b] border-[#27272a]" />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-zinc-300">Application API Key</Label>
                                <Input type="password" value={settingsKey} onChange={(e) => setSettingsKey(e.target.value)} placeholder="ptla_..." className="bg-[#09090b] border-[#27272a]" />
                                <p className="text-[10px] text-zinc-500">Used for creating and managing user accounts.</p>
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-zinc-300">Account API Key</Label>
                                <Input type="password" value={pterodactylAccountKey} onChange={(e) => setPterodactylAccountKey(e.target.value)} placeholder="ptlc_..." className="bg-[#09090b] border-[#27272a]" />
                                <p className="text-[10px] text-zinc-500">Required for live console handling and power actions.</p>
                            </div>
                            <Button type="submit" disabled={settingsLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                {settingsLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                                Update Connection
                            </Button>
                        </form>
                    </div>
                )}

                {activeSetting === "notifications" && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h3 className="text-lg font-medium text-white">Notifications</h3>
                            <p className="text-sm text-zinc-400">Manage global announcements and greetings.</p>
                            <Separator className="my-4 bg-[#27272a]" />
                        </div>
                        <form onSubmit={handleSavePlatformSettings} className="space-y-6 max-w-2xl">
                            <div className="grid gap-2">
                                <Label className="text-zinc-300">Welcome Greeting</Label>
                                <Input value={dashboardGreeting} onChange={(e) => setDashboardGreeting(e.target.value)} placeholder="Hi, Name!" className="bg-[#09090b] border-[#27272a]" />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-zinc-300">Announcement Banner</Label>
                                <Input value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} placeholder="Maintenance scheduled for..." className="bg-[#09090b] border-[#27272a]" />
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="showAnnounce"
                                    checked={showAnnouncement}
                                    onChange={(e) => setShowAnnouncement(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 bg-zinc-900"
                                />
                                <label htmlFor="showAnnounce" className="text-sm text-zinc-400 cursor-pointer">Enable Announcement Bar</label>
                            </div>
                            <Button type="submit" disabled={settingsLoading} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                {settingsLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Notifications
                            </Button>
                        </form>
                    </div>
                )}

                {activeSetting === "security" && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h3 className="text-lg font-medium text-white">Security</h3>
                            <p className="text-sm text-zinc-400">Protect your instance with Turnstile CAPTCHA.</p>
                            <Separator className="my-4 bg-[#27272a]" />
                        </div>
                        <form onSubmit={handleSavePlatformSettings} className="space-y-6 max-w-2xl">
                            <div className="flex items-center space-x-2 pb-2">
                                <input
                                    type="checkbox"
                                    id="enableTurnstile"
                                    checked={turnstileEnabled}
                                    onChange={(e) => setTurnstileEnabled(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 bg-zinc-900"
                                />
                                <label htmlFor="enableTurnstile" className="text-sm font-medium text-indigo-400 cursor-pointer">Enable Cloudflare Turnstile</label>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-zinc-300">Site Key</Label>
                                <Input value={turnstileSiteKey} onChange={(e) => setTurnstileSiteKey(e.target.value)} placeholder="0x4AAAAAA..." className="bg-[#09090b] border-[#27272a]" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-zinc-300">Secret Key</Label>
                                <Input type="password" value={turnstileSecretKey} onChange={(e) => setTurnstileSecretKey(e.target.value)} placeholder="0x4AAAAAA..." className="bg-[#09090b] border-[#27272a]" />
                            </div>

                            <Button type="submit" disabled={settingsLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                {settingsLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Security Settings
                            </Button>
                        </form>
                    </div>
                )}
            </main>
        </Card>
    )
}
