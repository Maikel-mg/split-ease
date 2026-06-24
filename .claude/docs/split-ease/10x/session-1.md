# 10x Analysis: SplitEase
Session 1 | Date: 2026-06-17
Last updated: 2026-06-17 (audience clarification)

## Current Value

SplitEase is a shared expense management web app for Spanish-speaking users. It lets groups of friends:

- Create groups with invite codes
- Add expenses with 3 split modes (equally, shares, custom amounts)
- Track who paid what and simplify debts
- Register settlements (manual payments)
- Upload receipt images
- Mark groups as private (expenses visible only to involved parties)

**Who uses it**: Casual groups of friends — dinners, weekend trips, birthday celebrations. NOT daily roommates. NOT international travelers. Usage is sporadic and event-driven.

**Core action**: Someone pays → add expense → see who owes whom → someone settles up (probably).

**Current state**: Functional MVP. Clean architecture, solid domain model (BalanceService with 4 algorithms), Spanish-language UI, Supabase backend. One completed feature in pipeline (copy-group). No auth enforcement (anonymous identity via localStorage). No notifications, no analytics, no real-time.

**Key constraints** (from user):
- Audience: casual friend groups, NOT daily-use roommates
- No multi-currency needed (single-currency, likely EUR)
- Sporadic usage: group activates for an event, then goes dormant
- Spanish-speaking users

---

## The Question

What would make SplitEase 10x more valuable for **casual friend groups** — the kind of users who create a group for a weekend trip, use it intensely for 2-3 days, then forget about it until the next event?

---

## Massive Opportunities

### 1. Real-Time Multiplayer (The "Dinner Table Moment")

**What**: Use Supabase Realtime to show live updates — when someone adds an expense, all group members see it instantly. Show real-time balance updates. The moment where everyone at the table watches expenses appear live.

**Why 10x**: For casual friend groups, the use case is THIS: 6 friends at dinner, one person pays, they pull out SplitEase, and within seconds everyone sees exactly who owes what. No "ahora te aviso cuando lo cargue." No "yesterday I added that expense." It happens NOW, together, at the table. This is the social proof moment that makes someone say "bajate esta app."

**Unlocks**: Viral in-person acquisition. The dinner table demo is the most powerful organic growth channel. If 6 people watch it work in real time, 6 people download it.

**Effort**: Medium-High (Supabase Realtime subscriptions, optimistic UI, conflict resolution)

**Risk**: Complexity in offline scenarios. Realtime can be expensive at scale.

**Score**: 🔥 — THE feature that makes casual groups adopt. This is the growth engine.

---

### 2. Smart Settlement Engine (Cross-Group Netting)

**What**: Detect when the same two people have debts across multiple groups. Show a unified view: "You and Carlos have debts in 3 groups. Net total: you owe him €35. Settle with one payment?"

**Why 10x**: Casual friend groups create a new group for each event (birthday trip, weekend house, concert). Over time, you end up with 5-8 dormant groups with fragmented debts. Today, users must remember and track these manually. A smart engine collapses them into a single number.

**Unlocks**: "I owe Carlos €35" is simpler and more actionable than "I owe Carlos €12 in Barcelona, €8 in the birthday trip, and €15 in last weekend." The app becomes the single source of truth for all shared finances between any two people.

**Effort**: Medium-High (cross-group queries, debt simplification across groups)

**Risk**: Edge cases with circular debts across groups.

**Score**: 🔥 — High impact for the exact usage pattern (multiple dormant groups).

---

### 3. Expense Intelligence & Group Summary

**What**: After a group event ends, generate a clean summary: "Barcelona Trip — 12 expenses, €840 total. Carlos paid €320, Ana paid €280. Most expensive: Hotel (€180). Everyone is settled ✅" — shareable as an image or link.

**Why 10x**: Casual groups want closure. After a trip, someone usually asks "quién debe qué?" and there's confusion. A visual summary gives definitive answers and is shareable to the group chat (WhatsApp). This is the "receipt" that proves the app worked.

**Unlocks**: Shareability. A beautiful trip summary screenshot in WhatsApp is organic marketing. "Miren, con esta app nos quedamos todos claros."

**Effort**: Medium (summary generation, image rendering — recharts available, share API)

**Risk**: Summary quality depends on data completeness.

**Score**: 🔥 — Shareability = organic growth. Perfect for casual groups.

---

### 4. Push Notifications & Debt Reminders

**What**: Browser push notifications for: new expenses in your groups, gentle debt reminders ("After the Barcelona trip, you owe Ana €25"), payment confirmations. Smart timing — batch reminders, no spam.

**Why 10x**: Casual groups go dormant after an event. Without reminders, debts sit for weeks/months. A gentle nudge 3-5 days after a trip ("Hey, the Barcelona group has €45 unsettled") brings users back. It's the difference between "I forgot I owed you" and "ah sí, te pago ahora."

**Unlocks**: Reactivation of dormant groups. Faster settlement. Users remember SplitEase exists.

**Effort**: Medium (web push API, notification scheduling, preferences)

**Risk**: Notification fatigue if not tuned for casual usage patterns.

**Score**: 👍 — Essential for casual groups that go dormant between events.

---

### 5. Expense Categories & Smart Tagging

**What**: Let users categorize expenses (Comida, Transporte, Alojamiento, Entretenimiento, Otro). Auto-suggest from description keywords. Group by category in summary view.

**Why 10x**: Categories turn a flat expense list into structured data. For casual groups, it answers "cuánto gastamos en comida vs. alojamiento?" — a question everyone asks after a trip. It's also the foundation for the summary feature.

**Unlock

---

## Medium Opportunities

### 1. Expense Templates & Quick-Add

**What**: Save common expenses as templates ("Uber — €25, split equally among all"). One-tap to recreate. For casual groups, this means: "we always split the Uber the same way, just tap to add it."

**Why 10x**: For casual groups, the same expenses repeat across events (same Uber driver, same restaurant, same activity). Templates turn 5-second form filling into 1-tap.

**Impact**: Faster expense entry → more expenses logged → less "ahora lo cargo y nunca lo hago."

**Effort**: Low-Medium

**Score**: 👍

---

### 2. Group Templates & Presets

**What**: Pre-built group configurations: "Viaje de fin de semana" (weekend trip), "Cena" (dinner), "Cumpleaños" (birthday). Each comes with sensible defaults.

**Why 10x**: Reduces setup friction. Casual groups create a new group for each event. "Going on a weekend trip? Tap template, add names, done."

**Impact**: Lower barrier to creating new groups → more groups → more activity.

**Effort**: Low

**Score**: 👍

---

### 3. Settlement History & Receipt

**What**: When a payment is registered, generate a clean receipt: "Ana paid Carlos €45 on June 15 for Barcelona Trip. Balance: €0." Exportable as image or shareable link.

**Why 10x**: Casual groups need closure. After a trip, someone asks "y ahora quién le paga a quién?" A receipt eliminates disputes and gives definitive answers.

**Impact**: Trust, transparency, faster dispute resolution.

**Effort**: Low-Medium

**Score**: 👍

---

### 4. Smart Debt Warnings

**What**: Alert users when debts are accumulating across groups: "You've owed Ana €120 across 3 groups for 2 weeks." Show debt aging.

**Why 10x**: Casual groups go dormant. Small debts feel insignificant until they compound. Warnings create urgency.

**Impact**: Faster settlement cycles. Reduced "se me olvidó."

**Effort**: Low

**Score**: 👍

---

### 5. Expense Search & Advanced Filtering

**What**: Full-text search across expenses. Filter by date range, amount range, payer, category.

**Why 10x**: Groups with 50+ expenses become unmanageable. Search turns a scrollable list into a queryable database.

**Impact**: Essential for groups with long history.

**Effort**: Low-Medium

**Score**: 👍

---

### 6. Member Expense History & Summary

**What**: Per-member view: "Carlos has paid €340 total across 8 expenses. Most common: Transport. Biggest: Hotel — €180."

**Why 10x**: Gives each member a personal snapshot. Creates accountability and transparency.

**Impact**: Personal relevance increases engagement.

**Effort**: Low

**Score**: 👍

---

## Small Gems

### 1. Auto-Suggest Equal Split

**What**: When adding an expense, auto-check all participants and default to equal split.

**Why powerful**: Eliminates 3-4 taps on 90% of expenses. Most casual group expenses ARE split equally.

**Effort**: Low

**Score**: 🔥 — Tiny change, massive daily time savings.

---

### 2. Running Total Display

**What**: While typing an amount, show per-person cost in real-time: "€60 → €15 each (4 people)."

**Why powerful**: Users constantly do mental math. This eliminates it.

**Effort**: Low

**Score**: 🔥 — Immediate value, zero learning curve.

---

### 3. Expense Confirmation Toast with Balance Preview

**What**: After adding an expense, show: "€45 added! Carlos owes €22.50, Ana owes €22.50." with undo.

**Why powerful**: Confirmation reduces anxiety. Balance preview gives immediate context. Undo prevents mistakes.

**Effort**: Low

**Score**: 🔥 — Confidence boost, mistake prevention.

---

### 4. QR Code for Group Invite

**What**: Generate a QR code for the group invite link. Display on screen for in-person sharing.

**Why powerful**: At a dinner table, scanning QR is 10x faster than typing a code. Removes the biggest onboarding friction.

**Effort**: Low

**Score**: 🔥 — Perfect for the "dinner table" moment.

---

### 5. Copy Last Expense

**What**: One button to duplicate the most recent expense with a new amount and description.

**Why powerful**: Common pattern — "same group, same people, different amount." Copy reduces to 2 edits.

**Effort**: Low

**Score**: 👍

---

### 6. Expense Date Quick-Select

**What**: Quick date options: "Hoy," "Ayer," "Esta semana," "Semana pasada" instead of only a calendar.

**Why powerful**: Most expenses are from today or yesterday. One tap vs. navigating a calendar.

**Effort**: Low

**Score**: 👍

---

### 7. Group Activity Timeline

**What**: Show a chronological feed: "June 10: Carlos added 'Cena' €45. June 11: Ana paid Carlos €22.50. June 12: Laura added 'Uber' €15."

**Why powerful**: Gives context and recency. Casual users return after days away and need to catch up instantly.

**Effort**: Low

**Score**: 👍

---

## Recommended Priority

### Do Now (Quick Wins — 1-2 days each)
1. **Auto-Suggest Equal Split** — Why: 90% of expenses are equal splits. Eliminating 3-4 taps per expense. Impact: immediate time savings.
2. **Running Total Display** — Why: Eliminates mental math on every expense. Zero learning curve. Impact: reduces corrections.
3. **Expense Confirmation Toast** — Why: Confidence + undo = trust. Balance preview in toast gives immediate context. Impact: reduced anxiety.
4. **QR Code for Group Invite** — Why: In-person sharing is the #1 onboarding path. QR is 10x faster than typing a code. Impact: higher group creation rate.

### Do Next (High Leverage — 1-2 weeks each)
1. **Real-Time Multiplayer** — Why: THE "dinner table moment" feature. 6 people watch expenses appear live. This is the viral demo. Unlocks: organic in-person acquisition.
2. **Trip Summary / Shareable Report** — Why: After a trip, generate a clean visual summary. Shareable to WhatsApp = organic marketing. "Miren, con esta app nos quedamos todos claros."
3. **Cross-Group Debt Netting** — Why: Casual groups accumulate dormant groups with fragmented debts. Show unified "you owe Carlos €35 across 3 groups." Unlocks: app becomes relationship-level truth.
4. **Push Notifications** — Why: Gentle reminders reactivate dormant groups. "After the Barcelona trip, you owe Ana €25." Unlocks: faster settlement, re-engagement.

### Explore (Strategic Bets)
1. **Expense Categories + Analytics** — Why: Categories unlock filtering, insights, and smart summaries. Risk: category assignment is hard to automate. Upside: data moat.
2. **Bizum / Payment Integration** — Why: One-tap settlement from within the app. Risk: regulatory complexity (PSD2). Upside: closes the loop completely.
3. **AI Expense Categorization** — Why: Auto-suggest categories from description text. Risk: adds complexity. Upside: makes categories effortless.

### Backlog (Good But Not Now)
1. **Group Templates** — Why later: Nice but low frequency. Groups are created rarely.
2. **Settlement Receipts** — Why later: Useful but edge case. Most settlements are casual.
3. **Keyboard Shortcuts** — Why later: Power user feature, low reach for casual groups.
4. **Expense Templates** — Why later: "Copy last expense" handles 80% of the case.

---

## Competitive Landscape

SplitEase competes with:
- **Splitwise** (dominant): Has recurring, multi-currency, categories, analytics. BUT bloated, slow, ads. NOT fun to use.
- **Settle Up**: Simpler, faster, but less feature-rich.
- **Tricount**: Popular in Europe, good UX, but limited splitting options.

**SplitEase's edge for casual groups**: Fast Next.js app, flexible split modes (3 modes), Spanish-language, private groups, clean architecture. The opportunity is NOT to match Splitwise feature-for-feature — it's to be the **delightful, fast, social** alternative that friends actually enjoy using.

---

## Questions

### Answered
- **Q**: What's the current feature set? **A**: Groups, expenses (3 split modes), balances, debts, payments, images, private groups, copy group.
- **Q**: What's the tech stack? **A**: Next.js 16, React 18, Supabase, Clean Architecture, shadcn/ui.
- **Q**: What's the identity model? **A**: Anonymous (localStorage) + optional Supabase Auth. Group membership is name-based, not user-ID-based.
- **Q**: Who is the target audience? **A**: Casual friend groups — dinners, weekend trips, birthday celebrations. NOT daily roommates. NOT international travelers. Single-currency (EUR).

### Blockers
- **Q**: Is this live with real users? (Affects whether notifications/analytics are premature vs. essential)
- **Q**: Solo project or team? (Affects how many features can be tackled in parallel)
- **Q**: Monetization strategy? (Affects whether payment integration is feasible)

---

## Next Steps

- [ ] Validate: Is the "dinner table demo" the right growth hook? (Ask 3-5 friends)
- [ ] Research: Supabase Realtime capabilities and pricing
- [ ] Prototype: Running total display + auto-suggest equal split (30min hack)
- [ ] Decide: Real-time multiplayer vs. trip summary as the first "big" feature
- [ ] User interview: Ask 3-5 friends what they hate about current expense splitting
- [ ] Competitive audit: Download Splitwise, Settle Up, Tricount — screenshot the onboarding flow
