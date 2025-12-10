import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ChangePasswordForm } from "@/components/admin/profile/change-password-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/admin/page-header"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.name) {
    redirect("/admin/login")
  }

  const admin = await prisma.admin.findUnique({
    where: { username: session.user.name },
  })

  if (!admin) {
    redirect("/admin/login")
  }

  const initials = admin.username.substring(0, 2).toUpperCase()
  
  // Note: signOut in a server component with a button is tricky without client side interactivity.
  // The logout button usually needs to be a Client Component or use a Route Handler.
  // Since we are in a server component page, let's make the logout button a simple form submission
  // to a server action, OR use a client component for the header action.
  // Actually simplest is a Link to /api/auth/signout or use a Client Component wrapper.
  // Let's create a Client Component for the Logout Button to handle it gracefully.

  return (
    <div className="flex-1 flex flex-col min-h-screen p-6 md:p-8 space-y-8">
         <PageHeader 
            title="Profile Settings" 
            description="Manage your account settings and preferences." 
         >
             <div className="flex items-center gap-2">
                 <LogoutButton />
             </div>
         </PageHeader>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
             <Card className="bg-gradient-to-br from-coffee-black to-coffee-brown/20 border-white/10 overflow-hidden relative group">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 bg-coffee-gold/10 rounded-full blur-3xl group-hover:bg-coffee-gold/20 transition-all duration-500"></div>

                <CardHeader className="text-center pb-2">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-white/10 bg-coffee-secondary flex items-center justify-center shadow-xl group-hover:border-coffee-gold/30 transition-colors duration-300">
                        <span className="text-3xl font-bold text-coffee-gold">{initials}</span>
                    </div>
                    <CardTitle className="text-2xl font-bold text-coffee-cream">{admin.username}</CardTitle>
                    <div className="pt-2">
                         <Badge variant="outline" className="border-coffee-gold/30 text-coffee-gold bg-coffee-gold/5 px-3 py-1">
                            <ShieldAlert className="w-3 h-3 mr-1" />
                            Administrator
                         </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-4 text-center">
                    <p className="text-xs text-muted-foreground">
                        Member since {admin.createdAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </CardContent>
             </Card>
        </div>

        {/* Change Password */}
        <div className="md:col-span-1 lg:col-span-2">
          <Card className="bg-white/5 border-white/10 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-coffee-cream">
                  <User className="h-5 w-5 text-coffee-gold" />
                  Security Settings
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
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

function LogoutButton() {
    return (
        <form action="/api/auth/signout" method="POST">
             <Button variant="destructive" className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
            </Button>
        </form>
    )
}
