"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, User, Lock, Save, ShieldCheck, Camera } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const profileFormSchema = z.object({
    username: z.string().min(3).max(60).optional(),
    email: z.string().email().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8).optional().or(z.literal("")),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function AccountPage() {
    const { data: session, update } = useSession()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            username: session?.user?.name || "",
            email: session?.user?.email || "",
            currentPassword: "",
            newPassword: "",
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

    async function onSubmit(data: ProfileFormValues) {
        setIsLoading(true)

        try {
            // First, If there is a file, upload it
            let avatarUrl = (session?.user as any)?.avatarUrl;
            if (selectedFile) {
                const formData = new FormData()
                formData.append('file', selectedFile)

                const uploadRes = await fetch('/api/user/profile', {
                    method: 'POST',
                    body: formData,
                })
                const uploadData = await uploadRes.json()
                if (!uploadRes.ok) throw new Error(uploadData.error || "Avatar upload failed")
                avatarUrl = uploadData.user.avatarUrl;
            }

            // Then, update profile info
            const payload: any = {
                username: data.username,
                email: data.email,
            }

            if (data.newPassword) {
                payload.password = data.newPassword
                payload.currentPassword = data.currentPassword
            }

            const response = await fetch("/api/user", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Failed to update profile")
            }

            toast.success("Profile updated successfully!")

            await update({
                ...session,
                user: {
                    ...session?.user,
                    name: data.username,
                    email: data.email,
                    avatarUrl: avatarUrl
                }
            })

            form.reset({
                ...data,
                currentPassword: "",
                newPassword: "",
            })
            setSelectedFile(null)
            setPreviewUrl(null)

            router.refresh()

        } catch (error: any) {
            toast.error(error.message || "Failed to update profile")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Account Settings</h2>
                <p className="text-muted-foreground">
                    Manage your profile details and security settings.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    <div className="grid gap-8 md:grid-cols-2">
                        {/* Profile Details Card */}
                        <Card className="bg-[#18181b] border border-[#27272a] shadow-sm">
                            <CardHeader>
                                <div className="flex items-center gap-2 text-white mb-1">
                                    <User className="h-5 w-5 text-blue-500" />
                                    <CardTitle>Profile Information</CardTitle>
                                </div>
                                <CardDescription>
                                    Update your public display name and email address.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Avatar Section */}
                                <div className="flex items-center gap-6 pb-2">
                                    <div className="relative group">
                                        <Avatar className="h-20 w-20 border-2 border-border bg-[#09090b]">
                                            <AvatarImage src={previewUrl || (session?.user as any)?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${session?.user?.name}`} />
                                            <AvatarFallback className="text-xl font-bold uppercase">
                                                {session?.user?.name?.substring(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <label
                                            htmlFor="avatar-upload"
                                            className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                                        >
                                            <Camera className="h-5 w-5 text-white" />
                                            <input
                                                id="avatar-upload"
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-white uppercase italic">Profile Picture</h4>
                                        <p className="text-xs text-muted-foreground">Click the image to upload a new avatar. Max size 2MB.</p>
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input placeholder="username" {...field} className="pl-9 bg-[#09090b] border-[#27272a]" />
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                This is your public display name.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input placeholder="email@example.com" {...field} className="pl-9 bg-[#09090b] border-[#27272a]" />
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                Email used for login and notifications.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Security Card */}
                        <Card className="bg-[#18181b] border border-[#27272a] shadow-sm">
                            <CardHeader>
                                <div className="flex items-center gap-2 text-white mb-1">
                                    <Lock className="h-5 w-5 text-rose-500" />
                                    <CardTitle>Security</CardTitle>
                                </div>
                                <CardDescription>
                                    Ensure your account is secure by setting a strong password.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input type="password" placeholder="••••••" {...field} className="pl-9 bg-[#09090b] border-[#27272a]" />
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                Required to set a new password.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input type="password" placeholder="••••••" {...field} className="pl-9 bg-[#09090b] border-[#27272a]" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading} className="w-full md:w-auto min-w-[150px]">
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
