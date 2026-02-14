"use client";

import { cn } from '@/lib/utils'
import { signUpNewUser } from '@/app/signup/actions'
import { InputField, Checkbox, ButtonPrimary } from '@/app/components/basic/basic'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isBusiness, setIsBusiness] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address')
    } else {
      setEmailError(null)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setEmailError(null)

    // Client-side validation
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (!username || username.trim().length < 3) {
      setError('Username must be at least 3 characters long')
      setIsLoading(false)
      return
    }

    try {
      // Call server action
      const result = await signUpNewUser({
        email,
        password,
        repeatPassword,
        username,
        isBusiness
      })
      
      if (result.error) {
        setError(result.error)
      } else {
        // Signup successful, redirect to success page
        router.push('/signup/success')
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
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
          <CardDescription>Sign up to share your progress with friends</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center px-6 py-0 pb-6">
          <form onSubmit={handleSignUp} className="w-full">
            <div className="flex flex-col gap-6">
              {/* Email Field */}
              <InputField
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                error={emailError || undefined}
              />

              {/* Password Field */}
              <InputField
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Repeat Password Field */}
              <InputField
                type="password"
                placeholder="Repeat Password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
              />

              {/* Username Field */}
              <InputField
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              {error && <p className="text-sm text-red-500">{error}</p>}

              {/* Business Checkbox */}
              <Checkbox
                label="Sign up as business"
                checked={isBusiness}
                onChange={(e) => setIsBusiness(e.target.checked)}
              />

              {/* Sign Up Button */}
              <ButtonPrimary type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Creating an account...' : 'Sign up'}
              </ButtonPrimary>
            </div>
            <div className="mt-6 text-center text-sm text-white/80">
              Already have an account?{' '}
              <Link href="/login" className="text-[#C8F04D] hover:text-[#b8e038] underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
