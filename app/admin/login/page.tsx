import { Particles } from "@/components/ui/Particles"
import LoginForm from "@/components/form/LoginForm"
import { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Admin Login | Kopi Ceban",
  description: "Secure Access for Management",
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('/img/coffee-bg-pattern.png')] opacity-5 dark:opacity-5 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/10 to-background z-0" />
      <Particles className="opacity-30 dark:opacity-40" />
      
      {/* Soft Glow Orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-primary/5 rounded-full blur-[100px] animate-pulse delay-1000" />

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-md px-4">
        <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl shadow-2xl p-8 md:p-10 relative overflow-hidden group transition-all duration-300">
          
          {/* Top Gold Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />
          
          <div className="text-center mb-8 space-y-2">
            <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full shadow-lg mb-6 ring-4 ring-primary/20 overflow-hidden fade-in bg-background">
               <Image 
                  src="/logo/logo.jpg" 
                  alt="Admin Logo" 
                  fill 
                  className="object-cover object-center hover:scale-110 transition-transform duration-700"
               />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Kopi Ceban
            </h1>
            <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
              Admin Panel Access
            </p>
          </div>

          <LoginForm />

          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground/60">
              Authentic · Warm · Professional
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
