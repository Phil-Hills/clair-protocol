"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Save } from "lucide-react"

export function ProfileSettings() {
  const [profile, setProfile] = useState({
    name: "Phil Hills",
    email: "",
    bio: "",
    preferences: {
      enableMemory: true,
      enableAnalytics: false,
      privateMode: true,
    },
  })

  const handleSave = () => {
    // Save to database in a real implementation
    alert("Profile saved successfully!")
  }

  return (
    <CardContent className="p-4 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Your name"
          className="bg-slate-800 border-slate-700"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Your email"
          className="bg-slate-800 border-slate-700"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          placeholder="Tell Clair about yourself..."
          className="min-h-[100px] bg-slate-800 border-slate-700"
          value={profile.bio}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Preferences</h3>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="memory">Enable Memory</Label>
            <p className="text-xs text-slate-400">Allow Clair to remember past conversations</p>
          </div>
          <Switch
            id="memory"
            checked={profile.preferences.enableMemory}
            onCheckedChange={(checked) =>
              setProfile({
                ...profile,
                preferences: { ...profile.preferences, enableMemory: checked },
              })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="analytics">Enable Analytics</Label>
            <p className="text-xs text-slate-400">Allow anonymous usage data collection</p>
          </div>
          <Switch
            id="analytics"
            checked={profile.preferences.enableAnalytics}
            onCheckedChange={(checked) =>
              setProfile({
                ...profile,
                preferences: { ...profile.preferences, enableAnalytics: checked },
              })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="private">Private Mode</Label>
            <p className="text-xs text-slate-400">Keep conversations local and encrypted</p>
          </div>
          <Switch
            id="private"
            checked={profile.preferences.privateMode}
            onCheckedChange={(checked) =>
              setProfile({
                ...profile,
                preferences: { ...profile.preferences, privateMode: checked },
              })
            }
          />
        </div>
      </div>

      <Button
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        onClick={handleSave}
      >
        <Save className="h-4 w-4 mr-2" /> Save Profile
      </Button>
    </CardContent>
  )
}
