"use client";

import { useSearchParams } from 'next/navigation';
import { AthleteSignUpForm, BrandSignUpForm } from '@/app/components/signup-forms';
import { Suspense } from 'react';
import { signUpAthlete, signUpBrand } from './actions';

function SignUpContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  const handleAthleteSubmit = async (data: any) => {
    const result = await signUpAthlete(data);

    if (result.error) {
      alert(result.error);
      return;
    }

    // Form will show success state automatically
    console.log('Athlete application submitted successfully');
  };

  const handleBrandSubmit = async (data: any) => {
    console.log('handleBrandSubmit called with data:', data);
    
    try {
      const result = await signUpBrand(data);
      console.log('signUpBrand result:', result);

      if (result.error) {
        console.error('Brand submission error:', result.error);
        alert(result.error);
        return;
      }

      // Form will show success state automatically
      console.log('Brand inquiry submitted successfully');
    } catch (error) {
      console.error('Unexpected error in handleBrandSubmit:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  if (role === 'brand') {
    return <BrandSignUpForm onSubmit={handleBrandSubmit} />;
  }

  // Default to athlete signup
  return <AthleteSignUpForm onSubmit={handleAthleteSubmit} />;
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}
