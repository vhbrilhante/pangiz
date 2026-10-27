import { Gate } from "@/components/Gate";
import { BottomNav } from "@/components/visuals";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Gate>
      {children}
      <BottomNav />
    </Gate>
  );
}
