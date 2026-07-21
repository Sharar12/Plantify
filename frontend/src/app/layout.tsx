/* ==========================================================================
 * Root Layout
 * ==========================================================================
 * Serves as the HTML shell for every page with:
 *   - Inter font loading (100–700 weights)
 *   - Metadata + OpenGraph tags for SEO
 *   - Premium background system: base gradient, animated radials, mesh gradient
 *   - Ambient floating orbs (5 large blur elements with gentle float animation)
 *   - Premium particle system (15 small glowing particles floating upward)
 *   - Noise texture overlay for subtle depth
 *   - Grid overlay and vignette effects
 *   - Global fetch patch applied at startup for safe non-JSON API responses
 * ========================================================================== */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { applyFetchPatch } from '@/lib/fetch-patch';

// Apply global fetch patch to safely handle non-JSON API responses
if (typeof window !== 'undefined') {
  applyFetchPatch();
}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Plantify — Premium Botanical Collection",
  description: "Curated luxury plants and greenery for discerning spaces",
  keywords: "premium plants, luxury botanicals, indoor plants, plant shop",
  authors: [{ name: "Plantify" }],
  openGraph: {
    title: "Plantify — Premium Botanical Collection",
    description: "Curated luxury plants and greenery for discerning spaces",
    type: "website",
  },
};

// Premium particle system - fewer, more elegant particles
const premiumParticles = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  left: `${5 + Math.random() * 90}%`,
  animationDuration: `${20 + Math.random() * 15}s`,
  animationDelay: `${Math.random() * 20}s`,
  size: `${4 + Math.random() * 8}px`,
  driftDuration: `${15 + Math.random() * 10}s`,
  opacity: 0.3 + Math.random() * 0.4,
}));

// Ambient orbs - larger, subtler background elements
const ambientOrbs = Array.from({ length: 5 }).map((_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: `${300 + Math.random() * 400}px`,
  duration: `${25 + Math.random() * 20}s`,
  delay: `${Math.random() * 10}s`,
}));

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      
      <body className="min-h-full flex flex-col relative bg-white overflow-x-hidden font-[var(--font-inter)]">
        
        {/* ========== PREMIUM BACKGROUND SYSTEM ========== */}
        
        {/* Base gradient - Ultra subtle, white-dominant */}
        <div
          className="fixed inset-0 -z-50"
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, #fafafa 50%, #ffffff 100%)",
          }}
        />

        {/* Animated radial gradient overlay - Very subtle */}
        <div
          className="fixed inset-0 -z-40 opacity-40 animate-breathe"
          style={{
            background: `
              radial-gradient(ellipse at 20% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, rgba(16, 185, 129, 0.06) 0%, transparent 50%)
            `,
          }}
        />

        {/* Mesh gradient - Premium depth */}
        <div
          className="fixed inset-0 -z-30 opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(at 0% 0%, rgba(209, 250, 229, 0.4) 0px, transparent 50%),
              radial-gradient(at 50% 0%, rgba(255, 255, 255, 0.8) 0px, transparent 50%),
              radial-gradient(at 100% 0%, rgba(209, 250, 229, 0.3) 0px, transparent 50%),
              radial-gradient(at 0% 50%, rgba(255, 255, 255, 0.9) 0px, transparent 50%),
              radial-gradient(at 100% 50%, rgba(167, 243, 208, 0.3) 0px, transparent 50%),
              radial-gradient(at 0% 100%, rgba(209, 250, 229, 0.35) 0px, transparent 50%),
              radial-gradient(at 50% 100%, rgba(255, 255, 255, 0.85) 0px, transparent 50%),
              radial-gradient(at 100% 100%, rgba(209, 250, 229, 0.4) 0px, transparent 50%)
            `,
            backgroundSize: "100% 100%",
            filter: "blur(60px)",
          }}
        />

        {/* ========== AMBIENT ORBS ========== */}
        {ambientOrbs.map((orb) => (
          <div
            key={`orb-${orb.id}`}
            className="fixed -z-20 rounded-full pointer-events-none animate-float-gentle"
            style={{
              top: orb.top,
              left: orb.left,
              width: orb.size,
              height: orb.size,
              background: "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)",
              filter: "blur(40px)",
              animationDuration: orb.duration,
              animationDelay: orb.delay,
            }}
          />
        ))}

        {/* ========== PREMIUM PARTICLE SYSTEM ========== */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          {premiumParticles.map((particle) => (
            <div
              key={`particle-${particle.id}`}
              className="absolute animate-float-up animate-drift-gentle rounded-full"
              style={{
                left: particle.left,
                bottom: "-30px",
                width: particle.size,
                height: particle.size,
                opacity: particle.opacity,
                background: "radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, rgba(5, 150, 105, 0.3) 50%, transparent 70%)",
                boxShadow: `
                  0 0 ${parseInt(particle.size) * 2}px rgba(16, 185, 129, 0.4),
                  0 0 ${parseInt(particle.size) * 4}px rgba(5, 150, 105, 0.2)
                `,
                animationDuration: `${particle.animationDuration}, ${particle.driftDuration}`,
                animationDelay: `${particle.animationDelay}, 0s`,
                animationIterationCount: "infinite, infinite",
                animationTimingFunction: "ease-in-out, ease-in-out",
              }}
            />
          ))}
        </div>

        {/* ========== SUBTLE NOISE TEXTURE ========== */}
        <div
          className="fixed inset-0 -z-15 opacity-[0.015] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />

        {/* ========== PREMIUM GRID OVERLAY ========== */}
        <div
          className="fixed inset-0 -z-25 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* ========== VIGNETTE EFFECT ========== */}
        <div
          className="fixed inset-0 -z-5 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.02) 100%)",
          }}
        />

        {/* ========== PAGE CONTENT ========== */}
        <div className="relative z-10 flex flex-col min-h-full">
          {children}
        </div>
      </body>
    </html>
  );
}