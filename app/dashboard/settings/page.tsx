"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { User, Mail, Camera, Loader2, Save, X, Check } from "lucide-react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const profileSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(20),
})

type ProfileValues = z.infer<typeof profileSchema>

export default function SettingsPage() {
    const { data: session, update } = useSession()
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const form = useForm<ProfileValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            username: session?.user?.name || "",
        },
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Image must be less than 2MB")
                return
            }
            setSelectedFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const onSubmit = async (values: ProfileValues) => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('username', values.username)
            if (selectedFile) {
                formData.append('file', selectedFile)
            }

            const res = await fetch('/api/user/profile', {
                method: 'POST',
                body: formData,
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || "Failed to update profile")

            await update({
                ...session,
                user: {
                    ...session?.user,
                    name: data.user.username,
                    avatarUrl: data.user.avatarUrl,
                }
            })

            toast.success("Profile updated successfully")
            setSelectedFile(null)
            setPreviewUrl(null)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight text-white">Account Settings</h2>
                <p className="text-muted-foreground">Manage your profile information and preferences.</p>
            </div>

            <Separator className="bg-border/50" />

            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Information */}
                <Card className="bg-card border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Profile Details</CardTitle>
                        <CardDescription>Update your public information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="flex flex-col items-center gap-4 mb-6">
                                    <div className="relative group">
                                        <Avatar className="h-24 w-24 border-2 border-primary/20 bg-primary/5">
                                            <AvatarImage src={previewUrl || (session?.user as any)?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${session?.user?.name}`} />
                                            <AvatarFallback className="text-2xl font-bold uppercase">
                                                {session?.user?.name?.substring(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <label
                                            htmlFor="avatar-upload"
                                            className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                                        >
                                            <Camera className="h-6 w-6 text-white" />
                                            <input
                                                id="avatar-upload"
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Click to change avatar</p>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Username</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input {...field} className="pl-10 h-11 bg-zinc-950 border-border" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-1">
                                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Email Address</FormLabel>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                        <Input value={session?.user?.email || ""} disabled className="pl-10 h-11 bg-zinc-950/50 border-border opacity-50 cursor-not-allowed" />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Email cannot be changed.</p>
                                </div>

                                <Button type="submit" disabled={loading} className="w-full font-bold gap-2">
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Save Changes
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* Account Status / Stats */}
                <div className="space-y-6">
                    <Card className="bg-card border-border shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Account Status</CardTitle>
                            <CardDescription>Current role and permissions.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-border">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold uppercase text-muted-foreground">Access Level</p>
                                    <p className="text-sm font-bold text-white uppercase italic">
                                        {(session?.user as any)?.isAdmin ? "Administrator" : "Standard User"}
                                    </p>
                                </div>
                                <div className={cn(
                                    "p-2 rounded-full",
                                    (session?.user as any)?.isAdmin ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
                                )}>
                                    <Check className="h-5 w-5" />
                                </div>
                            </div>

                            <Separator className="bg-border/50" />

                            <div className="space-y-2">
                                <p className="text-xs font-bold uppercase text-muted-foreground">Pterodactyl ID</p>
                                <code className="block p-2 rounded bg-zinc-950 text-xs text-primary font-mono border border-border">
                                    {(session?.user as any)?.pteroUuid || "Not linked"}
                                </code>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border shadow-sm border-dashed">
                        <CardHeader>
                            <CardTitle className="text-lg text-muted-foreground">Verification</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                            <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                                <Check className="h-6 w-6 text-primary/40" />
                            </div>
                            <p className="text-sm text-muted-foreground font-medium">Your account is fully verified and linked to our panel service.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
