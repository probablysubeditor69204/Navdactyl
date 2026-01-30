"use client"

import { useState, useEffect } from "react"
import {
    Loader2,
    Search,
    Trash2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export function UsersTab() {
    const [users, setUsers] = useState<any[]>([])
    const [userPagination, setUserPagination] = useState<any>(null)
    const [userPage, setUserPage] = useState(1)
    const [usersLoading, setUsersLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [deletingUserId, setDeletingUserId] = useState<number | null>(null)

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

    useEffect(() => {
        fetchUsers(userPage)
    }, [userPage])

    const handleDeleteUser = async (id: number) => {
        if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return
        setDeletingUserId(id)
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
            if (res.ok) {
                toast.success("User deleted successfully")
                setUsers(users.filter((u: any) => u.id !== id))
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

    return (
        <Card className="bg-[#18181b] border-[#27272a] min-h-[500px]">
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
    )
}
