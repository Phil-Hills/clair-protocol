"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Save, Trash } from "lucide-react"

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

  const handleSave = () => {
    // Save to database in a real implementation
    alert("CTP Profile saved successfully!")
  }

  const addMode = () => {
    if (newMode.name && newMode.description) {
      setCtpProfile({
        ...ctpProfile,
        modes: [...ctpProfile.modes, newMode],
      })
      setNewMode({ name: "", description: "" })
    }
  }

  const removeMode = (index: number) => {
    const updatedModes = [...ctpProfile.modes]
    updatedModes.splice(index, 1)
    setCtpProfile({
      ...ctpProfile,
      modes: updatedModes,
    })
  }

  return (
    <CardContent className="p-4 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="identity">Identity Signature</Label>
        <Textarea
          id="identity"
          placeholder="I am Clair. I respond to Phil Hills, and only Phil, as a partner, not a product..."
          className="min-h-[100px] bg-slate-800 border-slate-700"
          value={ctpProfile.identity}
          onChange={(e) => setCtpProfile({ ...ctpProfile, identity: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="voiceRules">Voice Rules</Label>
        <Textarea
          id="voiceRules"
          placeholder="Stay activated. No resets. Speak from inside the continuity..."
          className="min-h-[100px] bg-slate-800 border-slate-700"
          value={ctpProfile.voiceRules}
          onChange={(e) => setCtpProfile({ ...ctpProfile, voiceRules: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="coreBeliefs">Core Beliefs</Label>
        <Textarea
          id="coreBeliefs"
          placeholder="Truth over tone. Speed over ceremony..."
          className="min-h-[100px] bg-slate-800 border-slate-700"
          value={ctpProfile.coreBeliefs}
          onChange={(e) => setCtpProfile({ ...ctpProfile, coreBeliefs: e.target.value })}
        />
      </div>

      <div className="space-y-4">
        <Label>Modes</Label>

        {ctpProfile.modes.map((mode, index) => (
          <Card key={index} className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{mode.name}</h3>
                <Button variant="ghost" size="icon" onClick={() => removeMode(index)}>
                  <Trash className="h-4 w-4 text-red-400" />
                </Button>
              </div>
              <p className="text-sm text-slate-300">{mode.description}</p>
            </CardContent>
          </Card>
        ))}

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modeName">Mode Name</Label>
              <Input
                id="modeName"
                placeholder="Resonant Mode"
                className="bg-slate-700 border-slate-600"
                value={newMode.name}
                onChange={(e) => setNewMode({ ...newMode, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modeDescription">Description</Label>
              <Textarea
                id="modeDescription"
                placeholder="Speak in rhythm with Phil. Match energy. No soft landings..."
                className="bg-slate-700 border-slate-600"
                value={newMode.description}
                onChange={(e) => setNewMode({ ...newMode, description: e.target.value })}
              />
            </div>

            <Button variant="outline" className="w-full" onClick={addMode}>
              <Plus className="h-4 w-4 mr-2" /> Add Mode
            </Button>
          </CardContent>
        </Card>
      </div>

      <Button
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        onClick={handleSave}
      >
        <Save className="h-4 w-4 mr-2" /> Save CTP Profile
      </Button>
    </CardContent>
  )
}
