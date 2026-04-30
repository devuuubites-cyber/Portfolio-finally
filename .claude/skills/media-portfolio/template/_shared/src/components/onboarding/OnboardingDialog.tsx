import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { usePortfolio } from "@/store/portfolio"

const splitList = (raw: string) =>
  Array.from(
    new Set(
      raw
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  )

const splitLines = (raw: string) =>
  raw
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean)

export function OnboardingDialog() {
  const open = usePortfolio((s) => s.isOnboardingOpen)
  const close = usePortfolio((s) => s.closeOnboarding)
  const setData = usePortfolio((s) => s.setData)
  const data = usePortfolio((s) => s.data)

  const [name, setName] = useState("")
  const [skills, setSkills] = useState("")
  const [accomplishments, setAccomplishments] = useState("")
  const [hobbies, setHobbies] = useState("")

  // Hydrate inputs whenever the dialog opens, so "edit info" prefills.
  useEffect(() => {
    if (!open) return
    setName(data?.name ?? "")
    setSkills(data?.skills.join(", ") ?? "")
    setAccomplishments(data?.accomplishments.join("\n") ?? "")
    setHobbies(data?.hobbies.join(", ") ?? "")
  }, [open, data])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setData({
      name: name.trim(),
      skills: splitList(skills),
      accomplishments: splitLines(accomplishments),
      hobbies: splitList(hobbies),
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) close()
      }}
    >
      <DialogContent
        hideClose={!data}
        onInteractOutside={(e) => {
          if (!data) e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          if (!data) e.preventDefault()
        }}
      >
        <DialogHeader>
          <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-moss">
            before we walk
          </p>
          <DialogTitle>Tell the street about you.</DialogTitle>
          <DialogDescription>
            Four short answers. They become the words that surface as you move
            through the scene.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-5">
          <Field id="name" label="Your name">
            <Input
              id="name"
              autoFocus
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya Okafor"
              required
            />
          </Field>

          <Field id="skills" label="Core skills" hint="comma-separated">
            <Input
              id="skills"
              autoComplete="off"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, type systems, motion design"
            />
          </Field>

          <Field
            id="accomplishments"
            label="Major accomplishments"
            hint="one per line"
          >
            <Textarea
              id="accomplishments"
              value={accomplishments}
              onChange={(e) => setAccomplishments(e.target.value)}
              placeholder={
                "Shipped X to a million users\nSpoke at Y conference\nLed the Z migration"
              }
              rows={4}
            />
          </Field>

          <Field id="hobbies" label="Hobbies & interests" hint="comma-separated">
            <Input
              id="hobbies"
              autoComplete="off"
              value={hobbies}
              onChange={(e) => setHobbies(e.target.value)}
              placeholder="bouldering, film photography, lo-fi"
            />
          </Field>

          <DialogFooter className="mt-2">
            {data && (
              <Button type="button" variant="ghost" size="sm" onClick={close}>
                cancel
              </Button>
            )}
            <Button type="submit" size="sm" disabled={!name.trim()}>
              {data ? "save" : "enter the street"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={id}>{label}</Label>
        {hint && (
          <span className="text-[10px] text-bone/35 tracking-wide">{hint}</span>
        )}
      </div>
      {children}
    </div>
  )
}
