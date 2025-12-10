"use client"

import { useState, useRef } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createMenu, updateMenu } from "@/app/actions/menu"
import { Loader2, Upload, X } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { ImageUploader } from "@/components/ui/image-uploader"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean().default(true),
})

type MenuFormValues = z.infer<typeof formSchema>

interface MenuFormProps {
  initialData?: (MenuFormValues & { id: number }) | null
  onSuccess: () => void
}

export function MenuForm({ initialData, onSuccess }: MenuFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(initialData?.imageUrl || null)

  const form = useForm<MenuFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description || "",
      price: initialData.price,
      imageUrl: initialData.imageUrl || "",
      isAvailable: initialData.isAvailable,
    } : {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      isAvailable: true,
    },
  })

  async function onSubmit(values: MenuFormValues) {
    setIsSubmitting(true)
    const formData = new FormData()
    formData.append("name", values.name)
    if (values.description) formData.append("description", values.description)
    formData.append("price", values.price.toString())
    if (values.imageUrl) formData.append("imageUrl", values.imageUrl)
    if (values.isAvailable) formData.append("isAvailable", "on")

    try {
      if (initialData) {
        await updateMenu(initialData.id, formData)
        toast.success("Menu updated successfully")
      } else {
        await createMenu(formData)
        toast.success("Menu created successfully")
      }
      onSuccess()
    } catch (error) {
      toast.error("Something went wrong")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <ImageUploader 
                    value={field.value ? [field.value] : []} 
                    disabled={isSubmitting}
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange("")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                    <Input placeholder="Cappuccino" {...field} className="bg-white/5 border-white/10" />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="25000" {...field} className="bg-white/5 border-white/10" />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A rich and creamy coffee..." {...field} className="bg-white/5 border-white/10" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isAvailable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 p-4 bg-white/5">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Availability</FormLabel>
                <FormDescription>
                  Is this menu item currently available for ordering?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full bg-coffee-gold hover:bg-coffee-gold/80 text-coffee-black font-bold">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Update Menu" : "Create Menu"}
        </Button>
      </form>
    </Form>
  )
}
