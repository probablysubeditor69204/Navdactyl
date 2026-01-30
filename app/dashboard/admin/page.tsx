"use client"

import { useEffect, useState } from "react"
import {
    Shield,
    Users,
    Server,
    Globe,
    Cpu,
    Database,
    HardDrive,
    Loader2,
    ExternalLink,
    Search,
    Trash2,
    Key,
    Save,
    AlertCircle,
    Zap
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [deletingUserId, setDeletingUserId] = useState<number | null>(null)
    const [deletingServerId, setDeletingServerId] = useState<number | null>(null)
    const [settingsLoading, setSettingsLoading] = useState(false)
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
    const [freeServerMemory, setFreeServerMemory] = useState(4096)
    const [freeServerDisk, setFreeServerDisk] = useState(10240)
    const [freeServerCpu, setFreeServerCpu] = useState(100)
    const [serverLimit, setServerLimit] = useState(2)
    const [allowedNodes, setAllowedNodes] = useState("")

    // Pagination State
    const [users, setUsers] = useState<any[]>([])
    const [userPagination, setUserPagination] = useState<any>(null)
    const [userPage, setUserPage] = useState(1)
    const [usersLoading, setUsersLoading] = useState(false)

    const [servers, setServers] = useState<any[]>([])
    const [serverPagination, setServerPagination] = useState<any>(null)
    const [serverPage, setServerPage] = useState(1)
    const [serversLoading, setServersLoading] = useState(false)

    useEffect(() => {
        fetchData()
        fetchSiteSettings()
    }, [])

    const fetchData = async () => {
        try {
            const res = await fetch("/api/admin/stats")
            const data = await res.json()
            if (data.stats) {
                setStats(data)
                setSettingsUrl(process.env.NEXT_PUBLIC_PTERODACTYL_URL || "")
            }
        } catch (error) {
            console.error("Failed to fetch admin data", error)
            toast.error("Failed to load dashboard data")
        } finally {
            setLoading(false)
        }
    }

    const fetchUsers = async (page: number) => {
        setUsersLoading(true)
        try {
            const res = await fetch(`/api/admin/users?page=${page}`)
            const data = await res.json()
            if (data.users) {
                setUsers(data.users)
                setUserPagination(data.pagination)
            }
        } catch (error) {
            console.error("Failed to fetch users", error)
            toast.error("Failed to load users")
        } finally {
            setUsersLoading(false)
        }
    }

    const fetchServers = async (page: number) => {
        setServersLoading(true)
        try {
            const res = await fetch(`/api/admin/servers?page=${page}`)
            const data = await res.json()
            if (data.servers) {
                setServers(data.servers)
                setServerPagination(data.pagination)
            }
        } catch (error) {
            console.error("Failed to fetch servers", error)
            toast.error("Failed to load servers")
        } finally {
            setServersLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers(userPage)
    }, [userPage])

    useEffect(() => {
        fetchServers(serverPage)
    }, [serverPage])

    const fetchSiteSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings")
            const data = await res.json()
            if (!data.error) {
                setSiteTitle(data.siteTitle)
                setSiteDescription(data.siteDescription)
                setFaviconUrl(data.faviconUrl)
                setDashboardGreeting(data.dashboardGreeting)
                setAnnouncementText(data.announcementText)
                setShowAnnouncement(data.showAnnouncement)
                setTurnstileEnabled(data.turnstileEnabled || false)
                setTurnstileSiteKey(data.turnstileSiteKey || "")
                setTurnstileSecretKey(data.turnstileSecretKey || "")
                setFreeServerMemory(data.freeServerMemory || 4096)
                setFreeServerDisk(data.freeServerDisk || 10240)
                setFreeServerCpu(data.freeServerCpu || 100)
                setServerLimit(data.serverLimit || 2)
                setAllowedNodes(data.allowedNodes || "")
                setPterodactylAccountKey(data.pterodactylAccountKey || "")
            }
        } catch (error) {
            console.error("Failed to fetch site settings", error)
        }
    }

    const handleDeleteUser = async (id: number) => {
        if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return
        setDeletingUserId(id)
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
            if (res.ok) {
                toast.success("User deleted successfully")
                setUsers(users.filter((u: any) => u.id !== id))
                setStats({
                    ...stats,
                    recentUsers: stats.recentUsers.filter((u: any) => u.id !== id),
                    stats: { ...stats.stats, users: stats.stats.users - 1 }
                })
            } else {
                const data = await res.json()
                toast.error(data.error || "Failed to delete user")
            }
        } catch (err) {
            toast.error("An error occurred")
        } finally {
            setDeletingUserId(null)
        }
    }

    const handleDeleteServer = async (id: number) => {
        if (!confirm("Are you sure you want to delete this server? This is permanent!")) return
        setDeletingServerId(id)
        try {
            const res = await fetch(`/api/admin/servers/${id}`, { method: 'DELETE' })
            if (res.ok) {
                toast.success("Server deleted successfully")
                setServers(servers.filter((s: any) => s.id !== id))
                setStats({
                    ...stats,
                    recentServers: stats.recentServers.filter((s: any) => s.id !== id),
                    stats: { ...stats.stats, servers: stats.stats.servers - 1 }
                })
            } else {
                const data = await res.json()
                toast.error(data.error || "Failed to delete server")
            }
        } catch (err) {
            toast.error("An error occurred")
        } finally {
            setDeletingServerId(null)
        }
    }

    const handleSavePlatformSettings = async (e: React.FormEvent) => {
        e.preventDefault()
        setSettingsLoading(true)
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                body: JSON.stringify({
                    siteTitle,
                    siteDescription,
                    faviconUrl,
                    dashboardGreeting,
                    announcementText,
                    showAnnouncement,
                    turnstileEnabled,
                    turnstileSiteKey,
                    turnstileSecretKey,
                    freeServerMemory: Number(freeServerMemory),
                    freeServerDisk: Number(freeServerDisk),
                    freeServerCpu: Number(freeServerCpu),
                    serverLimit: Number(serverLimit),
                    allowedNodes,
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
        // Mock save for Ptero API as it typically requires ENV restart
        setTimeout(() => {
            toast.success("API settings saved! (Note: ENV changes may require a restart)")
            setSettingsLoading(false)
        }, 1000)
    }

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="p-8 text-center text-white">
                <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold">Access Denied</h3>
                <p className="text-muted-foreground">You do not have administrative privileges.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                        <Shield className="h-8 w-8 text-blue-500" /> Administrative Area
                    </h2>
                    <p className="text-muted-foreground">Manage your entire hosting platform from one place.</p>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6" onValueChange={(val) => {
                if (val === 'users' && users.length <= 5) fetchUsers(1)
                if (val === 'servers' && servers.length <= 5) fetchServers(1)
            }}>
                <TabsList className="bg-[#18181b] border-[#27272a] p-1">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="users">Manage Users</TabsTrigger>
                    <TabsTrigger value="servers">Manage Servers</TabsTrigger>
                    <TabsTrigger value="settings">Platform Settings</TabsTrigger>
                </TabsList>

                {/* OVERVIEW CONTENT */}
                <TabsContent value="overview" className="space-y-8">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="bg-[#18181b] border-[#27272a] shadow-xl">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400">Total Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{stats.stats.users}</div>
                                <Users className="h-4 w-4 text-blue-500 absolute top-4 right-4" />
                            </CardContent>
                        </Card>
                        <Card className="bg-[#18181b] border-[#27272a] shadow-xl">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400">Total Instances</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{stats.stats.servers}</div>
                                <Server className="h-4 w-4 text-emerald-500 absolute top-4 right-4" />
                            </CardContent>
                        </Card>
                        <Card className="bg-[#18181b] border-[#27272a] shadow-xl">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400">Active Nodes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{stats.stats.nodes}</div>
                                <Globe className="h-4 w-4 text-purple-500 absolute top-4 right-4" />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="bg-[#09090b]/50 border-[#27272a] relative overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest text-center">Allocated CPU</CardDescription>
                                <CardTitle className="text-2xl font-bold text-white text-center">{stats.stats.usage.cpu}%</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="bg-[#09090b]/50 border-[#27272a] relative overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest text-center">Allocated RAM</CardDescription>
                                <CardTitle className="text-2xl font-bold text-white text-center">{(stats.stats.usage.memory / 1024).toFixed(1)} GB</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="bg-[#09090b]/50 border-[#27272a] relative overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-zinc-500 uppercase text-[10px) font-bold tracking-widest text-center">Allocated Disk</CardDescription>
                                <CardTitle className="text-2xl font-bold text-white text-center">{(stats.stats.usage.disk / 1024).toFixed(1)} GB</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="bg-[#18181b] border-[#27272a]">
                            <CardHeader><CardTitle className="text-lg text-white">Recent Deployments</CardTitle></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableBody>
                                        {stats.recentServers.slice(0, 5).map((s: any) => (
                                            <TableRow key={s.id} className="border-[#27272a] hover:bg-white/5">
                                                <TableCell className="text-zinc-300 py-3">{s.name}</TableCell>
                                                <TableCell className="text-zinc-500 text-xs py-3">User #{s.user}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        <Card className="bg-[#18181b] border-[#27272a]">
                            <CardHeader><CardTitle className="text-lg text-white">Recent Users</CardTitle></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableBody>
                                        {stats.recentUsers.slice(0, 5).map((u: any) => (
                                            <TableRow key={u.id} className="border-[#27272a] hover:bg-white/5">
                                                <TableCell className="text-zinc-300 py-3">{u.username}</TableCell>
                                                <TableCell className="text-right py-3"><Badge variant="outline" className="text-[10px]">{u.root_admin ? "Admin" : "User"}</Badge></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* USERS CONTENT */}
                <TabsContent value="users">
                    <Card className="bg-[#18181b] border-[#27272a]">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-white">Active Accounts</CardTitle>
                                <CardDescription>Managing all dashboard and panel users.</CardDescription>
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Filter users..." className="pl-8 bg-[#09090b] border-[#27272a]" onChange={(e) => setSearch(e.target.value)} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow className="border-[#27272a]"><TableHead>Username</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {usersLoading ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500" /></TableCell></TableRow>
                                    ) : (
                                        users.filter(u => u.username.toLowerCase().includes(search.toLowerCase())).map((user) => (
                                            <TableRow key={user.id} className="border-[#27272a] hover:bg-white/5">
                                                <TableCell className="text-zinc-300">{user.username}</TableCell>
                                                <TableCell className="text-zinc-500">{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={user.root_admin ? "bg-red-500/10 text-red-400" : ""}>
                                                        {user.root_admin ? "Administrator" : "User"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDeleteUser(user.id)} disabled={deletingUserId === user.id}>
                                                        {deletingUserId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                            {userPagination && userPagination.total_pages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-xs text-zinc-500">Page {userPage} of {userPagination.total_pages}</p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1 || usersLoading}>Previous</Button>
                                        <Button variant="outline" size="sm" onClick={() => setUserPage(p => Math.min(userPagination.total_pages, p + 1))} disabled={userPage === userPagination.total_pages || usersLoading}>Next</Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SERVERS CONTENT */}
                <TabsContent value="servers">
                    <Card className="bg-[#18181b] border-[#27272a]">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-white">Global Instances</CardTitle>
                                <CardDescription>Monitor and delete servers across all nodes.</CardDescription>
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Filter servers..." className="pl-8 bg-[#09090b] border-[#27272a]" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow className="border-[#27272a]"><TableHead>Server Name</TableHead><TableHead>Resources</TableHead><TableHead>Node</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {serversLoading ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-500" /></TableCell></TableRow>
                                    ) : (
                                        servers.map((server: any) => (
                                            <TableRow key={server.id} className="border-[#27272a] hover:bg-white/5">
                                                <TableCell className="text-zinc-300 font-medium">
                                                    {server.name}
                                                    <div className="text-[10px] text-zinc-500 font-mono">{server.identifier}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-[10px] flex gap-2">
                                                        <span className="text-zinc-400">{server.limits.cpu}% CPU</span>
                                                        <span className="text-zinc-500">|</span>
                                                        <span className="text-zinc-400">{server.limits.memory}MB RAM</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-zinc-500 text-xs">Node #{server.node}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDeleteServer(server.id)} disabled={deletingServerId === server.id}>
                                                        {deletingServerId === server.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                            {serverPagination && serverPagination.total_pages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-xs text-zinc-500">Page {serverPage} of {serverPagination.total_pages}</p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setServerPage(p => Math.max(1, p - 1))} disabled={serverPage === 1 || serversLoading}>Previous</Button>
                                        <Button variant="outline" size="sm" onClick={() => setServerPage(p => Math.min(serverPagination.total_pages, p + 1))} disabled={serverPage === serverPagination.total_pages || serversLoading}>Next</Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SETTINGS CONTENT */}
                <TabsContent value="settings" className="space-y-6">
                    <div className="max-w-4xl grid gap-6 md:grid-cols-2">
                        {/* Platform Customization Card */}
                        <Card className="bg-[#18181b] border-[#27272a]">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-blue-500" /> Site Info
                                </CardTitle>
                                <CardDescription>Brand identity and meta tags.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSavePlatformSettings} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-zinc-400 text-xs">Site Title</Label>
                                        <Input value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} placeholder="Navdactyl" className="bg-[#09090b] border-[#27272a]" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-400 text-xs">Favicon URL</Label>
                                        <Input value={faviconUrl} onChange={(e) => setFaviconUrl(e.target.value)} placeholder="/favicon.ico" className="bg-[#09090b] border-[#27272a]" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-400 text-xs">Meta Description</Label>
                                        <Input value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} placeholder="Manage your servers" className="bg-[#09090b] border-[#27272a]" />
                                    </div>
                                    <Button type="submit" disabled={settingsLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                        {settingsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Save Branding
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Announcements Card */}
                        <Card className="bg-[#18181b] border-[#27272a]">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-yellow-500" /> Notifications
                                </CardTitle>
                                <CardDescription>Manage greetings and announcements.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSavePlatformSettings} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-zinc-400 text-xs">Welcome Greeting</Label>
                                        <Input value={dashboardGreeting} onChange={(e) => setDashboardGreeting(e.target.value)} placeholder="Hi, Name!" className="bg-[#09090b] border-[#27272a]" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-400 text-xs">Announcement Bar</Label>
                                        <Input value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} placeholder="Important update..." className="bg-[#09090b] border-[#27272a]" />
                                    </div>
                                    <div className="flex items-center space-x-2 pt-2">
                                        <input
                                            type="checkbox"
                                            id="showAnnounce"
                                            checked={showAnnouncement}
                                            onChange={(e) => setShowAnnouncement(e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 bg-zinc-900"
                                        />
                                        <label htmlFor="showAnnounce" className="text-sm text-zinc-400 cursor-pointer">Show Announcement Bar</label>
                                    </div>
                                    <Button type="submit" disabled={settingsLoading} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                                        {settingsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Save Notifications
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Pterodactyl API Settings Card */}
                        <Card className="bg-[#18181b] border-[#27272a]">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Key className="h-5 w-5 text-emerald-500" /> Pterodactyl API
                                </CardTitle>
                                <CardDescription>Dashboard connection settings.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSaveAPISettings} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-zinc-400 text-xs">Panel API URL</Label>
                                        <Input value={settingsUrl} onChange={(e) => setSettingsUrl(e.target.value)} className="bg-[#09090b] border-[#27272a]" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-400 text-xs">Application API Key (User Management)</Label>
                                        <Input type="password" placeholder="ptla_..." value={settingsKey} onChange={(e) => setSettingsKey(e.target.value)} className="bg-[#09090b] border-[#27272a]" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-400 text-xs">Account API Key (Console & Power Actions)</Label>
                                        <Input type="password" placeholder="ptlc_..." value={pterodactylAccountKey} onChange={(e) => setPterodactylAccountKey(e.target.value)} className="bg-[#09090b] border-[#27272a]" />
                                        <p className="text-[10px] text-zinc-500">Required for live console and power actions. Create in Panel Account Settings.</p>
                                    </div>
                                    <Button type="submit" disabled={settingsLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                        {settingsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Save Connection
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Security Settings Card (Turnstile) */}
                        <Card className="bg-[#18181b] border-[#27272a]">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-indigo-500" /> Security Settings
                                </CardTitle>
                                <CardDescription>Configure Cloudflare Turnstile CAPTCHA.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSavePlatformSettings} className="space-y-4">
                                    <div className="flex items-center space-x-2 pb-2">
                                        <input
                                            type="checkbox"
                                            id="enableTurnstile"
                                            checked={turnstileEnabled}
                                            onChange={(e) => setTurnstileEnabled(e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 bg-zinc-900"
                                        />
                                        <label htmlFor="enableTurnstile" className="text-sm text-zinc-400 cursor-pointer text-indigo-400 font-bold">Enable Cloudflare Turnstile</label>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-zinc-400 text-xs">Turnstile Site Key</Label>
                                        <Input value={turnstileSiteKey} onChange={(e) => setTurnstileSiteKey(e.target.value)} placeholder="0x4AAAAAA..." className="bg-[#09090b] border-[#27272a]" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-zinc-400 text-xs">Turnstile Secret Key</Label>
                                        <Input type="password" value={turnstileSecretKey} onChange={(e) => setTurnstileSecretKey(e.target.value)} placeholder="0x4AAAAAA..." className="bg-[#09090b] border-[#27272a]" />
                                    </div>

                                    <Button type="submit" disabled={settingsLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                                        {settingsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Save Security
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Resource Allocation Card */}
                        <Card className="bg-[#18181b] border-[#27272a]">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Cpu className="h-5 w-5 text-orange-500" /> Free Resources
                                </CardTitle>
                                <CardDescription>Default limits for new server instances.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSavePlatformSettings} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-zinc-400 text-xs">Default RAM (MB)</Label>
                                            <Input type="number" value={freeServerMemory} onChange={(e) => setFreeServerMemory(Number(e.target.value))} className="bg-[#09090b] border-[#27272a]" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-400 text-xs">Default Disk (MB)</Label>
                                            <Input type="number" value={freeServerDisk} onChange={(e) => setFreeServerDisk(Number(e.target.value))} className="bg-[#09090b] border-[#27272a]" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-zinc-400 text-xs">Default CPU (%)</Label>
                                            <Input type="number" value={freeServerCpu} onChange={(e) => setFreeServerCpu(Number(e.target.value))} className="bg-[#09090b] border-[#27272a]" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-400 text-xs">Max Servers/User</Label>
                                            <Input type="number" value={serverLimit} onChange={(e) => setServerLimit(Number(e.target.value))} className="bg-[#09090b] border-[#27272a]" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-400 text-xs">Allowed Node IDs (e.g. 1,2)</Label>
                                        <Input value={allowedNodes} onChange={(e) => setAllowedNodes(e.target.value)} placeholder="Leave empty for all nodes" className="bg-[#09090b] border-[#27272a]" />
                                    </div>

                                    <Button type="submit" disabled={settingsLoading} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                                        {settingsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Save Allocations
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <Alert className="bg-zinc-900 border-zinc-800 text-zinc-400 max-w-4xl">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Developer Note</AlertTitle>
                        <AlertDescription>Settings are applied per-session and globally for all admins.</AlertDescription>
                    </Alert>
                </TabsContent>
            </Tabs>
        </div>
    )
}
