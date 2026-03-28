import Navbar from "@/app/components/navbar/navbar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="px-2 pb-8 md:px-4">{children}</main>
    </div>
  );
}
