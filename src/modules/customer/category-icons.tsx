import {
  Pill,
  Syringe,
  Citrus,
  Thermometer,
  HeartPulse,
  Baby,
  Eye,
  Stethoscope,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  "og'riq qoldiruvchi": Pill,
  antibiotik: Syringe,
  vitamin: Citrus,
  sovuqotish: Thermometer,
  "yurak-qon tomir": HeartPulse,
  bolalar: Baby,
  "ko'z tomchilari": Eye,
};

export function getCategoryIcon(name: string): LucideIcon {
  return ICON_MAP[name.toLowerCase()] ?? Stethoscope;
}

export { Sparkles as AIIcon };
