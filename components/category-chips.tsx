import { Badge } from "@/components/ui/badge"

const categories = [
  { label: "Papelería", value: "papeleria" },
  { label: "Merchandising", value: "merchandising" },
  { label: "Señalética", value: "senaletica" },
]

export function CategoryChips() {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Badge
          key={category.value}
          variant="outline"
          className="px-4 py-2 text-sm font-medium border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer"
        >
          {category.label}
        </Badge>
      ))}
    </div>
  )
}
