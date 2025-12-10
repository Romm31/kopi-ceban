import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { User, Shield, KeyRound, CalendarDays } from "lucide-react"
import { format } from "date-fns"
import { ChangePasswordForm } from "@/components/admin/profile/change-password-form"

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/admin/login")
    }

    // Fetch admin details to get joined date (assuming session has ID or we query by email/name)
    // Note: next-auth session might not have ID depending on config. 
    // Assuming session.user.name is unique or we have a way. 
    // In our schema, Admin has 'username'.
    // Let's query by username.
    
    const admin = await prisma.admin.findUnique({
        where: { username: session.user.name as string }
    })

    if (!admin) {
        return <div>Admin not found</div>
    }

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                <h2 className="text-2xl font-bold tracking-tight text-coffee-cream">Admin Profile</h2>
                <p className="text-muted-foreground">
                    Manage your account settings and security.
                </p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-12">
                {/* Profile Card */}
                <div className="md:col-span-4">
                    <Card className="bg-white/5 border-white/10 h-full">
                        <CardHeader className="text-center">
                            <div className="mx-auto w-24 h-24 mb-4 relative">
                                <Avatar className="h-24 w-24 border-2 border-coffee-gold">
                                    <AvatarImage src="/admin-avatar-placeholder.png" />
                                    <AvatarFallback className="bg-coffee-gold/20 text-coffee-gold text-2xl font-bold">
                                        {admin.username.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <CardTitle className="text-2xl text-coffee-cream flex items-center justify-center gap-2">
                                {admin.username}
                                <Shield className="h-4 w-4 text-coffee-gold" />
                            </CardTitle>
                            <CardDescription>Administrator</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Separator className="bg-white/10" />
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <User className="h-4 w-4" /> Role
                                </span>
                                <span className="font-medium text-foreground">Super Admin</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4" /> Joined
                                </span>
                                <span className="font-medium text-foreground">{format(admin.createdAt, "dd MMMM yyyy")}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Change Password Form */}
                <div className="md:col-span-8">
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                             <CardTitle className="text-coffee-cream flex items-center gap-2">
                                <KeyRound className="h-5 w-5" /> Security Settings
                            </CardTitle>
                            <CardDescription>Update your password to keep your account secure.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChangePasswordForm adminId={admin.id} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
