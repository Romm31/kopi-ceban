"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { createMenu, updateMenu } from "@/app/admin/(dashboard)/menu/actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CldUploadButton } from "next-cloudinary"

interface MenuFormProps {
  initialData?: {
    id: number
    name: string
    description: string | null
    price: number
    imageUrl: string | null
    isAvailable: boolean
  }
}

export default function MenuForm({ initialData }: MenuFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    formData.set("imageUrl", imageUrl) // Ensure image URL is included

    const result = initialData 
      ? await updateMenu(initialData.id, formData)
      : await createMenu(formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(initialData ? "Menu updated" : "Menu created")
      router.push("/admin/menu")
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 max-w-2xl bg-white p-6 rounded-lg shadow">
      <div className="space-y-4">
        <div className="space-y-2">
           <Label>Image</Label>
           <div className="flex items-center gap-4">
              {imageUrl && (
                <img src={imageUrl} alt="Menu" className="w-24 h-24 object-cover rounded-md" />
              )}
              <div className="flex flex-col gap-2">
                 {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && (
                   <CldUploadButton 
                      uploadPreset="kopi-ceban" 
                      onSuccess={(result: any) => {
                        setImageUrl(result.info.secure_url)
                      }}
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 rounded-md text-sm font-medium"
                   >
                      Upload Image
                   </CldUploadButton>
                 )}
                 <Input 
                   name="imageUrl" 
                   placeholder="Or enter Image URL" 
                   value={imageUrl} 
                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)} 
                 />
              </div>
           </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={initialData?.name} required minLength={3} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="price">Price (Rp)</Label>
          <Input id="price" name="price" type="number" defaultValue={initialData?.price} required min={1} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea id="description" name="description" defaultValue={initialData?.description || ""} />
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="isAvailable" name="isAvailable" defaultChecked={initialData?.isAvailable ?? true} />
          <Label htmlFor="isAvailable">Available</Label>
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : (initialData ? "Update Menu" : "Create Menu")}
      </Button>
    </form>
  )
}
