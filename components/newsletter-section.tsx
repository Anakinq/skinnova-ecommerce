"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement newsletter signup
    setIsSubmitted(true)
    setEmail("")
  }

  return (
    <section className="bg-secondary py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">Join Our Community</h2>
          <p className="mt-3 text-muted-foreground md:text-lg">
            Get exclusive skincare tips, early access to new products, and special offers
          </p>

          {isSubmitted ? (
            <div className="mt-8 rounded-lg bg-primary/10 p-4 text-primary">
              Thank you for subscribing! Check your email for a welcome gift.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit">Subscribe</Button>
            </form>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            By subscribing, you agree to our Privacy Policy and consent to receive updates.
          </p>
        </div>
      </div>
    </section>
  )
}
