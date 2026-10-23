import { redirect } from '@/i18n/redirect'
// Meals are logged straight from the Meals page now (QuickMealLog); keep old links working.
export default async function NewMealPage() {
  return await redirect('/meals')
}
