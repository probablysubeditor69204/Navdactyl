import { Sidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar */}
            <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
                <Sidebar />
            </div>

            {/* Main Content */}
            <main className="flex-1 md:pl-64 flex flex-col h-full overflow-y-auto no-scrollbar">
                <div className="flex-1 p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
