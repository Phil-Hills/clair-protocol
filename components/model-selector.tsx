"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Updated with current valid model names
const models = [
  {
    value: "gpt-3.5-turbo",
    label: "GPT-3.5 Turbo",
  },
  {
    value: "gpt-4o",
    label: "GPT-4o",
  },
  {
    value: "gpt-4-turbo",
    label: "GPT-4 Turbo",
  },
]

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (model: string) => void
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [open, setOpen] = useState(false)

  // Ensure the selected model is valid
  const validModel = models.find((model) => model.value === selectedModel)
  if (!validModel && selectedModel) {
    // If the stored model is no longer valid, default to gpt-3.5-turbo
    onModelChange("gpt-3.5-turbo")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-slate-800 border-slate-700 hover:bg-slate-700"
        >
          {selectedModel
            ? models.find((model) => model.value === selectedModel)?.label || "Select model..."
            : "Select model..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-slate-800 border-slate-700">
        <Command className="bg-transparent">
          <CommandInput placeholder="Search model..." className="h-9" />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {models.map((model) => (
                <CommandItem
                  key={model.value}
                  value={model.value}
                  onSelect={(currentValue) => {
                    onModelChange(currentValue)
                    setOpen(false)
                  }}
                  className="hover:bg-slate-700"
                >
                  <Check className={cn("mr-2 h-4 w-4", selectedModel === model.value ? "opacity-100" : "opacity-0")} />
                  {model.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
