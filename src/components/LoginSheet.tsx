import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"

interface LoginSheetProps {
  children: React.ReactNode
}

export function LoginSheet({ children }: LoginSheetProps) {
  const [name, setName] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)
  const [error, setError] = React.useState("")
  const navigate = useNavigate()
  const { login } = useAuth()

  const isButtonDisabled = !name.trim() || !password.trim()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!isButtonDisabled) {
      const success = login(name, password)
      if (success) {
        console.log("Login successful:", { name })
        setIsOpen(false)
        setName("")
        setPassword("")
        navigate({ to: '/dashboard' })
      } else {
        setError("Invalid password. Please try again.")
      }
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="bg-[#1d1d1d] border-[#222222] w-full sm:max-w-[536px] p-0"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-0 pt-[120px] pl-[53px] pb-[60px]">
            <SheetTitle className="font-['coolvetica',sans-serif] font-normal text-[36px] text-white leading-none text-left">
              login
            </SheetTitle>
          </SheetHeader>

          {/* Form */}
          <div className="flex-1 px-[47px]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-[442px]">
              {/* Name Field */}
              <div className="flex flex-col gap-3">
                <Label 
                  htmlFor="name" 
                  className="font-['coolvetica',sans-serif] font-light text-[15px] text-white leading-none"
                >
                  name (as written on your evals)
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#181818] border-[#222222] rounded-[12px] h-[46px] text-white placeholder:text-gray-400 focus-visible:ring-[#4d47f6]/50 focus-visible:border-[#4d47f6]"
                  placeholder=""
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-3">
                <Label 
                  htmlFor="password" 
                  className="font-['coolvetica',sans-serif] font-light text-[15px] text-white leading-none"
                >
                  password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#181818] border-[#222222] rounded-[12px] h-[46px] text-white placeholder:text-gray-400 focus-visible:ring-[#4d47f6]/50 focus-visible:border-[#4d47f6]"
                  placeholder=""
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-400 text-sm font-['coolvetica',sans-serif] font-light">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isButtonDisabled}
                className="bg-[#4d47f6] hover:bg-[#4d47f6]/90 disabled:bg-[#4d47f6]/50 disabled:opacity-50 text-white font-semibold text-sm rounded-[8px] h-auto py-[10px] mt-0 transition-all duration-200"
              >
                Enter
              </Button>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
