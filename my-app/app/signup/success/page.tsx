import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/auth/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/app/components/auth/ui/button';

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6 w-full max-w-md mx-auto px-4">
          <Card className="bg-[#f5f5f5] border-gray-600 w-full">
            <CardHeader className="px-6 py-6">
              <CardTitle className="text-2xl text-center ">Thank you for signing up!</CardTitle>
              <CardDescription className="text-center">Check your email to confirm</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <p className="text-sm text-muted-foreground text-center mb-4">
                You&apos;ve successfully signed up. Please check your email to confirm your account
                before signing in.
              </p>
              <div className="flex justify-center">
                <Link href="/home" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
                  Explore now
                  <span className="text-lg">›</span>
                </Link>
              </div>
            </CardContent>
            {/* Logo inside the card */}
              <div className="flex justify-center mb-2">
                <Image 
                  src="/naturehood_black.svg" 
                  alt="Naturehood" 
                  width={280} 
                  height={50}
                  priority
                  className="w-30 max-w-[300px]"
                />
              </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
