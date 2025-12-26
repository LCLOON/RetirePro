# RetirePro Web Performance Audit Report

**Date:** December 26, 2025  
**Auditor:** Web Performance Engineering Team  
**Site:** https://retirepro.io  
**Framework:** Next.js 16.1.0 with React 19.2.3 + Turbopack  
**Focus:** Core Web Vitals, User Experience, SEO, Conversion Optimization

---

## 1. Executive Summary

### Overall Performance Assessment

| Metric | Estimated Score | Status |
|--------|----------------|--------|
| **Lighthouse Performance** | 65-75 | 🟡 Needs Improvement |
| **LCP (Largest Contentful Paint)** | ~2.8-3.5s | 🟡 Needs Improvement |
| **INP (Interaction to Next Paint)** | ~150-200ms | 🟢 Good |
| **CLS (Cumulative Layout Shift)** | ~0.05-0.08 | 🟢 Good |

### Key Findings

**🔴 Critical Issues (3):**
1. **Hero image is 2.27MB** - Severely impacts LCP on landing page
2. **Recharts bundle is ~889KB** - Largest JavaScript chunk, loads for all dashboard users
3. **No dynamic imports** for heavy components - All tabs load eagerly

**🟡 Moderate Issues (4):**
1. Landing page is client-rendered (`'use client'`) - Impacts initial paint
2. Monte Carlo simulation runs synchronously on main thread (1000 iterations)
3. No service worker or offline caching strategy
4. Missing `loading="lazy"` on below-fold images

**🟢 Strengths:**
- ✅ Next.js 16 with Turbopack for fast builds
- ✅ Google Fonts with proper `preconnect` headers
- ✅ Good security headers (CSP, HSTS, X-Frame-Options)
- ✅ Static generation for `/landing`, `/app`, `/terms`, `/privacy`
- ✅ Theme initialization script prevents FOUC
- ✅ Proper JSON-LD structured data for SEO
- ✅ Well-optimized inputs with debouncing patterns

### Launch Recommendation

**🟡 CONDITIONAL APPROVAL**

The site is functional and provides good user experience once loaded. However, **LCP will likely fail Core Web Vitals thresholds** on first meaningful paint, impacting:
- Google Search rankings (CWV is a ranking factor)
- Mobile user experience (3G/4G networks)
- Conversion rates (53% of mobile users abandon sites that take >3s to load)

**Priority fixes before launch:**
1. Optimize hero image → ~200KB (saves 2MB!)
2. Lazy-load ChartsTab/Recharts → saves ~500KB initial JS
3. Convert landing page to SSR → improves FCP by ~500ms

---

## 2. Core Web Vitals Breakdown

### 2.1 Largest Contentful Paint (LCP)

**Current Status:** 🟡 Needs Improvement (est. 2.8-3.5s)
**Target:** < 2.5s

#### LCP Element Analysis

| Page | LCP Element | Current Size | Impact |
|------|------------|--------------|--------|
| `/landing` | Hero image (`hero-image.png`) | **2.27 MB** | 🔴 Critical |
| `/app` | Dashboard title + stats cards | ~5KB HTML | 🟢 Good |
| `/` | Redirect to `/landing` | N/A | ⚪ Neutral |

#### Evidence from Codebase

```tsx
// app/landing/page.tsx - Line 263
<Image
  src="/hero-image.png"
  alt="RetirePro Dashboard - Plan your retirement with confidence"
  width={1200}
  height={675}
  className="w-full h-auto"
  priority  // ✅ Good: Prioritizes loading
/>
```

The `priority` attribute is correct for LCP images, but the **2.27MB file size** negates the benefit. Next.js Image optimization helps but source image is too large.

#### Recommendations

| Action | Effort | Impact | Priority |
|--------|--------|--------|----------|
| Convert hero-image.png to WebP (300KB target) | 30 min | -2MB | P0 |
| Add `sizes` attribute for responsive images | 15 min | -30% | P1 |
| Implement `placeholder="blur"` for perceived perf | 15 min | UX | P2 |
| Preload hero image with link tag | 10 min | -100ms | P1 |

### 2.2 Interaction to Next Paint (INP)

**Current Status:** 🟢 Good (est. 150-200ms)
**Target:** < 200ms

#### Input Responsiveness Analysis

The app demonstrates good patterns for input handling:

```tsx
// components/ui/Input.tsx - Well-optimized inputs
export function CurrencyInput({ value, onChange, ...props }: CurrencyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value.replace(/[^0-9.-]/g, ''));
    if (!isNaN(val)) {
      onChange(val);  // Direct state update, no debounce needed for single values
    }
  };
  // ...
}
```

**Positive Findings:**
- ✅ Input components don't trigger expensive recalculations on every keystroke
- ✅ Calculations only run on explicit "Run Calculations" button click
- ✅ `useCallback` properly memoizes handlers in store.tsx

**Potential INP Bottlenecks:**

| Component | Operation | Est. Duration | Risk |
|-----------|-----------|---------------|------|
| ChartsTab | Recharts rendering | 100-200ms | 🟡 Medium |
| Monte Carlo | 1000 simulations | 50-150ms | 🟡 Medium |
| NetWorthTab | Complex form state updates | 30-50ms | 🟢 Low |

#### Monte Carlo Performance Analysis

```typescript
// lib/calculations.ts - Lines 534-650
export function performMonteCarloProjection(data: RetirementData): MonteCarloResults {
  const numSimulations = data.monteCarloRuns; // Default: 1000
  
  for (let sim = 0; sim < numSimulations; sim++) {
    // ~70 iterations per simulation (ages 30-100)
    for (let age = data.currentAge; age <= data.lifeExpectancy; age++) {
      // ~10-15 calculations per year
    }
  }
  // Total: ~1,000 × 70 × 12 = 840,000 calculations
}
```

**Risk:** With complex scenarios (inheritance, crypto, dividends), each simulation includes:
- RMD calculations with IRS table lookups
- Social Security COLA adjustments
- Box-Muller transform for random returns

This runs **synchronously on the main thread**, potentially causing 100-200ms jank.

### 2.3 Cumulative Layout Shift (CLS)

**Current Status:** 🟢 Good (est. 0.05-0.08)
**Target:** < 0.1

#### CLS Prevention Measures

**Well-Implemented:**
- ✅ Fixed navigation bar (`fixed top-0`) prevents layout shifts
- ✅ Image dimensions specified (`width={1200} height={675}`)
- ✅ Font loading uses `next/font/google` with CSS variables
- ✅ Theme initialization prevents color flash

**Potential CLS Sources:**

| Element | Cause | Severity |
|---------|-------|----------|
| Cookie consent banner | Appears after load | 🟡 Low (bottom positioned) |
| Stats cards on StartTab | Content depends on localStorage | 🟡 Low (skeleton possible) |
| Mobile menu dropdown | Expands on click | 🟢 None (expected) |

---

## 3. Detailed Findings

### 3.1 Bundle Size Analysis

#### JavaScript Chunks (Production Build)

| Chunk | Size | Contents | Loaded On |
|-------|------|----------|-----------|
| `8aaceedfb5605540.js` | **889 KB** | Recharts + D3 dependencies | All /app routes |
| `d4b4a1ad90e2acdb.js` | 219 KB | React + Next.js runtime | All routes |
| `06a85187e39bee8b.js` | 128 KB | Application components | All /app routes |
| `a6dad97d9634a72d.js` | 110 KB | Store + calculations | All /app routes |
| `be3ef487e7051d28.js` | 60 KB | Misc utilities | All routes |

**Total JS for dashboard:** ~1.4 MB (uncompressed)

#### Problem: Recharts Imports

```tsx
// components/tabs/ChartsTab.tsx - Lines 7-22
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

// Also imported in: BudgetTab.tsx, NetWorthTab.tsx, MortgageTab.tsx
```

Recharts is imported in **4 components** but all are bundled together because there's no code splitting:

```tsx
// components/Dashboard.tsx - All tabs imported statically
import {
  StartTab, DataTab, ResultsTab, ChartsTab, AnalysisTab,
  DetailsTab, MortgageTab, NetWorthTab, BudgetTab,
  SocialSecurityTab, TaxTab, AdvancedTab, LegalTab,
  AITab, AboutTab, SettingsTab, HelpTab,
} from '@/components/tabs';
```

### 3.2 Server-Side Rendering Effectiveness

#### Current SSR Status

| Route | Rendering | Why |
|-------|-----------|-----|
| `/landing` | Client | `'use client'` directive for state management |
| `/app` | Client | Uses React Context for local storage |
| `/terms` | Client* | Static content but inherits client rendering |
| `/privacy` | Client* | Static content but inherits client rendering |

*Could be pure server components

#### Landing Page Issue

The landing page (`app/landing/page.tsx`) is marked as `'use client'` due to:
- Pricing toggle state (`billingPeriod`)
- Newsletter form state
- FAQ accordion state
- Checkout loading state

**Impact:** First Contentful Paint (FCP) delayed by ~300-500ms because:
1. JS must download and parse
2. React hydration must complete
3. Only then does content render

### 3.3 Image Optimization

#### Current Images

| Image | Format | Size | Optimization |
|-------|--------|------|--------------|
| `hero-image.png` | PNG | **2.27 MB** | 🔴 None |
| `og-image.png` | PNG | Unknown | ⚪ OG only |
| `favicon-*.png` | PNG | < 10 KB | 🟢 Correct |
| SVG icons | SVG | < 1 KB each | 🟢 Correct |

#### Hero Image Deep Dive

```
File: public/hero-image.png
- Original size: 2,380,967 bytes (2.27 MB)
- Dimensions: 1200 × 675
- Format: PNG (lossless, not needed for photo-like content)
```

**Expected after optimization:**
- WebP format: ~150-200 KB (90% reduction)
- AVIF format: ~100-150 KB (93% reduction)

### 3.4 Font Loading

#### Current Implementation (Correct ✅)

```tsx
// app/layout.tsx - Lines 5-13
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

**Strengths:**
- Uses `next/font/google` for automatic optimization
- Font files self-hosted (no external request)
- CSS variables allow font-display control
- Preconnect headers in place

### 3.5 Third-Party Scripts

#### External Dependencies

| Service | Script | Loading Strategy | Impact |
|---------|--------|------------------|--------|
| Stripe | `js.stripe.com` | On-demand (checkout) | 🟢 Minimal |
| Google Fonts | via next/font | Self-hosted | 🟢 None |
| Analytics | Not implemented | N/A | 🟢 None |

**Positive Finding:** No analytics scripts are currently loading, which is excellent for performance. When adding analytics:
- Use `next/script` with `strategy="lazyOnload"`
- Prefer Plausible/Fathom over Google Analytics (smaller payload)

### 3.6 CSS Analysis

| File | Size | Contents |
|------|------|----------|
| `943463ddad2592d6.css` | **80 KB** | Tailwind CSS (all used classes) |

**Assessment:** 80KB is reasonable for Tailwind CSS with purging enabled. The site uses Tailwind v4 which has improved tree-shaking.

---

## 4. Opportunities for FinTech-Specific Optimizations

### 4.1 Monte Carlo Simulation Performance

**Current Implementation:**
- Runs 1,000 simulations synchronously
- Each simulation iterates through all years (typically 35-70 years)
- Uses Box-Muller transform for random number generation

**Optimization Options:**

| Approach | Complexity | Performance Gain | Implementation |
|----------|------------|------------------|----------------|
| Web Worker | Medium | Main thread freed | Move `performMonteCarloProjection` to worker |
| Reduce default runs | Easy | Linear reduction | Change default from 1000 to 500 |
| Progressive rendering | Hard | Perceived perf | Show results as simulations complete |
| WASM | Hard | 5-10x faster | Compile calculations to WebAssembly |

**Recommended Approach:** Web Worker

```typescript
// Proposed: lib/workers/monte-carlo.worker.ts
self.onmessage = (e: MessageEvent<RetirementData>) => {
  const results = performMonteCarloProjection(e.data);
  self.postMessage(results);
};
```

### 4.2 Chart Rendering Performance

**Current Issue:** Recharts renders on every state change, even when not visible.

**Recommended Optimizations:**

1. **Memoize chart data:**
```tsx
const chartData = useMemo(() => 
  scenarioResults.expected.yearByYear.map((item, index) => ({
    age: retirementData.currentAge + index,
    expected: Math.round(item.balance),
    // ...
  })),
  [scenarioResults, retirementData.currentAge]
);
```

2. **Virtualize large datasets:** For 30+ year projections, consider windowing:
```tsx
import { AreaChart } from 'recharts';
// Only render visible data points
const visibleData = chartData.slice(startIndex, endIndex);
```

### 4.3 Form Input Responsiveness

**Current Pattern (Good):**
- Direct state updates without debouncing
- Calculations only on button click
- Controlled inputs with proper React patterns

**Enhancement Opportunity:**
- Add `inputMode="decimal"` for mobile number keyboards
- Implement optimistic UI for save operations

---

## 5. Prioritized Optimization Plan

### 🔴 P0: Critical (Before Launch - Week 1)

| Task | Effort | Impact | Owner |
|------|--------|--------|-------|
| Optimize hero image to WebP, <300KB | 1 hour | LCP -2s | Image |
| Add dynamic import for ChartsTab | 2 hours | JS -500KB | Code |
| Add dynamic import for BudgetTab, MortgageTab, NetWorthTab | 2 hours | JS -200KB | Code |
| Add `loading="lazy"` to below-fold images | 30 min | Network | HTML |

### 🟡 P1: Important (Week 2)

| Task | Effort | Impact | Owner |
|------|--------|--------|-------|
| Convert landing page sections to server components | 4 hours | FCP -300ms | Arch |
| Add blur placeholder to hero image | 1 hour | Perceived perf | Image |
| Implement Web Worker for Monte Carlo | 4 hours | INP improvement | Calc |
| Add preload for hero image | 30 min | LCP -100ms | HTML |

### 🟢 P2: Nice to Have (Month 1)

| Task | Effort | Impact | Owner |
|------|--------|--------|-------|
| Implement Service Worker for offline caching | 8 hours | Return visit speed | PWA |
| Add skeleton loading states | 4 hours | Perceived perf | UX |
| Implement route prefetching for common paths | 2 hours | Navigation speed | Next |
| Add performance monitoring (Web Vitals) | 2 hours | Visibility | Ops |

### 🔵 P3: Long-term (Quarter 1)

| Task | Effort | Impact | Owner |
|------|--------|--------|-------|
| Consider lighter chart library (visx, Chart.js) | 16 hours | JS -600KB | Arch |
| Implement edge caching with Vercel | 4 hours | TTFB -50ms | Infra |
| Add AVIF image format support | 2 hours | Images -30% | Image |
| WebAssembly for calculations (optional) | 40 hours | Calc 10x faster | R&D |

---

## 6. Implementation Examples

### 6.1 Dynamic Import for ChartsTab

```tsx
// components/Dashboard.tsx
import dynamic from 'next/dynamic';

// Lazy load heavy chart component
const ChartsTab = dynamic(() => import('@/components/tabs/ChartsTab').then(m => ({ default: m.ChartsTab })), {
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
    </div>
  ),
  ssr: false, // Charts require client-side only
});
```

### 6.2 Hero Image Optimization

```bash
# Convert to WebP with quality optimization
npx @squoosh/cli --webp '{"quality":80}' hero-image.png -d public/

# Or use Next.js built-in optimization with source WebP
# 1. Create optimized source
# 2. Add sizes attribute:
```

```tsx
<Image
  src="/hero-image.webp"
  alt="RetirePro Dashboard"
  width={1200}
  height={675}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
  priority
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZ..." // Generate low-res placeholder
/>
```

### 6.3 Partial Server Rendering for Landing Page

```tsx
// app/landing/page.tsx
// Split into server and client parts

// Server component (no 'use client')
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation />  {/* Server */}
      <HeroSection />  {/* Server */}
      <FeaturesSection />  {/* Server */}
      <TestimonialsSection />  {/* Server */}
      <PricingSection />  {/* Client - needs state */}
      <FAQSection />  {/* Client - needs accordion state */}
      <Footer />  {/* Server */}
      <CookieConsent />  {/* Client */}
    </div>
  );
}
```

---

## 7. Recommended Monitoring Tools

| Tool | Purpose | Cost |
|------|---------|------|
| **Vercel Analytics** | Real User Monitoring (RUM) | Included with Vercel |
| **Lighthouse CI** | Automated performance regression | Free |
| **WebPageTest** | Deep performance analysis | Free tier |
| **CrUX Dashboard** | Field data from Chrome users | Free |
| **Sentry Performance** | Error + performance correlation | Free tier |

### Lighthouse CI Configuration

```yaml
# .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['https://retirepro.io', 'https://retirepro.io/landing', 'https://retirepro.io/app'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'interactive': ['warn', { maxNumericValue: 3800 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

---

## 8. Appendix

### A. File Size Inventory

| Path | Size | Category |
|------|------|----------|
| `public/hero-image.png` | 2.27 MB | 🔴 Image |
| `.next/static/chunks/8aaceedfb5605540.js` | 889 KB | 🔴 JS (Recharts) |
| `.next/static/chunks/d4b4a1ad90e2acdb.js` | 219 KB | JS (React) |
| `.next/static/chunks/06a85187e39bee8b.js` | 128 KB | JS (App) |
| `.next/static/chunks/a6dad97d9634a72d.js` | 110 KB | JS (Store) |
| `.next/static/chunks/943463ddad2592d6.css` | 80 KB | CSS (Tailwind) |
| `.next/static/chunks/be3ef487e7051d28.js` | 60 KB | JS (Utils) |

### B. Estimated Time to Interactive (TTI)

| Network | First Load | Return Visit |
|---------|------------|--------------|
| Fast 3G | 6-8 seconds | 2-3 seconds |
| 4G LTE | 3-4 seconds | 1-2 seconds |
| WiFi | 1.5-2 seconds | <1 second |

### C. Core Web Vitals Thresholds (2024)

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| INP | ≤ 200ms | 200ms - 500ms | > 500ms |
| CLS | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |

---

**Report Prepared By:** Web Performance Engineering Team  
**Next Review:** After P0 optimizations implemented  
**Questions:** Open a GitHub issue with `performance` label
