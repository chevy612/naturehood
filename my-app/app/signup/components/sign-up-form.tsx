"use client";

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
<<<<<<< HEAD
import Image from 'next/image'
=======
>>>>>>> 7a9937d14e3d55973890e4611c6b3831970b0921

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
<<<<<<< HEAD
  const [username, setUsername] = useState('')
  const [isBusiness, setIsBusiness] = useState(false)
=======
>>>>>>> 7a9937d14e3d55973890e4611c6b3831970b0921
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      })
      if (error) throw error
      router.push('./signup/success')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
<<<<<<< HEAD
      <Card className="bg-[#141115] border-gray-600">
        <CardHeader className="px-12 py-8">
          {/* Logo inside the card */}
          <div className="flex justify-center mb-4">
            <Image 
              src="/naturehood.svg" 
              alt="Naturehood" 
              width={400} 
              height={80}
              priority
              className="w-full"
            />
          </div>
          <CardDescription>Sign up to share your progress with friends</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center px-12  py-0 pb-8">
          <form onSubmit={handleSignUp} className="w-full">
            <div className="flex flex-col gap-4">
              {/* Facebook Login Button */}
              <Button 
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  // Add Facebook OAuth logic here
                  console.log('Facebook login clicked')
                }}
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Log in with Facebook
              </Button>

              {/* OR Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">OR</span>
                </div>
              </div>

              {/* Email Field */}
              <div className="grid gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className=" border-gray-600 bg-[#2a2a2a] rounded-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 placeholder:text-gray-500 text-sm"
                />
              </div>

              {/* Password Field */}
              <div className="grid gap-2">
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-gray-600 bg-[#2a2a2a] rounded-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 placeholder:text-gray-500 text-sm"
                />
              </div>

              {/* Repeat Password Field */}
              <div className="grid gap-2">
                <Input
                  id="repeat-password"
                  type="password"
                  placeholder="Repeat Password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="border-gray-600 bg-[#2a2a2a] rounded-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 placeholder:text-gray-500 text-sm"
                />
              </div>

              {/* Username Field */}
              <div className="grid gap-2">
                <Input
                  id="username"
                  type="text"
                  placeholder="Username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-gray-600 bg-[#2a2a2a] rounded-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 placeholder:text-gray-500 text-sm"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              
              {/* Business Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  id="business"
                  type="checkbox"
                  checked={isBusiness}
                  onChange={(e) => setIsBusiness(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 cursor-pointer accent-blue-600"
                />
                <Label htmlFor="business" className="cursor-pointer text-sm text-foreground">
                  Sign up as business
                </Label>
              </div>

              {/* Sign Up Button */}
=======
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">Repeat Password</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
>>>>>>> 7a9937d14e3d55973890e4611c6b3831970b0921
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating an account...' : 'Sign up'}
              </Button>
            </div>
<<<<<<< HEAD
            <div className="mt-4 text-center text-sm text-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-500 hover:text-blue-400 underline underline-offset-4">
=======
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/auth/login" className="underline underline-offset-4">
>>>>>>> 7a9937d14e3d55973890e4611c6b3831970b0921
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
