
"use client"

import * as React from "react"
import { Moon, Sun, Laptop, Check } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [dropdownRef])

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-md border bg-popover p-1 shadow-md z-[51]">
          <div className="space-y-1">
            <button
              onClick={() => {
                setTheme("light")
                setIsOpen(false)
              }}
              className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-muted/50 ${
                theme === "light" ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              <Sun className="h-4 w-4" />
              <span>Light</span>
              {theme === "light" && <Check className="ml-auto h-3 w-3" />}
            </button>
            <button
              onClick={() => {
                setTheme("dark")
                setIsOpen(false)
              }}
              className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-muted/50 ${
                theme === "dark" ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              <Moon className="h-4 w-4" />
              <span>Dark</span>
              {theme === "dark" && <Check className="ml-auto h-3 w-3" />}
            </button>
            <button
              onClick={() => {
                setTheme("system")
                setIsOpen(false)
              }}
              className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-muted/50 ${
                theme === "system" ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              <Laptop className="h-4 w-4" />
              <span>System</span>
              {theme === "system" && <Check className="ml-auto h-3 w-3" />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
