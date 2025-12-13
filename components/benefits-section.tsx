import { Leaf, Sparkles, Heart, Shield } from "lucide-react"

const benefits = [
  {
    icon: Leaf,
    title: "Clean Ingredients",
    description: "Formulated without parabens, sulfates, or harmful chemicals",
  },
  {
    icon: Sparkles,
    title: "Visible Results",
    description: "Science-backed formulas that deliver real, measurable improvements",
  },
  {
    icon: Heart,
    title: "Cruelty-Free",
    description: "Never tested on animals, always kind to all beings",
  },
  {
    icon: Shield,
    title: "Dermatologist Tested",
    description: "Safe for sensitive skin and clinically proven effectiveness",
  },
]

export function BenefitsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <benefit.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground text-pretty">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
