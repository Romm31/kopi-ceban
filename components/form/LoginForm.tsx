"use client"

import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Lock, Loader2, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner" 

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

export default function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorShake, setErrorShake] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    setErrorShake(false)
    try {
      const result = await signIn("credentials", {
        username: values.username,
        password: values.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Invalid credentials", {
             style: { background: '#2A1A12', color: '#E6D5C3', border: '1px solid #CBA35C' }
        })
        setErrorShake(true)
        setTimeout(() => setErrorShake(false), 500)
        return
      }

      toast.success("Welcome back, Barista!", {
        icon: <Coffee className="h-4 w-4 text-[#CBA35C]" />,
        style: { background: '#2A1A12', color: '#E6D5C3', border: '1px solid #CBA35C' }
      })
      router.push("/admin/dashboard")
      router.refresh()
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      animate={errorShake ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-coffee-cream">Username</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-coffee-gold transition-colors" />
                    <Input 
                        placeholder="Enter your username" 
                        className="pl-10 bg-white/5 border-white/10 text-coffee-cream placeholder:text-white/20 focus:border-coffee-gold/50 focus:ring-coffee-gold/20 hover:bg-white/10 transition-all duration-300"
                        {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-coffee-cream">Password</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-coffee-gold transition-colors" />
                    <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10 bg-white/5 border-white/10 text-coffee-cream placeholder:text-white/20 focus:border-coffee-gold/50 focus:ring-coffee-gold/20 hover:bg-white/10 transition-all duration-300"
                        {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-coffee-gold to-[#B8860B] hover:from-[#B8860B] hover:to-coffee-gold text-coffee-black font-semibold h-11 tracking-wide shadow-lg shadow-coffee-gold/20 hover:shadow-coffee-gold/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300" 
            disabled={loading}
          >
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Brewing Access...
              </motion.div>
            ) : (
                "Sign In"
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  )
}
