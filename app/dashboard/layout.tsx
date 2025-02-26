import DashboardHeader from "@/components/DashboardHeader";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { createClient } from '@/utils/supabase/server'
import { redirect } from "next/navigation"
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Phone, Home, Users, Settings } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "NexCallAI - Dashboard",
    description: "Plateforme de gestion de centre d'appels alimentée par l'IA",
};

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Check if user has plan selected. If not redirect to subscibe
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // check user plan in db
    const checkUserInDB = await db.select().from(usersTable).where(eq(usersTable.email, user!.email!))
    if (checkUserInDB[0].plan === "none") {
        console.log("User has no plan selected")
        return redirect('/subscribe')
    }


    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="flex h-screen flex-col">
                    <DashboardHeader />
                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar */}
                        <div className="w-64 bg-card border-r">
                            <div className="p-4">
                                <nav className="space-y-1">
                                    <SidebarLink href="/dashboard" icon={<Home size={18} />} label="Tableau de bord" />
                                    <SidebarLink href="/dashboard/calls" icon={<Phone size={18} />} label="Appels" />
                                    <SidebarLink href="/dashboard/agents" icon={<Users size={18} />} label="Agents IA" />
                                    <SidebarLink href="/dashboard/settings" icon={<Settings size={18} />} label="Paramètres" />
                                </nav>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 overflow-auto p-6">
                            {children}
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}

interface SidebarLinkProps {
    href: string;
    icon: React.ReactNode;
    label: string;
}

function SidebarLink({ href, icon, label }: SidebarLinkProps) {
    return (
        <Link href={href}>
            <div className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                <span className="mr-3 text-muted-foreground">{icon}</span>
                {label}
            </div>
        </Link>
    );
}
