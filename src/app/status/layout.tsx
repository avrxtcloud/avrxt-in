import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
    title: "Infrastructure Status | avrxt.in",
    description: "Real-time health telemetry and service availability for avrxt's core infrastructure.",
};

export default function StatusLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#111_0%,#000_70%)] -z-10" />
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay -z-10" />

            {children}

            <Footer />
        </div>
    );
}
