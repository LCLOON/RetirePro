# RetirePro Codebase Instructions

## Architecture Overview

RetirePro is a **Next.js 16** retirement planning SaaS with a freemium subscription model. The app runs entirely client-side for calculations with server-side API routes for payments and AI features.

### Key Structural Decisions
- **Client-side state**: All retirement data lives in `lib/store.tsx` using React Context + useReducer. Data persists to localStorage, NOT a database
- **Route structure**: `/app` = main dashboard, `/landing` = marketing, `/` redirects based on context
- **Subscription gating**: Features are tier-locked (free/pro/premium) via `FeatureGate` component and `lib/subscription.tsx`

## Core Data Flow

```
User Input → store.tsx (Context) → calculations.ts → Results Display
     ↓
localStorage (persistence)
```

### State Management Pattern
All data updates flow through typed actions in [lib/store.tsx](lib/store.tsx):
```tsx
// Always use helper functions from useApp(), never dispatch directly
const { updateRetirementData, updateNetWorthData, runCalculations } = useApp();
updateRetirementData({ currentAge: 45 }); // Triggers hasUnsavedChanges
```

### Types & Defaults
All types AND default values are defined in [lib/types.ts](lib/types.ts). When adding new data fields:
1. Add type to appropriate interface (`RetirementData`, `NetWorthData`, etc.)
2. Add default value to matching `DEFAULT_*` constant
3. Add migration logic in `store.tsx` → `migrateData()` for backwards compatibility

## Component Patterns

### UI Components
Use barrel exports from `@/components/ui`:
```tsx
import { Card, CurrencyInput, PercentInput, Button, Select } from '@/components/ui';
```

### Tab Components
Each tab in `components/tabs/` is self-contained. Pattern:
```tsx
'use client';
import { useApp } from '@/lib/store';
import { Card, CurrencyInput } from '@/components/ui';

export function NewTab() {
  const { state, updateRetirementData } = useApp();
  // Component logic
}
```

### Feature Gating
Wrap premium features with `FeatureGate`:
```tsx
<FeatureGate featureId="charts">
  <ChartsTab />
</FeatureGate>
```
Feature IDs and tier mappings are in [lib/subscription.tsx](lib/subscription.tsx) → `FEATURE_TIERS`.

## API Routes

Located in `app/api/`. All use Next.js Route Handlers:
- `/api/ai-advisor` - Uses **xAI API** (not OpenAI) for retirement advice
- `/api/checkout` - Stripe checkout session creation
- `/api/webhook` - Stripe webhook handler
- `/api/send-email` - Resend email service

Environment variables required:
```
XAI_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY
```

## Calculations Engine

[lib/calculations.ts](lib/calculations.ts) contains all financial math:
- `calculateScenarioResults()` - Main projection engine
- `performMonteCarloProjection()` - Stochastic simulations
- Helper functions for FV, annuities, mortgage payoffs

Calculations run client-side. Trigger via `runCalculations()` from store context.

## Styling

- **Tailwind CSS v4** with dark-first design
- Theme system: `light | dark | medium` in store, applied via inline styles
- Emerald (`emerald-*`) is the primary accent color
- Use slate grays for backgrounds/borders

## Common Tasks

### Adding a New Tab
1. Create `components/tabs/NewTab.tsx` following existing pattern
2. Export from `components/tabs/index.ts`
3. Add TabId to `lib/types.ts`
4. Add case in `Dashboard.tsx` → `renderTab()`
5. Add to `Sidebar.tsx` navigation
6. If premium: add to `FEATURE_TIERS` in `lib/subscription.tsx`

### Adding New Data Fields
1. Update type in `lib/types.ts`
2. Add default in `DEFAULT_*` constant
3. Add migration in `store.tsx` if needed for existing users
4. Update relevant tab component to display/edit

## Commands
```bash
npm run dev    # Development server (http://localhost:3000)
npm run build  # Production build
npm run lint   # ESLint check
```
