"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const formSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters."),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
})

export default function RegisterPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false)
    const [settings, setSettings] = React.useState<any>(null)

    React.useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch("/api/admin/settings")
                const data = await res.json()
                if (!data.error) {
                    setSettings(data)
                }
            } catch (error) {
                console.error("Failed to fetch settings", error)
            }
        }
        fetchSettings()
    }, [])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error("Registration Failed", {
                    description: data.error || "Something went wrong.",
                })
                return
            }

            toast.success("Account created successfully")
            router.push("/login")
        } catch (error) {
            toast.error("Error", {
                description: "Could not connect to the registration server.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            {/* Header Area */}
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-600/20">
                        {settings?.siteTitle?.charAt(0).toUpperCase() || "N"}
                    </div>
                </div>
                <h2 className="text-3xl font-bold font-heading text-white tracking-tight">Create an Account</h2>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem className="space-y-1.5">
                                <FormLabel className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider ml-1">Username</FormLabel>
                                <FormControl>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors">
                                            <User size={16} />
                                        </div>
                                        <Input
                                            placeholder="johndoe"
                                            className="h-12 bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 rounded-xl pl-12 transition-all font-sans"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage className="text-red-400 text-[10px] font-bold uppercase" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="space-y-1.5">
                                <FormLabel className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider ml-1">Email Address</FormLabel>
                                <FormControl>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors">
                                            <Mail size={16} />
                                        </div>
                                        <Input
                                            placeholder="you@example.com"
                                            className="h-12 bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 rounded-xl pl-12 transition-all font-sans"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage className="text-red-400 text-[10px] font-bold uppercase" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem className="space-y-1.5">
                                <FormLabel className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider ml-1">Secure Password</FormLabel>
                                <FormControl>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors">
                                            <Lock size={16} />
                                        </div>
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="h-12 bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 rounded-xl pl-12 pr-12 transition-all font-sans"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage className="text-red-400 text-[10px] font-bold uppercase" />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] mt-2 group/btn"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <div className="flex items-center gap-2">
                                Create Account <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </div>
                        )}
                    </Button>
                </form>
            </Form>

            <div className="text-center pt-6">
                <p className="text-sm font-medium text-zinc-500">
                    Already registered? <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold border-b border-indigo-400/20 pb-0.5">Sign in instead</Link>
                </p>
            </div>
        </div>
    )
}
