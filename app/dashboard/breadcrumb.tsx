import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export function DashboardBreadcrumb() {
    return (
        <div className="flex items-center text-sm text-muted-foreground font-medium">
            <Link href="/dashboard" className="flex items-center hover:text-white transition-colors gap-1.5">
                <Home className="h-3.5 w-3.5" />
                Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-1.5 opacity-30" />
            <span className="text-white">Dashboard</span>
        </div>
    )
}
