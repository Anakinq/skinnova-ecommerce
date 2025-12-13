"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"

interface Product {
  id?: string
  name: string
  slug: string
  description: string
  short_description: string
  price: number
  compare_at_price?: number
  category: string
  ingredients: string[]
  benefits: string[]
  how_to_use: string
  image_url: string
  additional_images: string[]
  stock_quantity: number
  is_featured: boolean
  is_bestseller: boolean
}

interface ProductEditFormProps {
  product?: Product
}

export function ProductEditForm({ product }: ProductEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const mainImageInputRef = useRef<HTMLInputElement>(null)
  const additionalImagesInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<Product>({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    short_description: product?.short_description || "",
    price: product?.price || 0,
    compare_at_price: product?.compare_at_price || undefined,
    category: product?.category || "",
    ingredients: product?.ingredients || [],
    benefits: product?.benefits || [],
    how_to_use: product?.how_to_use || "",
    image_url: product?.image_url || "",
    additional_images: product?.additional_images || [],
    stock_quantity: product?.stock_quantity || 0,
    is_featured: product?.is_featured || false,
    is_bestseller: product?.is_bestseller || false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    try {
      if (product?.id) {
        // Update existing product
        const { data, error } = await supabase.from("products").update(formData).eq("id", product.id).select()

        if (error) {
          console.error("Update error:", error)
          throw new Error(`Failed to update product: ${error.message}`)
        }

        console.log("Product updated:", data)
      } else {
        // Create new product
        const { data, error } = await supabase.from("products").insert([formData]).select()

        if (error) {
          console.error("Insert error:", error)
          throw new Error(`Failed to create product: ${error.message}`)
        }

        console.log("Product created:", data)
      }

      router.push("/admin/products")
      router.refresh()
    } catch (error: any) {
      console.error("Error saving product:", error)
      alert(error.message || "Failed to save product. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    })
  }

  const handleImageUpload = async (file: File, isMainImage: boolean = true) => {
    setUploadingImage(true)
    const supabase = createClient()

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath)

      if (isMainImage) {
        setFormData({ ...formData, image_url: publicUrl })
      } else {
        setFormData({ ...formData, additional_images: [...formData.additional_images, publicUrl] })
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Failed to upload image. Please try again.")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file, true)
    }
  }

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file: File) => handleImageUpload(file, false))
  }

  const removeAdditionalImage = (index: number) => {
    setFormData({
      ...formData,
      additional_images: formData.additional_images.filter((_: string, i: number) => i !== index),
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleNameChange(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Textarea
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="how_to_use">How to Use</Label>
                <Textarea
                  id="how_to_use"
                  value={formData.how_to_use}
                  onChange={(e) => setFormData({ ...formData, how_to_use: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ingredients">Ingredients (comma separated)</Label>
                <Textarea
                  id="ingredients"
                  value={formData.ingredients.join(", ")}
                  onChange={(e) =>
                    setFormData({ ...formData, ingredients: e.target.value.split(",").map((i) => i.trim()) })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">Benefits (comma separated)</Label>
                <Textarea
                  id="benefits"
                  value={formData.benefits.join(", ")}
                  onChange={(e) =>
                    setFormData({ ...formData, benefits: e.target.value.split(",").map((b) => b.trim()) })
                  }
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₦)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="compare_at_price">Compare at Price (₦)</Label>
                <Input
                  id="compare_at_price"
                  type="number"
                  step="0.01"
                  value={formData.compare_at_price || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      compare_at_price: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: Number.parseInt(e.target.value) })}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Main Image</Label>
                {formData.image_url ? (
                  <div className="space-y-2">
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                      <Image
                        src={formData.image_url}
                        alt="Main product image"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        ref={mainImageInputRef}
                        onChange={handleMainImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => mainImageInputRef.current?.click()}
                        disabled={uploadingImage}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Change Image
                      </Button>
                      <Input
                        placeholder="Or paste image URL"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex aspect-square w-full items-center justify-center rounded-lg border-2 border-dashed bg-muted">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">No image uploaded</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        ref={mainImageInputRef}
                        onChange={handleMainImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => mainImageInputRef.current?.click()}
                        disabled={uploadingImage}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Image
                      </Button>
                      <Input
                        placeholder="Or paste image URL"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Additional Images</Label>
                {formData.additional_images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {formData.additional_images.map((url, index) => (
                      <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
                        <Image src={url} alt={`Additional image ${index + 1}`} fill className="object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => removeAdditionalImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={additionalImagesInputRef}
                  onChange={handleAdditionalImagesChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => additionalImagesInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Add More Images
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_featured">Featured Product</Label>
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_bestseller">Bestseller</Label>
                <Switch
                  id="is_bestseller"
                  checked={formData.is_bestseller}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_bestseller: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {product ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </div>
    </form>
  )
}
