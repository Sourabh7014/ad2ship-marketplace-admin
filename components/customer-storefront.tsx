"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  ShoppingBag,
  Search,
  X,
  Star,
  Mail,
  ArrowRight,


  Shield,
  Zap,
  TrendingUp,
  User,
  Heart,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Trash2,
  Lock,
  Globe,
  Tag,
  Truck,
  RotateCcw,
  BadgeCheck,
  Flame,
  ChevronLeft,
  ChevronRight,
  Menu,
  Phone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";


interface Product {
  id: number;
  name: string;
  category: "tech" | "fashion" | "home";
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  description: string;
  badge?: "hot" | "sale" | "new" | "bestseller";
  stock?: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const BRAND = {
  primary: "#FF6B35",
  primaryDark: "#E85520",
  primaryLight: "#FF8C5A",
  primaryGlow: "rgba(255, 107, 53, 0.18)",
  secondary: "#FFB347",
  secondaryGlow: "rgba(255, 179, 71, 0.15)",
  accent: "#1A1A2E",
  surface: "#16213E",
};

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Aura Watch Series X",
    category: "tech",
    price: 299.99,
    originalPrice: 399.99,
    rating: 4.8,
    reviewsCount: 142,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    description: "Next-gen holographic display smartwatch with real-time biometric tracking and seamless Ad2Ship sync.",
    badge: "hot",
    stock: 12,
  },
  {
    id: 2,
    name: "Cyber Street Sneakers",
    category: "fashion",
    price: 189.50,
    originalPrice: 249.00,
    rating: 4.9,
    reviewsCount: 88,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    description: "Ultra-comfy dynamic responsive sneakers designed with self-illuminating side meshes.",
    badge: "bestseller",
    stock: 5,
  },
  {
    id: 3,
    name: "Minimalist RFID Wallet",
    category: "fashion",
    price: 49.00,
    rating: 4.6,
    reviewsCount: 230,
    image: "https://images.unsplash.com/photo-1627124765135-56a64f434040?w=600&auto=format&fit=crop&q=80",
    description: "Grade-5 aerospace aluminum carbon-fiber shell blocks RFID wireless scanners perfectly.",
    badge: "new",
    stock: 40,
  },
  {
    id: 4,
    name: "Nebula Ambient Projector",
    category: "home",
    price: 89.99,
    originalPrice: 129.99,
    rating: 4.7,
    reviewsCount: 310,
    image: "https://images.unsplash.com/photo-1507646227500-4d389b0012be?w=600&auto=format&fit=crop&q=80",
    description: "Transform your living space with vibrant dynamic nebulas and sparkling realistic stars.",
    badge: "sale",
    stock: 18,
  },
  {
    id: 5,
    name: "Eco-Breeze Silent Fan",
    category: "home",
    price: 129.00,
    rating: 4.5,
    reviewsCount: 74,
    image: "https://images.unsplash.com/photo-1618944913480-b67ee16d7b77?w=600&auto=format&fit=crop&q=80",
    description: "Whisper-quiet brushless aerodynamic table fan with integrated active carbon air purifier filter.",
    stock: 22,
  },
  {
    id: 6,
    name: "Titanium ANC Earbuds",
    category: "tech",
    price: 159.99,
    originalPrice: 199.99,
    rating: 4.9,
    reviewsCount: 195,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
    description: "Dual-core digital adaptive active noise canceling earbuds with spatial cinematic audio.",
    badge: "hot",
    stock: 8,
  }
];

const FAQS = [
  {
    q: "What is Ad2Ship?",
    a: "Ad2Ship is an all-in-one D2C E-commerce platform that allows you to setup stunning, lightning-fast storefronts, manage products, view analytics, and automate shipping fulfillment in real-time."
  },
  {
    q: "How can I start as a Seller?",
    a: "Starting is simple! Click the 'Seller Portal' button in the navbar, create an account, choose your storefront theme design, upload your catalog, and start accepting global orders instantly."
  },
  {
    q: "Are the storefront themes fully customizable?",
    a: "Yes! Ad2Ship comes with a highly adaptive CSS variables-driven design engine. You can toggle colors, layout presets, headers, and styles instantly with a single click."
  },
  {
    q: "Is there a trial period available?",
    a: "Ad2Ship offers a 14-day fully featured free trial with no credit card required. You can build your store, integrate custom domains, and try the seller panel completely for free."
  },
  {
    q: "What payment methods are supported?",
    a: "We support all major payment gateways including Stripe, Razorpay, PayPal, and 50+ local payment methods worldwide. Secure PCI-DSS Level 1 compliant checkout is included."
  }
];

const TESTIMONIALS = [
  {
    quote: "We migrated our entire cosmetics line to Ad2Ship. Conversion rate jumped 24% in the first week, and page load speeds are virtually instant.",
    name: "Aria Montgomery",
    role: "CEO, Aura Cosmetics",
    initials: "AM",
    color: "#FF6B35",
  },
  {
    quote: "The customizer engine makes theme styling so easy. We switched from custom layouts to Ad2Ship's built-in components and saved months of developer salary.",
    name: "David Kross",
    role: "Founder, Carbon Street",
    color: "#FFB347",
    initials: "DK",
  },
  {
    quote: "Ad2Ship automated shipping combined with this frontend theme completely revolutionized our distribution. 10/10 developer work.",
    name: "Helena Love",
    role: "Product Manager, Nebula Gadgets",
    color: "#FF8C5A",
    initials: "HL",
  },
];

const TRUST_BADGES = [
  { icon: Truck, label: "Free Shipping", sub: "Orders over ₹999" },
  { icon: RotateCcw, label: "Easy Returns", sub: "30-day guarantee" },
  { icon: Shield, label: "Secure Payment", sub: "256-bit SSL" },
  { icon: BadgeCheck, label: "Authentic Products", sub: "100% original" },
];

const BANNER_SLIDES = [
  {
    tag: "🔥 Flash Sale — Up to 40% Off",
    headline: "Premium Tech & Fashion,\nDelivered at Light Speed",
    sub: "Experience India's fastest D2C storefront with real-time inventory and automated shipping.",
    cta: "Shop Now",
    ctaSecondary: "Start Selling",
    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80",
  },
  {
    tag: "⚡ New Arrivals Every Week",
    headline: "Handpicked Collections,\nCurated for You",
    sub: "Explore thousands of products from verified sellers across Fashion, Tech & Home categories.",
    cta: "View Collections",
    ctaSecondary: "Join Free",
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=80",
  },
  {
    tag: "🛡️ 30-Day Money Back Guarantee",
    headline: "Shop with Confidence,\nEvery Single Order",
    sub: "Backed by our buyer protection program. Full refund within 30 days, no questions asked.",
    cta: "Explore Catalog",
    ctaSecondary: "Learn More",
    img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=900&auto=format&fit=crop&q=80",
  },
];

function getBadgeConfig(badge?: string) {
  switch (badge) {
    case "hot": return { label: "🔥 Hot", bg: "#FF6B35", text: "#fff" };
    case "sale": return { label: "Sale", bg: "#22c55e", text: "#fff" };
    case "new": return { label: "New", bg: "#3b82f6", text: "#fff" };
    case "bestseller": return { label: "⭐ Bestseller", bg: "#FFB347", text: "#111" };
    default: return null;
  }
}

export default function CustomerStorefront() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "tech" | "fashion" | "home">("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [faqSearch, setFaqSearch] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [bannerSlide, setBannerSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const bannerTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    bannerTimer.current = setInterval(() => {
      setBannerSlide(s => (s + 1) % BANNER_SLIDES.length);
    }, 5000);
    return () => { if (bannerTimer.current) clearInterval(bannerTimer.current); };
  }, []);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) =>
      faq.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.a.toLowerCase().includes(faqSearch.toLowerCase())
    );
  }, [faqSearch]);

  const cartSubtotal = useMemo(() => cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0), [cart]);
  const cartTotalItems = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartSavings = useMemo(() => cart.reduce((acc, item) => acc + ((item.product.originalPrice ?? item.product.price) - item.product.price) * item.quantity, 0), [cart]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQty = (productId: number, change: number) => {
    setCart((prev) => prev.map((item) => item.product.id === productId ? { ...item, quantity: item.quantity + change } : item).filter((item) => item.quantity > 0));
  };

  const removeFromCart = (productId: number, productName: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    toast.error(`${productName} removed from cart.`);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
        toast.info(`Removed ${product.name} from wishlist`);
      } else {
        next.add(product.id);
        toast.success(`${product.name} added to wishlist! ❤️`);
      }
      return next;
    });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast.error("Please enter a valid email address!");
      return;
    }
    toast.success(`Subscribed! Check your inbox at ${newsletterEmail}`);
    setNewsletterEmail("");
  };

  const slide = BANNER_SLIDES[bannerSlide];
  const discountPct = (orig: number, cur: number) => Math.round((1 - cur / orig) * 100);

  return (
    <div
      className="min-h-screen text-zinc-100 flex flex-col font-sans"
      style={{ backgroundColor: "#0A0A0F" }}
    >
      {/* ── ANNOUNCEMENT BAR ── */}
      <div
        className="text-center py-2 text-xs font-semibold tracking-wide"
        style={{ background: `linear-gradient(90deg, ${BRAND.primaryDark}, ${BRAND.primary}, ${BRAND.secondary})`, color: "#fff" }}
      >
        🎉 Free shipping on orders above ₹999 &nbsp;|&nbsp; Use code <span className="font-black underline">SHIP10</span> for extra 10% off &nbsp;|&nbsp; 30-Day hassle-free returns
      </div>

      {/* ── HEADER ── */}
      <header
        className={`sticky top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? "shadow-2xl" : ""}`}
        style={{
          background: isScrolled
            ? "rgba(10,10,15,0.96)"
            : "#0D0D18",
          borderBottom: `1px solid rgba(255,107,53,0.15)`,
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Top nav row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`, boxShadow: `0 4px 16px ${BRAND.primaryGlow}` }}
            >
              <Image src="/logo.webp" alt="Logo" width={22} height={22} className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white">Ad2Ship</span>
              <span className="text-[9px] uppercase tracking-widest font-semibold leading-none" style={{ color: BRAND.primary }}>D2C Commerce</span>
            </div>
          </Link>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-6 relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
              <Search className="w-4 h-4 text-zinc-500" />
            </div>
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border text-zinc-200 focus:outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                borderColor: searchQuery ? BRAND.primary : "rgba(255,255,255,0.08)",
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl border transition-all"
              style={{ background: "rgba(255,107,53,0.1)", borderColor: "rgba(255,107,53,0.25)" }}
            >
              <ShoppingBag className="w-5 h-5" style={{ color: BRAND.primary }} />
              {cartTotalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-white animate-bounce"
                  style={{ background: BRAND.primaryDark }}
                >
                  {cartTotalItems}
                </span>
              )}
            </button>

            <div className="hidden lg:flex items-center space-x-2">
              <Link
                href="/seller/auth/login"
                className="text-xs font-semibold px-3 py-2 rounded-xl text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                <User className="w-3.5 h-3.5" /> Seller
              </Link>
              <Link
                href="/admin/auth/login"
                className="text-xs font-bold px-4 py-2 rounded-xl text-white transition-all flex items-center gap-1.5"
                style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})`, boxShadow: `0 4px 12px ${BRAND.primaryGlow}` }}
              >
                <Lock className="w-3.5 h-3.5" /> Admin
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Nav */}
        <div className="border-t max-w-full overflow-x-auto" style={{ borderColor: "rgba(255,107,53,0.1)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 py-1.5">
            {[
              { label: "All Products", value: "all" },
              { label: "⚡ Tech & Electronics", value: "tech" },
              { label: "👗 Fashion & Style", value: "fashion" },
              { label: "🏠 Home & Living", value: "home" },
            ].map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value as "all" | "tech" | "fashion" | "home")}
                className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all"
                style={{
                  background: selectedCategory === cat.value ? `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})` : "transparent",
                  color: selectedCategory === cat.value ? "#fff" : "#71717a",
                  boxShadow: selectedCategory === cat.value ? `0 2px 8px ${BRAND.primaryGlow}` : "none",
                }}
              >
                {cat.label}
              </button>
            ))}

            <div className="ml-auto hidden md:flex items-center gap-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> 1800-AD2SHIP</span>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t px-4 py-3 space-y-2" style={{ background: "#0D0D18", borderColor: "rgba(255,107,53,0.1)" }}>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <Link href="/seller/auth/login" className="flex-1 text-center text-xs font-semibold py-2 rounded-lg bg-zinc-800 text-zinc-300">Seller Login</Link>
              <Link href="/admin/auth/login" className="flex-1 text-center text-xs font-bold py-2 rounded-lg text-white" style={{ background: BRAND.primary }}>Admin Login</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO BANNER SLIDER ── */}
      <section className="relative overflow-hidden" style={{ minHeight: "520px", background: "#0D0D18" }}>
        {/* BG image */}
        <div className="absolute inset-0 z-0">
          <img
            key={bannerSlide}
            src={slide.img}
            alt="banner"
            className="w-full h-full object-cover opacity-15 transition-opacity duration-700"
          />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(120deg, #0D0D18 50%, rgba(255,107,53,0.08) 100%)` }}
          />
        </div>

        {/* Glowing orbs */}
        <div className="absolute top-[-10%] right-[10%] w-[40%] h-[70%] rounded-full filter blur-[120px] pointer-events-none"
          style={{ background: `radial-gradient(circle, ${BRAND.primaryGlow} 0%, transparent 70%)` }} />
        <div className="absolute bottom-[-10%] left-[5%] w-[25%] h-[50%] rounded-full filter blur-[100px] pointer-events-none"
          style={{ background: `radial-gradient(circle, ${BRAND.secondaryGlow} 0%, transparent 70%)` }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col lg:flex-row items-center gap-12">
          {/* Text */}
          <div className="flex-1 text-left">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-5"
              style={{ background: `${BRAND.primaryGlow}`, border: `1px solid rgba(255,107,53,0.3)`, color: BRAND.primaryLight }}
            >
              <Flame className="w-3.5 h-3.5" />
              {slide.tag}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-5" style={{ letterSpacing: "-0.02em" }}>
              {slide.headline.split("\n").map((line, i) => (
                <span key={i}>
                  {i === 1 ? (
                    <span
                      className="bg-clip-text text-transparent"
                      style={{ backgroundImage: `linear-gradient(90deg, ${BRAND.primary}, ${BRAND.secondary})` }}
                    >
                      {line}
                    </span>
                  ) : (
                    line
                  )}
                  {i === 0 && <br />}
                </span>
              ))}
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mb-8 leading-relaxed">{slide.sub}</p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#storefront"
                className="px-7 py-3.5 rounded-xl font-black text-sm tracking-wide text-white transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})`,
                  boxShadow: `0 12px 32px -8px ${BRAND.primaryGlow}`,
                }}
              >
                {slide.cta} <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/seller/auth/login"
                className="px-7 py-3.5 rounded-xl font-bold text-sm tracking-wide border text-zinc-200 hover:text-white transition-all flex items-center justify-center gap-2"
                style={{ borderColor: "rgba(255,107,53,0.3)", background: "rgba(255,107,53,0.05)" }}
              >
                {slide.ctaSecondary}
              </Link>
            </div>

            {/* Slide dots */}
            <div className="flex items-center gap-2 mt-8">
              {BANNER_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setBannerSlide(i)}
                  className="rounded-full transition-all"
                  style={{
                    width: i === bannerSlide ? "28px" : "8px",
                    height: "8px",
                    background: i === bannerSlide ? BRAND.primary : "rgba(255,255,255,0.2)",
                  }}
                />
              ))}
              <button onClick={() => setBannerSlide(s => (s - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length)} className="ml-2 p-1.5 rounded-lg border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setBannerSlide(s => (s + 1) % BANNER_SLIDES.length)} className="p-1.5 rounded-lg border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Featured card (hero product preview) */}
          <div className="w-full lg:w-80 shrink-0">
            <div
              className="rounded-2xl p-5 relative overflow-hidden group"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,107,53,0.2)", backdropFilter: "blur(12px)" }}
            >
              <div
                className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-lg text-[10px] font-black z-10"
                style={{ background: BRAND.primary, color: "#fff" }}
              >
                🔥 Limited Stock — 8 Left
              </div>
              <div className="h-52 w-full rounded-xl overflow-hidden mb-4 bg-zinc-900">
                <img
                  src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80"
                  alt="earbuds"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-[10px] text-zinc-500 ml-1">(195 reviews)</span>
              </div>
              <h4 className="text-sm font-bold text-white mb-0.5">Titanium ANC Earbuds</h4>
              <p className="text-xs text-zinc-400 mb-3 line-clamp-2">Dual-core adaptive noise canceling with spatial audio.</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-base font-black text-white">$159.99</span>
                  <span className="ml-1.5 text-xs line-through text-zinc-500">$199.99</span>
                  <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style={{ background: "#22c55e" }}>20% OFF</span>
                </div>
                <button
                  onClick={() => addToCart(PRODUCTS[5])}
                  className="px-3.5 py-2 rounded-xl text-xs font-black transition-all active:scale-95 text-white"
                  style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})` }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section style={{ background: "#111118", borderTop: "1px solid rgba(255,107,53,0.1)", borderBottom: "1px solid rgba(255,107,53,0.1)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRUST_BADGES.map((badge) => (
            <div key={badge.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${BRAND.primaryGlow}` }}>
                <badge.icon className="w-5 h-5" style={{ color: BRAND.primary }} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{badge.label}</p>
                <p className="text-[10px] text-zinc-500">{badge.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRODUCTS SECTION ── */}
      <section id="storefront" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 rounded-full" style={{ background: BRAND.primary }} />
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: BRAND.primary }}>Live Catalog</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Featured Products</h2>
            <p className="text-zinc-400 text-sm mt-2">
              {filteredProducts.length} products {selectedCategory !== "all" ? `in ${selectedCategory}` : "available"}
            </p>
          </div>

          <div className="relative w-full sm:w-64 md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border text-zinc-200 focus:outline-none transition-all"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => {
              const badgeCfg = getBadgeConfig(product.badge);
              const isInWishlist = wishlist.has(product.id);
              const isLowStock = (product.stock ?? 99) <= 10;

              return (
                <div
                  key={product.id}
                  className="flex flex-col rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,107,53,0.25)";
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,107,53,0.1)`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
                  }}
                >
                  {/* Image */}
                  <div className="relative h-56 w-full overflow-hidden bg-zinc-900">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Badge */}
                    {badgeCfg && (
                      <span
                        className="absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg"
                        style={{ background: badgeCfg.bg, color: badgeCfg.text }}
                      >
                        {badgeCfg.label}
                      </span>
                    )}
                    {/* Discount badge */}
                    {product.originalPrice && (
                      <span className="absolute top-3 right-3 text-[10px] font-black px-2 py-1 rounded-lg text-white" style={{ background: "#16a34a" }}>
                        -{discountPct(product.originalPrice, product.price)}%
                      </span>
                    )}
                    {/* Wishlist */}
                    <button
                      onClick={() => toggleWishlist(product)}
                      className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                      style={{
                        background: isInWishlist ? "rgba(239,68,68,0.15)" : "rgba(0,0,0,0.5)",
                        border: `1px solid ${isInWishlist ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}`,
                      }}
                    >
                      <Heart className={`w-4 h-4 transition-colors ${isInWishlist ? "fill-red-500 text-red-500" : "text-zinc-400"}`} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded"
                        style={{ background: "rgba(255,107,53,0.1)", color: BRAND.primary }}
                      >
                        {product.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-zinc-300">{product.rating}</span>
                        <span className="text-[10px] text-zinc-600">({product.reviewsCount})</span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-1 group-hover:text-orange-100 transition-colors line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-zinc-500 mb-3 line-clamp-2 leading-relaxed flex-1">{product.description}</p>

                    {/* Stock warning */}
                    {isLowStock && product.stock && (
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <div className="flex-1 h-1 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${(product.stock / 20) * 100}%`, background: product.stock <= 5 ? "#ef4444" : BRAND.secondary }}
                          />
                        </div>
                        <span className="text-[9px] font-bold text-amber-400">Only {product.stock} left!</span>
                      </div>
                    )}

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      <div>
                        <span className="text-lg font-black text-white">${product.price.toFixed(2)}</span>
                        {product.originalPrice && (
                          <span className="ml-1.5 text-xs line-through text-zinc-600">${product.originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white transition-all active:scale-95 hover:-translate-y-0.5"
                        style={{
                          background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})`,
                          boxShadow: `0 4px 12px ${BRAND.primaryGlow}`,
                        }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="rounded-2xl p-16 text-center"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <ShoppingBag className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h4 className="text-base font-bold text-white mb-1">No products found</h4>
            <p className="text-xs text-zinc-500">Try adjusting your search or category filter.</p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
              className="mt-4 px-5 py-2 rounded-xl text-xs font-bold text-white transition-all"
              style={{ background: BRAND.primary }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* ── PROMOTIONAL BANNER ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div
          className="rounded-2xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
          style={{
            background: `linear-gradient(135deg, #1A0A00 0%, #2D1000 50%, #1A0A00 100%)`,
            border: `1px solid rgba(255,107,53,0.3)`,
            boxShadow: `0 0 60px rgba(255,107,53,0.08)`,
          }}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full filter blur-3xl pointer-events-none"
            style={{ background: `radial-gradient(circle, ${BRAND.primaryGlow} 0%, transparent 70%)` }}
          />
          <div className="relative z-10">
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: BRAND.primary }}>Limited Time</span>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1 mb-2">Flat 40% OFF on All Tech</h3>
            <p className="text-sm text-zinc-400">Use code <span className="font-black px-2 py-0.5 rounded mx-1" style={{ background: BRAND.primaryGlow, color: BRAND.primaryLight }}>TECH40</span> at checkout. Valid till midnight.</p>
          </div>
          <a
            href="#storefront"
            className="relative z-10 px-8 py-3.5 rounded-xl font-black text-sm text-white whitespace-nowrap flex items-center gap-2 transition-all hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})`,
              boxShadow: `0 8px 24px ${BRAND.primaryGlow}`,
            }}
          >
            <Tag className="w-4 h-4" /> Claim Offer
          </a>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" style={{ background: "#0D0D18", borderTop: "1px solid rgba(255,107,53,0.08)" }} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-8 h-px" style={{ background: BRAND.primary }} />
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: BRAND.primary }}>Why Ad2Ship</span>
              <div className="w-8 h-px" style={{ background: BRAND.primary }} />
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-4">
              Built for High-Volume E-Commerce
            </h2>
            <p className="text-zinc-400 text-sm">The default storefront is engineered to scale from day one — fast, secure, and beautiful.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Zap, title: "Unrivaled Performance", desc: "Sub-millisecond pages with Next.js ISR and incremental hydration. Scores 100/100 on Lighthouse." },
              { icon: Shield, title: "Secure Checkouts", desc: "PCI-DSS Level 1 compliant checkout with Stripe, Razorpay, PayPal support built in." },
              { icon: Globe, title: "Auto Shipping Sync", desc: "Generates labels, tracks packages, and schedules carrier handovers automatically through Ad2Ship." },
              { icon: TrendingUp, title: "Smart Analytics", desc: "Built-in conversion tracking, abandoned cart recovery, heatmaps, and revenue insights." },
            ].map((f, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 transition-all hover:-translate-y-1 group"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,107,53,0.2)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)"; }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${BRAND.primaryGlow}` }}
                >
                  <f.icon className="w-6 h-6" style={{ color: BRAND.primary }} />
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{f.title}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-px" style={{ background: BRAND.primary }} />
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: BRAND.primary }}>Testimonials</span>
            <div className="w-8 h-px" style={{ background: BRAND.primary }} />
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">Loved by 10,000+ Brands</h2>
          <div className="flex items-center justify-center gap-1 mt-3">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            <span className="text-xs text-zinc-400 ml-2">4.9 average from 2,800+ reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 flex flex-col justify-between"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div>
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-zinc-300 italic leading-relaxed mb-6">"{t.quote}"</p>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                  style={{ background: `${t.color}22`, color: t.color, border: `1px solid ${t.color}33` }}
                >
                  {t.initials}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">{t.name}</h5>
                  <p className="text-[10px] text-zinc-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section id="faqs" style={{ background: "#0D0D18", borderTop: "1px solid rgba(255,107,53,0.08)" }} className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-8 h-px" style={{ background: BRAND.primary }} />
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: BRAND.primary }}>FAQs</span>
              <div className="w-8 h-px" style={{ background: BRAND.primary }} />
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6">Got questions? We've got answers.</p>

            <div className="relative max-w-sm mx-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border text-zinc-200 focus:outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
              />
            </div>
          </div>

          {filteredFaqs.length > 0 ? (
            <div className="space-y-3">
              {filteredFaqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-xl overflow-hidden transition-all"
                  style={{
                    background: expandedFaq === idx ? "rgba(255,107,53,0.06)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${expandedFaq === idx ? "rgba(255,107,53,0.25)" : "rgba(255,255,255,0.07)"}`,
                  }}
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full px-5 py-4 text-left font-semibold text-sm text-white flex items-center justify-between focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    {expandedFaq === idx ? (
                      <ChevronUp className="w-4 h-4 shrink-0" style={{ color: BRAND.primary }} />
                    ) : (
                      <ChevronDown className="w-4 h-4 shrink-0 text-zinc-500" />
                    )}
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-5 pb-4 text-sm text-zinc-400 border-t pt-3 leading-relaxed" style={{ borderColor: "rgba(255,107,53,0.15)" }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-xs text-center">No FAQs found matching your query.</p>
          )}
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, #1A0800 0%, #220E00 50%, #1A0800 100%)`,
            border: `1px solid rgba(255,107,53,0.25)`,
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 50% -20%, rgba(255,107,53,0.15) 0%, transparent 60%)` }}
          />
          <div className="relative z-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})`, boxShadow: `0 8px 24px ${BRAND.primaryGlow}` }}
            >
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white mb-2">Stay in the Loop</h2>
            <p className="text-sm text-zinc-400 max-w-md mx-auto mb-8 leading-relaxed">
              Get exclusive deals, new arrivals, and platform updates delivered straight to your inbox.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl text-sm text-zinc-200 focus:outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
              <button
                type="submit"
                className="px-7 py-3 rounded-xl text-sm font-black text-white whitespace-nowrap transition-all hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})`, boxShadow: `0 8px 20px ${BRAND.primaryGlow}` }}
              >
                Subscribe
              </button>
            </form>
            <p className="text-[10px] text-zinc-600 mt-4">No spam. Unsubscribe at any time. We respect your privacy.</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#080810", borderTop: "1px solid rgba(255,107,53,0.1)" }} className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` }}
              >
                <Image src="/logo.webp" alt="Logo" width={22} height={22} className="object-contain" />
              </div>
              <span className="text-lg font-black text-white">Ad2Ship</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
              India's fastest growing D2C ecommerce platform with automated shipping, real-time analytics, and premium storefronts.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <BadgeCheck className="w-3.5 h-3.5" style={{ color: BRAND.primary }} />
              Trusted by 10,000+ sellers
            </div>
          </div>

          <div>
            <h5 className="text-xs uppercase font-black tracking-wider text-white mb-4">Quick Access</h5>
            <ul className="space-y-2.5 text-xs text-zinc-500">
              <li><Link href="/seller/auth/login" className="hover:text-white transition-colors flex items-center gap-2"><User className="w-3.5 h-3.5" />Seller Dashboard</Link></li>
              <li><Link href="/admin/auth/login" className="hover:text-white transition-colors flex items-center gap-2"><Lock className="w-3.5 h-3.5" />Admin Panel</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs uppercase font-black tracking-wider text-white mb-4">Explore</h5>
            <ul className="space-y-2.5 text-xs text-zinc-500">
              <li><a href="#storefront" className="hover:text-white transition-colors">Product Catalog</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Platform Features</a></li>
              <li><a href="#faqs" className="hover:text-white transition-colors">FAQs & Support</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs uppercase font-black tracking-wider text-white mb-4">Contact Us</h5>
            <ul className="space-y-2.5 text-xs text-zinc-500">
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />1800-AD2SHIP (Toll Free)</li>
              <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />support@ad2ship.com</li>
              <li className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" />www.ad2ship.com</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 gap-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p>© {new Date().getFullYear()} Ad2Ship Commerce. All rights reserved.</p>
          <div className="flex gap-5">
            <span className="hover:text-zinc-400 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-zinc-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-zinc-400 cursor-pointer transition-colors">Cookie Policy</span>
          </div>
        </div>
      </footer>

      {/* ── CART DRAWER ── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />
          <div
            className="relative w-full max-w-md h-full flex flex-col shadow-2xl z-10"
            style={{ background: "#0D0D18", borderLeft: `1px solid rgba(255,107,53,0.2)` }}
          >
            {/* Cart Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,107,53,0.15)" }}>
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5" style={{ color: BRAND.primary }} />
                <h3 className="text-base font-black text-white">Your Cart</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full text-zinc-400" style={{ background: "rgba(255,255,255,0.07)" }}>
                  {cartTotalItems} items
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3.5 p-3.5 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-900 shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{item.product.name}</h4>
                      <p className="text-[10px] uppercase text-zinc-600 font-bold tracking-wider mb-2">{item.product.category}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center rounded-lg overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                          <button onClick={() => updateCartQty(item.product.id, -1)} className="px-2 py-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-bold text-white border-x" style={{ borderColor: "rgba(255,255,255,0.1)" }}>{item.quantity}</span>
                          <button onClick={() => updateCartQty(item.product.id, 1)} className="px-2 py-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.product.id, item.product.name)} className="p-1 text-zinc-600 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-white">${(item.product.price * item.quantity).toFixed(2)}</p>
                      {item.product.originalPrice && (
                        <p className="text-[10px] text-zinc-600 line-through">${(item.product.originalPrice * item.quantity).toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <ShoppingBag className="w-14 h-14 text-zinc-800 mb-4" />
                  <p className="text-sm font-bold text-zinc-400 mb-1">Your cart is empty</p>
                  <p className="text-xs text-zinc-600 max-w-xs">Browse the catalog and add products you love!</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-6 px-5 py-2.5 rounded-xl text-xs font-black text-white"
                    style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})` }}
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="px-6 py-5 border-t" style={{ borderColor: "rgba(255,107,53,0.15)" }}>
                {cartSavings > 0 && (
                  <div className="flex items-center justify-between text-xs mb-3 px-3 py-2 rounded-lg" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                    <span className="text-green-400 font-semibold">🎉 You're saving</span>
                    <span className="text-green-400 font-black">${cartSavings.toFixed(2)}</span>
                  </div>
                )}
                <div className="space-y-2 mb-4 text-xs text-zinc-500">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-zinc-300">${cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-400 font-bold">FREE</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm font-black text-white mb-5 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                  <span>Total</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => {
                    toast.success("Order placed! Processing Ad2Ship fulfillment...");
                    setCart([]);
                    setIsCartOpen(false);
                  }}
                  className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})`,
                    boxShadow: `0 8px 24px ${BRAND.primaryGlow}`,
                  }}
                >
                  <Lock className="w-4 h-4" />
                  Secure Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
