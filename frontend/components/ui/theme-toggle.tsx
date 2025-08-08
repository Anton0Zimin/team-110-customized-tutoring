"use client"

import * as React from "react"
import { Moon, Sun, Monitor, TreePine, Mountain, Shell, CloudSun, Flower, Eye } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
  { value: "forest", label: "Forest", icon: TreePine },
  { value: "mud", label: "Mud", icon: Mountain },
  { value: "ocean", label: "Ocean", icon: Shell },
  { value: "sunset", label: "Sunset", icon: CloudSun },
  { value: "lavender", label: "Lavender", icon: Flower },
  { value: "dyslexia", label: "Dyslexia-Friendly", icon: Eye },
]

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  const currentTheme = themes.find(t => t.value === theme) || themes[2] // Default to system
  const Icon = currentTheme.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
          <Icon className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themes.map((themeOption) => {
          const ThemeIcon = themeOption.icon
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className="flex items-center space-x-2"
            >
              <ThemeIcon className="h-4 w-4" />
              <span>{themeOption.label}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 