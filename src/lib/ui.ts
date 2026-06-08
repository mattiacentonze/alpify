import { Bike, Building2, Castle, Hotel, Landmark, MapPinned, Mountain, Trees, Waves } from "lucide-react";
import type { CrowdingLevel } from "../types";

export const categoryIcon = {
  Castle,
  Lake: Waves,
  Trail: Trees,
  Museum: Landmark,
  Viewpoint: Mountain,
  Nature: Trees,
  Village: Building2,
  "Partner Hotel": Hotel,
  "Bike Rental": Bike,
} as const;

export function crowdingClass(level: CrowdingLevel) {
  if (level === "Low") return "bg-fresh/15 text-alpine border-fresh/30";
  if (level === "Medium") return "bg-reward/20 text-amber-700 border-reward/40";
  return "bg-rose-100 text-rose-700 border-rose-200";
}

export function markerColor(level: CrowdingLevel) {
  if (level === "Low") return "#58CC02";
  if (level === "Medium") return "#FFC857";
  return "#EF4444";
}

export function iconForCategory(category: string) {
  return categoryIcon[category as keyof typeof categoryIcon] ?? MapPinned;
}
