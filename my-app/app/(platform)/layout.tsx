export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#141115]">{children}</main>
  );
}
