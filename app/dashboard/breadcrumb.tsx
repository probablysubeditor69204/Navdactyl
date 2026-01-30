import Link from "next/link"
import { ChevronRight, LayoutGrid } from "lucide-react"

export function DashboardBreadcrumb() {
    return (
        <div className="flex items-center text-sm text-muted-foreground">
            <Link href="/dashboard" className="flex items-center hover:text-foreground transition-colors">
                Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-foreground">dashboard</span>
        </div>
    )
}
