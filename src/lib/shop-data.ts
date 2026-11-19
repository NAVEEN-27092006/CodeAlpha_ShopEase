import phone from "@/assets/products/phone-blue.jpg";
import headphones from "@/assets/products/headphones.jpg";
import laptop from "@/assets/products/laptop.jpg";
import smartwatch from "@/assets/products/smartwatch.jpg";
import sneakers from "@/assets/products/sneakers.jpg";
import denim from "@/assets/products/denim-jacket.jpg";
import kurta from "@/assets/products/kurta.jpg";
import kettle from "@/assets/products/kettle.jpg";
import mixer from "@/assets/products/mixer.jpg";
import sofa from "@/assets/products/sofa.jpg";
import skincare from "@/assets/products/skincare.jpg";
import books from "@/assets/products/books.jpg";

import type { Category, Product } from "./shop-types";

export const CATEGORIES: Category[] = [
  { slug: "mobiles", name: "Mobiles" },
  { slug: "electronics", name: "Electronics" },
  { slug: "fashion", name: "Fashion" },
  { slug: "home", name: "Home & Furniture" },
  { slug: "appliances", name: "Appliances" },
  { slug: "beauty", name: "Beauty" },
  { slug: "books", name: "Books" },
];

export function categoryName(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

export const PRODUCT_IMAGES: { label: string; src: string }[] = [
  { label: "Smartphone", src: phone },
  { label: "Headphones", src: headphones },
  { label: "Laptop", src: laptop },
  { label: "Smartwatch", src: smartwatch },
  { label: "Sneakers", src: sneakers },
  { label: "Denim jacket", src: denim },
  { label: "Kurta", src: kurta },
  { label: "Kettle", src: kettle },
  { label: "Mixer grinder", src: mixer },
  { label: "Sofa", src: sofa },
  { label: "Skincare", src: skincare },
  { label: "Books", src: books },
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Nova X5 5G (Midnight Blue, 128 GB)",
    brand: "Nova",
    category: "mobiles",
    price: 18999,
    mrp: 24999,
    rating: 4.4,
    reviews: 12840,
    image: phone,
    description:
      'A sleek 5G smartphone with a 6.7" AMOLED display, 50 MP triple camera and an all-day 5000 mAh battery.',
    highlights: [
      "8 GB RAM | 128 GB ROM",
      "6.7 inch FHD+ AMOLED",
      "50MP + 8MP + 2MP camera",
      "5000 mAh battery",
    ],
    stock: 42,
  },
  {
    id: "p2",
    name: "SoundMax Pro Wireless ANC Headphones",
    brand: "SoundMax",
    category: "electronics",
    price: 3499,
    mrp: 7999,
    rating: 4.3,
    reviews: 8421,
    image: headphones,
    description:
      "Over-ear headphones with active noise cancellation, deep bass and up to 40 hours of playback.",
    highlights: ["Active Noise Cancellation", "40 hours battery", "Bluetooth 5.3", "Fast charging"],
    stock: 65,
  },
  {
    id: "p3",
    name: "AeroBook 14 Thin & Light Laptop (16 GB/512 GB SSD)",
    brand: "AeroBook",
    category: "electronics",
    price: 54990,
    mrp: 69990,
    rating: 4.5,
    reviews: 2310,
    image: laptop,
    description:
      'An ultra-portable aluminium laptop with a vivid 14" display, fast SSD and a full-day battery.',
    highlights: [
      "Intel Core i5 13th Gen",
      "16 GB RAM | 512 GB SSD",
      "14 inch 2.2K display",
      "1.3 kg weight",
    ],
    stock: 18,
  },
  {
    id: "p4",
    name: "FitPulse Smartwatch with AMOLED Display",
    brand: "FitPulse",
    category: "electronics",
    price: 2999,
    mrp: 6999,
    rating: 4.1,
    reviews: 15420,
    image: smartwatch,
    description:
      'Track steps, heart rate, sleep and 100+ sports modes with a bright 1.8" AMOLED screen.',
    highlights: ["1.8 inch AMOLED", "Heart rate & SpO2", "Bluetooth calling", "7 days battery"],
    stock: 120,
  },
  {
    id: "p5",
    name: "StrideRun Men's Running Shoes",
    brand: "StrideRun",
    category: "fashion",
    price: 1799,
    mrp: 3999,
    rating: 4.2,
    reviews: 5230,
    image: sneakers,
    description: "Breathable mesh running shoes with cushioned soles for everyday comfort.",
    highlights: ["Breathable mesh upper", "Cushioned EVA sole", "Lightweight", "Sizes 6–11"],
    stock: 80,
  },
  {
    id: "p6",
    name: "Classic Men's Denim Jacket",
    brand: "Denim Co.",
    category: "fashion",
    price: 1499,
    mrp: 2999,
    rating: 4.0,
    reviews: 1980,
    image: denim,
    description: "A timeless mid-wash denim jacket with button front and chest pockets.",
    highlights: ["100% cotton denim", "Regular fit", "Button closure", "Machine wash"],
    stock: 55,
  },
  {
    id: "p7",
    name: "Women's Floral Printed Cotton Kurta",
    brand: "Indivya",
    category: "fashion",
    price: 899,
    mrp: 1999,
    rating: 4.3,
    reviews: 7340,
    image: kurta,
    description: "A breezy straight-cut cotton kurta with block-print florals in teal and white.",
    highlights: ["Pure cotton", "Straight fit", "3/4 sleeves", "Sizes XS–XXL"],
    stock: 95,
  },
  {
    id: "p8",
    name: "SteelBrew 1.7 L Electric Kettle",
    brand: "SteelBrew",
    category: "appliances",
    price: 1099,
    mrp: 1999,
    rating: 4.2,
    reviews: 9810,
    image: kettle,
    description: "Fast-boil stainless steel kettle with auto shut-off and a cool-touch handle.",
    highlights: ["1.7 L capacity", "1500 W fast boil", "Auto shut-off", "1 year warranty"],
    stock: 70,
  },
  {
    id: "p9",
    name: "Iconic 750 W Mixer Grinder (3 Jars)",
    brand: "Preethi",
    category: "appliances",
    price: 2799,
    mrp: 4499,
    rating: 4.4,
    reviews: 6120,
    image: mixer,
    description:
      "A powerful 750 W mixer grinder with three stainless steel jars for every kitchen task.",
    highlights: ["750 W motor", "3 stainless steel jars", "3 speed + pulse", "2 years warranty"],
    stock: 34,
  },
  {
    id: "p10",
    name: "CloudNest 2-Seater Fabric Sofa",
    brand: "CloudNest",
    category: "home",
    price: 15999,
    mrp: 27999,
    rating: 4.1,
    reviews: 640,
    image: sofa,
    description: "A soft grey two-seater sofa with plush cushions and solid wooden legs.",
    highlights: ["Premium fabric", "Solid wood legs", "Includes 2 cushions", "Free installation"],
    stock: 9,
  },
  {
    id: "p11",
    name: "Lumora Daily Glow Skincare Set",
    brand: "Lumora",
    category: "beauty",
    price: 1299,
    mrp: 2199,
    rating: 4.5,
    reviews: 3410,
    image: skincare,
    description: "Face wash, hydrating serum and moisturizer — a gentle three-step routine.",
    highlights: [
      "Hyaluronic acid serum",
      "Ceramide moisturizer",
      "Gentle face wash",
      "All skin types",
    ],
    stock: 60,
  },
  {
    id: "p12",
    name: "Bestseller Fiction Combo (Set of 3)",
    brand: "ReadMore",
    category: "books",
    price: 699,
    mrp: 1197,
    rating: 4.6,
    reviews: 2280,
    image: books,
    description: "Three bestselling hardcover novels — perfect for gifting or weekend reading.",
    highlights: ["3 hardcover books", "English", "Gift ready", "Bestseller titles"],
    stock: 150,
  },
];
