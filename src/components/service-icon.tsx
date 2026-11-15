import {
  Building2,
  Cable,
  Cctv,
  HardDrive,
  Network,
  Phone,
  RadioTower,
  Server,
  Shield,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { IconKey } from "@/lib/content";

const icons: Record<IconKey, LucideIcon> = {
  tower: RadioTower,
  fiber: Cable,
  net: Network,
  cam: Cctv,
  bolt: Zap,
  phone: Phone,
  building: Building2,
  wrench: Wrench,
  disk: HardDrive,
  shield: Shield,
  server: Server,
};

export function ServiceIcon({ name, className }: { name: IconKey; className?: string }) {
  const Icon = icons[name];
  return <Icon className={className} strokeWidth={1.5} aria-hidden="true" />;
}
