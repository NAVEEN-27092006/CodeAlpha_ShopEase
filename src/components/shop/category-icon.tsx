import { BookOpen, Laptop, Refrigerator, Shirt, Smartphone, Sofa, Sparkles, Tag, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  mobiles: Smartphone,
  electronics: Laptop,
  fashion: Shirt,
  home: Sofa,
  appliances: Refrigerator,
  beauty: Sparkles,
  books: BookOpen,
};

export function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = ICONS[slug] ?? Tag;
  return <Icon className={className} />;
}
