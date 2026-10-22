import { redirect } from 'next/navigation'

// Meals are logged straight from the Meals page now (QuickMealLog); keep old links working.
export default function NewMealPage() {
  redirect('/meals')
}
