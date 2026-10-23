import { LogoSpinner } from "@/app/components/ui/logo-spinner";

export default function PlatformLoading() {
  return (
    <div className="min-h-screen bg-[#141115] flex items-center justify-center">
      <LogoSpinner size={64} />
    </div>
  );
}
