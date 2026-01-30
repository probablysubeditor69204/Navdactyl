"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Mail, Lock, Eye, EyeOff, User, ArrowRight } from "lucide-react"
import { Turnstile } from "@marsidev/react-turnstile"

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
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(1, {
        message: "Password is required.",
    }),
})

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false)
    const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null)
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
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (settings?.turnstileEnabled && !turnstileToken) {
            toast.error("Security Check", {
                description: "Please complete the CAPTCHA verification.",
            })
            return
        }

        setIsLoading(true)
        try {
            const result = await signIn("credentials", {
                redirect: false,
                email: values.email,
                password: values.password,
                turnstileToken: turnstileToken
            })

            if (result?.error) {
                toast.error("Invalid Credentials", {
                    description: result.error || "Please check your email and password.",
                })
                return
            }

            toast.success("Welcome back")
            router.push("/dashboard")
            router.refresh()
        } catch (error) {
            toast.error("Error", {
                description: "An unexpected error occurred.",
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
                <h2 className="text-3xl font-bold font-heading text-white tracking-tight">Login to Continue</h2>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider ml-1 mt-2">Email Address</FormLabel>
                                <FormControl>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors">
                                            <Mail size={16} />
                                        </div>
                                        <Input
                                            placeholder="demo@example.com"
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
                            <FormItem className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <FormLabel className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider">Password</FormLabel>
                                    <Link href="#" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest font-heading underline-offset-4 hover:underline">Forgot password?</Link>
                                </div>
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

                    {/* CAPTCHA AREA */}
                    {settings?.turnstileEnabled && settings?.turnstileSiteKey && (
                        <div className="flex justify-center -mb-2 pb-2">
                            <Turnstile
                                siteKey={settings.turnstileSiteKey}
                                onSuccess={(token) => setTurnstileToken(token)}
                                theme="dark"
                            />
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] group/btn"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <div className="flex items-center gap-2">
                                Sign In <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </div>
                        )}
                    </Button>
                </form>
            </Form>

            <div className="text-center pt-8">
                <p className="text-sm font-medium text-zinc-500">
                    New here? <Link href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold border-b border-indigo-400/20 pb-0.5">Create an account</Link>
                </p>
            </div>
        </div>
    )
}
