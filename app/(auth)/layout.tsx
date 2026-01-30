export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[#09090b] text-white font-sans selection:bg-indigo-500/30">
            {/* Left Side: Form Content */}
            <div className="flex-1 flex flex-col p-8 md:p-12 lg:p-16 relative overflow-hidden">
                <div className="flex-1 flex flex-col justify-center max-w-[340px] mx-auto w-full relative z-10">
                    {children}
                </div>

                {/* Subtle Background Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0%,transparent_70%)] pointer-events-none" />
            </div>

            {/* Right Side: Visual Image Area */}
            <div className="hidden lg:block lg:w-[45%] xl:w-[55%] p-4">
                <div className="h-full w-full rounded-[2.5rem] bg-[#18181b] overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-white/5">
                    <img
                        src="/auth_background.webp"
                        alt="Background"
                        className="h-full w-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/80 via-transparent to-transparent" />
                </div>
            </div>
        </div>
    );
}
