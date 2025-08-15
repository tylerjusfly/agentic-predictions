import NavHeader from "@/components/landing/NavHeader";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <NavHeader />
      {children}
    </div>
  );
}
