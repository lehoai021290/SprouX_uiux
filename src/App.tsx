import { Button } from "@/components/ui/button"
import { Plus, Trash2, ChevronRight, Settings } from "lucide-react"

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h1 className="text-heading-3">SprouX Design System</h1>
          <p className="text-muted-foreground text-paragraph-sm">
            Button Component Preview
          </p>
        </div>

        {/* Variants */}
        <section className="space-y-4">
          <h2 className="font-heading font-semibold text-lg">Variants</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="ghost-muted">Ghost Muted</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="destructive-secondary">Destructive Secondary</Button>
          </div>
        </section>

        {/* Sizes */}
        <section className="space-y-4">
          <h2 className="font-heading font-semibold text-lg">Sizes</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg">Large</Button>
            <Button size="default">Regular</Button>
            <Button size="sm">Small</Button>
            <Button size="xs">Mini</Button>
          </div>
        </section>

        {/* With Icons */}
        <section className="space-y-4">
          <h2 className="font-heading font-semibold text-lg">With Icons</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button>
              <Plus />
              Add Item
            </Button>
            <Button variant="secondary">
              Settings
              <ChevronRight />
            </Button>
            <Button variant="outline">
              <Settings />
              Configure
            </Button>
            <Button variant="destructive">
              <Trash2 />
              Delete
            </Button>
          </div>
        </section>

        {/* Icon Buttons */}
        <section className="space-y-4">
          <h2 className="font-heading font-semibold text-lg">Icon Buttons</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="icon-lg"><Plus /></Button>
            <Button size="icon"><Plus /></Button>
            <Button size="icon-sm"><Plus /></Button>
            <Button variant="secondary" size="icon"><Settings /></Button>
            <Button variant="outline" size="icon"><Settings /></Button>
            <Button variant="ghost" size="icon"><Settings /></Button>
            <Button variant="destructive" size="icon"><Trash2 /></Button>
          </div>
        </section>

        {/* Disabled */}
        <section className="space-y-4">
          <h2 className="font-heading font-semibold text-lg">Disabled</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>Primary</Button>
            <Button variant="secondary" disabled>Secondary</Button>
            <Button variant="outline" disabled>Outline</Button>
            <Button variant="ghost" disabled>Ghost</Button>
            <Button variant="destructive" disabled>Destructive</Button>
            <Button variant="destructive-secondary" disabled>Destructive Secondary</Button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
