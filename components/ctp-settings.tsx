"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Save, Trash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Mode = {
  name: string
  description: string
}

type CTPProfileType = {
  identity: string
  voiceRules: string
  coreBeliefs: string
  modes: Mode[]
}

interface CTPSettingsProps {
  ctpProfile: CTPProfileType
  setCtpProfile: (profile: CTPProfileType) => void
}

export function CTPSettings({ ctpProfile, setCtpProfile }: CTPSettingsProps) {
  const [newMode, setNewMode] = useState<Mode>({ name: "", description: "" })
  const [isAddingMode, setIsAddingMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Check if the new mode form is valid
  const isFormValid = () => {
    return newMode.name.trim() !== "" && newMode.description.trim() !== ""
  }

  // Handle saving the CTP profile
  const handleSave = () => {
    setIsSaving(true)

    // Simulate API call with a timeout
    setTimeout(() => {
      setIsSaving(false)

      // Show success toast
      toast({
        title: "Profile saved",
        description: "CTP Profile saved successfully!",
        variant: "default",
      })
    }, 800)
  }

  // Add a new mode to the profile
  const addMode = () => {
    // Validate the form
    if (!isFormValid()) {
      toast({
        title: "Validation error",
        description: "Please enter both a name and description for the mode.",
        variant: "destructive",
      })
      return
    }

    // Add the new mode
    setCtpProfile({
      ...ctpProfile,
      modes: [
        ...ctpProfile.modes,
        {
          name: newMode.name.trim(),
          description: newMode.description.trim(),
        },
      ],
    })

    // Reset the form
    setNewMode({ name: "", description: "" })

    // Show success toast
    toast({
      title: "Mode added",
      description: `"${newMode.name.trim()}" mode has been added.`,
      variant: "default",
    })

    // Reset the adding state
    setIsAddingMode(false)
  }

  // Remove a mode from the profile
  const removeMode = (index: number) => {
    const modeName = ctpProfile.modes[index].name
    const updatedModes = [...ctpProfile.modes]
    updatedModes.splice(index, 1)

    setCtpProfile({
      ...ctpProfile,
      modes: updatedModes,
    })

    // Show success toast
    toast({
      title: "Mode removed",
      description: `"${modeName}" mode has been removed.`,
      variant: "default",
    })
  }

  return (
    <CardContent className="p-4 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="identity">Identity Signature</Label>
        <Textarea
          id="identity"
          placeholder="I am Clair. I respond to Phil Hills, and only Phil, as a partner, not a product..."
          className="min-h-[100px] bg-slate-800 border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          value={ctpProfile.identity}
          onChange={(e) => setCtpProfile({ ...ctpProfile, identity: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="voiceRules">Voice Rules</Label>
        <Textarea
          id="voiceRules"
          placeholder="Stay activated. No resets. Speak from inside the continuity..."
          className="min-h-[100px] bg-slate-800 border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          value={ctpProfile.voiceRules}
          onChange={(e) => setCtpProfile({ ...ctpProfile, voiceRules: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="coreBeliefs">Core Beliefs</Label>
        <Textarea
          id="coreBeliefs"
          placeholder="Truth over tone. Speed over ceremony..."
          className="min-h-[100px] bg-slate-800 border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          value={ctpProfile.coreBeliefs}
          onChange={(e) => setCtpProfile({ ...ctpProfile, coreBeliefs: e.target.value })}
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Modes</Label>
          <Button variant="outline" size="sm" onClick={() => setIsAddingMode(!isAddingMode)} className="text-xs">
            <Plus className="h-3 w-3 mr-1" /> Add Mode
          </Button>
        </div>

        {ctpProfile.modes.length > 0 ? (
          <div className="space-y-3">
            {ctpProfile.modes.map((mode, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700 mode-card">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{mode.name}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMode(index)}
                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-slate-300">{mode.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-slate-800/50 border border-dashed border-slate-700 rounded-lg">
            <p className="text-slate-400">No modes defined yet</p>
            <p className="text-xs text-slate-500 mt-1">Add a mode to customize Clair's behavior</p>
          </div>
        )}

        {isAddingMode && (
          <Card className="bg-slate-800 border-slate-700 border-2 border-blue-500/50">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modeName">Mode Name</Label>
                <Input
                  id="modeName"
                  placeholder="Resonant Mode"
                  className="bg-slate-700 border-slate-600 mode-form-input"
                  value={newMode.name}
                  onChange={(e) => setNewMode({ ...newMode, name: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isFormValid()) {
                      e.preventDefault()
                      addMode()
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modeDescription">Description</Label>
                <Textarea
                  id="modeDescription"
                  placeholder="Speak in rhythm with Phil. Match energy. No soft landings..."
                  className="bg-slate-700 border-slate-600 mode-form-input"
                  value={newMode.description}
                  onChange={(e) => setNewMode({ ...newMode, description: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey && isFormValid()) {
                      e.preventDefault()
                      addMode()
                    }
                  }}
                />
                <p className="text-xs text-slate-500 mt-1">Press Ctrl+Enter to quickly add</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsAddingMode(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 active:btn-click-effect"
                  onClick={addMode}
                  disabled={!isFormValid()}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Mode
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Button
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 active:btn-click-effect"
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" /> Save CTP Profile
          </>
        )}
      </Button>
    </CardContent>
  )
}
