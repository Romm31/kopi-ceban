"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { updateAdminPassword } from "@/app/actions/profile"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

interface ChangePasswordFormProps {
    adminId: number
}

export function ChangePasswordForm({ adminId }: ChangePasswordFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const form = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    })

    async function onSubmit(values: z.infer<typeof passwordSchema>) {
        setIsSubmitting(true)
        const formData = new FormData()
        formData.append("currentPassword", values.currentPassword)
        formData.append("newPassword", values.newPassword)
        formData.append("confirmPassword", values.confirmPassword)

        try {
            const result = await updateAdminPassword(adminId, formData)
            
            if (result.error) {
                if (typeof result.error === 'string') {
                    toast.error(result.error)
                } else {
                   // Handle field errors
                   // eslint-disable-next-line @typescript-eslint/no-unused-vars
                   Object.keys(result.error).forEach(key => {
                        toast.error("Please check your input")
                   })
                   // Manually setting error for current password if it matched our server return structure
                   if (result.error.currentPassword) {
                       form.setError("currentPassword", { message: result.error.currentPassword[0] })
                   }
                }
            } else {
                toast.success("Password updated successfully")
                form.reset()
            }
        } catch (error) {
            toast.error("Something went wrong")
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input 
                                        type={showCurrent ? "text" : "password"} 
                                        placeholder="••••••" 
                                        {...field} 
                                        className="bg-white/5 border-white/10 pr-10" 
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-white"
                                        onClick={() => setShowCurrent(!showCurrent)}
                                    >
                                        {showCurrent ? (
                                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                                        ) : (
                                            <Eye className="h-4 w-4" aria-hidden="true" />
                                        )}
                                        <span className="sr-only">
                                            {showCurrent ? "Hide password" : "Show password"}
                                        </span>
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <Separator className="bg-white/10 my-2" />

                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input 
                                        type={showNew ? "text" : "password"} 
                                        placeholder="••••••" 
                                        {...field} 
                                        className="bg-white/5 border-white/10 pr-10" 
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-white"
                                        onClick={() => setShowNew(!showNew)}
                                    >
                                        {showNew ? (
                                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                                        ) : (
                                            <Eye className="h-4 w-4" aria-hidden="true" />
                                        )}
                                        <span className="sr-only">
                                            {showNew ? "Hide password" : "Show password"}
                                        </span>
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input 
                                        type={showConfirm ? "text" : "password"} 
                                        placeholder="••••••" 
                                        {...field} 
                                        className="bg-white/5 border-white/10 pr-10" 
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-white"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                    >
                                        {showConfirm ? (
                                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                                        ) : (
                                            <Eye className="h-4 w-4" aria-hidden="true" />
                                        )}
                                        <span className="sr-only">
                                            {showConfirm ? "Hide password" : "Show password"}
                                        </span>
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={isSubmitting} className="bg-coffee-gold hover:bg-coffee-gold/80 text-coffee-black font-bold w-full sm:w-auto">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Change Password
                    </Button>
                </div>
            </form>
        </Form>
    )
}
