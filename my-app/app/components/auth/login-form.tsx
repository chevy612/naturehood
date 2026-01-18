'use client'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from './ui/button'
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
import Image from 'next/image'

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailOrUsername,
        password,
      })
      if (error) throw error
      // Redirect to home page after successful login
      router.push('/home')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6 w-full max-w-md mx-auto px-4', className)} {...props}>
      <Card className="bg-[#141115] border-gray-600 w-full">
        <CardHeader className="px-6 py-6">
          {/* Logo inside the card */}
          <div className="flex justify-center mb-2">
            <Image 
              src="/naturehood.svg" 
              alt="Naturehood" 
              width={280} 
              height={50}
              priority
              className="w-50 max-w-[300px]"
            />
          </div>
          <CardDescription>Login to your account</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center px-6 py-0 pb-6">
          <form onSubmit={handleLogin} className="w-full">
            <div className="flex flex-col gap-3">
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
                Sign in with Facebook
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

              {/* Email or Username Field */}
              <div className="grid gap-2">
                <Input
                  id="emailOrUsername"
                  type="text"
                  placeholder="Email or Username"
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="w-full h-10 border-gray-600 bg-[#2a2a2a] rounded-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 placeholder:text-gray-500 text-sm"
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
                  className="w-full h-10 border-gray-600 bg-[#2a2a2a] rounded-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 placeholder:text-gray-500 text-sm"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              {/* Login Button */}
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm text-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-blue-500 hover:text-blue-400 underline underline-offset-4">
                Sign up
              </Link>
            </div>
            <div className="mt-2 text-center text-sm">
              <Link href="/home" className="text-gray-400 hover:text-gray-300 flex items-center justify-center gap-1">
                Explore without login
                <span className="text-lg">›</span>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
