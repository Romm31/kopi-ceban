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
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-coffee-dark">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('/img/coffee-bg-pattern.png')] opacity-5 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-coffee-dark via-[#1a100b] to-black opacity-90 z-0" />
      <Particles className="opacity-40" />
      
      {/* Soft Glow Orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-coffee-gold/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-coffee-cream/10 rounded-full blur-[100px] animate-pulse delay-1000" />

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-md px-4">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 md:p-10 relative overflow-hidden group">
          
          {/* Top Gold Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-coffee-gold to-transparent opacity-70" />
          
          <div className="text-center mb-8 space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-coffee-gold to-coffee-dark shadow-inner shadow-black/40 mb-4 ring-2 ring-white/10">
               {/* Placeholder Icon - In real app use Image */}
               <span className="text-2xl">☕</span>
            </div>
            <h1 className="text-3xl font-bold text-coffee-cream tracking-tight">
              Kopi Ceban
            </h1>
            <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
              Admin Panel Access
            </p>
          </div>

          <LoginForm />

          <div className="mt-8 text-center">
            <p className="text-xs text-white/20">
              Authentic · Warm · Professional
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
