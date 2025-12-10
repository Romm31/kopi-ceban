"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ImagePlus, Trash, Upload, Loader2, X } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

interface ImageUploaderProps {
  disabled?: boolean
  onChange: (value: string) => void
  onRemove: (value: string) => void
  value: string[]
}

export function ImageUploader({
  disabled,
  onChange,
  onRemove,
  value,
}: ImageUploaderProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setIsLoading(true);

    try {
        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            throw new Error("Upload failed");
        }

        const data = await res.json();
        onChange(data.url);
        toast.success("Image uploaded successfully");
    } catch (error) {
        toast.error("Failed to upload image");
        console.error(error);
    } finally {
        setIsLoading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
  }

  const triggerUpload = () => {
    fileInputRef.current?.click();
  }

  if (!isMounted) {
    return null
  }

  return (
    <div className="mb-4 flex flex-col gap-4">
      {value.map((url) => (
        <div
          key={url}
          className="relative w-[200px] h-[200px] rounded-xl overflow-hidden border border-white/10 group bg-white/5"
        >
          <div className="z-10 absolute top-2 right-2">
            <Button
              type="button"
              onClick={() => onRemove(url)}
              variant="destructive"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/80 hover:bg-red-600"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
          <Image fill className="object-cover" alt="Image" src={url} />
        </div>
      ))}
      {value.length === 0 && (
        <div 
            onClick={triggerUpload}
            className="
                flex flex-col items-center justify-center 
                border-2 border-dashed border-white/10 
                rounded-xl p-8 
                hover:border-coffee-gold/50 cursor-pointer 
                hover:bg-white/5 transition-all
                text-center
                gap-2
            "
        >
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={onUpload} 
                className="hidden" 
                accept="image/*"
                disabled={disabled || isLoading}
            />
          <Button
            type="button"
            disabled={disabled || isLoading}
            variant="ghost"
            size="sm"
            className="pointer-events-none text-muted-foreground group-hover:text-coffee-gold"
          >
            {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : <ImagePlus className="h-8 w-8 mb-2" />}
          </Button>
          <div className="text-sm text-muted-foreground group-hover:text-coffee-cream">
            {isLoading ? "Uploading..." : "Click to upload an image"}
          </div>
          <div className="text-xs text-muted-foreground/50">
            JPG, PNG, WEBP (Max 5MB)
          </div>
        </div>
      )}
    </div>
  )
}
