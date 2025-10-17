import { createClient } from "@/lib/supabase/client"

export async function uploadExpenseImage(file: File): Promise<string> {
  const supabase = createClient()

  // Generate unique filename
  const fileExt = file.name.split(".").pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${fileName}`

  // Upload file to Supabase Storage
  const { data, error } = await supabase.storage.from("expense-images").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    console.error("[v0] Error uploading image:", error)
    throw new Error("Error al subir la imagen")
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("expense-images").getPublicUrl(filePath)

  return publicUrl
}

export async function deleteExpenseImage(imageUrl: string): Promise<void> {
  const supabase = createClient()

  // Extract file path from URL
  const urlParts = imageUrl.split("/expense-images/")
  if (urlParts.length < 2) return

  const filePath = urlParts[1]

  const { error } = await supabase.storage.from("expense-images").remove([filePath])

  if (error) {
    console.error("[v0] Error deleting image:", error)
  }
}
