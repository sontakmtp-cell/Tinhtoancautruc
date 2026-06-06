# Design System: Crane Beam Design Studio

## 1. Visual Theme & Atmosphere

Crane Beam Design Studio is a technical calculation cockpit for engineers, fabricators, and workshop owners who need fast structural checks without feeling lost in software complexity. The interface must feel precise, calm, and trustworthy: like a modern steel design console in a clean engineering office.

Design scores:

- **Density:** 7/10 — data-rich and practical, but never cramped.
- **Variance:** 5/10 — organized asymmetry, not decorative chaos.
- **Motion:** 4/10 — restrained motion that confirms state changes, not entertainment.

The visual language is structural, measured, and tactile. Use crisp dividers, stable input fields, calibrated status colors, clear diagrams, and quiet hierarchy. The product is about safety and confidence, so the UI must avoid startup-like hype, neon effects, and vague marketing styling.

## 2. Color Palette & Roles

Use one neutral technical palette with one restrained accent. Support both light and dark modes, but keep the same material feeling across both.

- **Blueprint Mist** (#F4F7FA) — Light mode page canvas; soft technical background.
- **Panel White** (#FFFFFF) — Light mode panels, input groups, modal surfaces.
- **Zinc Ink** (#18181B) — Primary text; never use pure black.
- **Graphite Line** (#3F3F46) — Dark mode panel edges, high-emphasis labels, diagram strokes.
- **Slate Caption** (#71717A) — Secondary text, help text, metadata, units.
- **Steel Border** (#D4D8DE) — Light mode structural borders, table rules, input outlines.
- **Charcoal Canvas** (#111827) — Dark mode page canvas; deep but not pure black.
- **Charcoal Panel** (#1F2937) — Dark mode panels and calculation containers.
- **Muted Rail** (#94A3B8) — Dark mode secondary text and diagram measurement lines.
- **Crane Blue** (#2563EB) — The single accent. Use for primary actions, active tabs, selected states, focus rings, and key diagram highlights.
- **Safety Green** (#16A34A) — Pass states only. Do not use as a decorative accent.
- **Warning Amber** (#D97706) — Caution states, borderline values, incomplete inputs.
- **Failure Red** (#DC2626) — Failed safety checks, invalid input, blocked PDF generation.

Rules:

- Maximum one brand accent: **Crane Blue** (#2563EB).
- Status colors are functional only: green means pass, amber means caution, red means fail.
- No purple-blue neon, no glowing blue shadows, no candy gradients.
- Never use pure black (#000000).
- Diagrams should use neutral steel lines plus a single active highlight, not many competing colors.

## 3. Typography Rules

- **Display:** Geist — controlled, compact, confident. Use for product name, calculator module titles, and report headings.
- **Body:** Geist — readable Vietnamese and English text, relaxed line height, max width of 65 characters for explanatory copy.
- **Mono:** JetBrains Mono — all engineering numbers, units, formulas, ratios, timestamps, and table values.

Type scale:

- Product title: `clamp(1.5rem, 2vw, 2.25rem)`, weight 750.
- Section heading: `1.25rem` to `1.5rem`, weight 700.
- Panel heading: `1rem`, weight 650.
- Body text: `0.9375rem` to `1rem`, line height 1.6.
- Metadata and helper text: `0.8125rem`, line height 1.45.
- Numeric values: JetBrains Mono, `0.875rem` to `1rem`, tabular alignment.

Banned:

- No Inter.
- No generic serif fonts.
- No oversized hero text that makes the calculator feel like a marketing site.
- Do not rely on font size alone for hierarchy; combine weight, spacing, and color.

## 4. Screen Architecture For Stitch

Generate the actual application screen first, not a landing page. The first viewport must show the calculator workflow immediately.

Preferred first screen structure:

1. **Sticky top bar**
   - Left: product name "Crane Beam Design Studio".
   - Center/right: module links such as FAQ and Hướng dẫn.
   - Right: language switcher and theme toggle.
   - Height: compact, about 64px desktop, auto-wrapped on mobile.

2. **Technical command band**
   - Left side: page title and one short description.
   - Right side: compact status summary, for example "TCVN / Eurocode references", "PDF ready", or "AI suggestion available".
   - Use asymmetry: text block wider than status block.
   - Do not make this a giant marketing hero.

3. **Calculator workspace**
   - Left column: beam type tabs and input groups.
   - Right column: live cross-section diagram and result summary.
   - Results and charts sit below in a dense but readable grid.
   - On mobile, collapse to one column: tabs, inputs, diagram, results, charts.

4. **Knowledge support section**
   - FAQ and guide cards appear after the calculator, not before it.
   - Use two-column zig-zag or stacked list, not three equal feature cards.

## 5. Component Stylings

### Buttons

- Primary button: Crane Blue fill (#2563EB), white text, 8px radius, 44px minimum height.
- Active press: translate down 1px and slightly darken fill.
- Hover: subtle background shift only; no glow, no text shadow.
- Disabled: lower opacity and keep the same geometry so layout does not jump.
- Use icons from Lucide where useful: calculator, PDF export, reset, theme, language, warning.

### Beam Type Tabs

- Use a segmented technical control, not oversized cards.
- Each tab has fixed minimum height so labels never resize the row.
- Active tab uses Crane Blue with white text.
- Inactive tabs use neutral background and a thin border.
- Icons should be small, aligned, and secondary to the label.

### Input Groups

- Group inputs by meaning: Geometry, Loading, Material, Optional parameters.
- Label above field, unit displayed inside or directly beside the input.
- Inputs must have consistent height and width; do not let long Vietnamese labels break the grid.
- Focus ring: Crane Blue, 2px, no glow.
- Error text below the field in Failure Red.
- Helper text appears as small muted text or tooltip, never as a large paragraph inside the form.

### Result Panels

- Use compact panels with strong numeric hierarchy.
- Pass/fail badges must be functional and plain:
  - Pass: Safety Green text and soft green background.
  - Warning: Warning Amber text and soft amber background.
  - Fail: Failure Red text and soft red background.
- Numbers use JetBrains Mono and align cleanly.
- Avoid fake-perfect values like 99.99%.

### Diagrams And Charts

- Diagrams are first-class UI, not decorative illustrations.
- Cross-section SVG should sit on a stable canvas with dimension lines, labels, and active highlights.
- Chart grids use muted neutral lines.
- Highlight one active data series with Crane Blue; use status colors only when the chart communicates pass/fail.
- Measurement labels use JetBrains Mono when they contain numbers or units.

### Cards And Panels

- Use 8px border radius for operational panels.
- Use 12px radius only for modals or major grouped workspaces.
- Shadows must be shallow and neutral; prefer borders and spacing over floating cards.
- No nested cards inside cards.
- For dense result sections, use border-top dividers instead of stacking many boxed panels.

### Modals And PDF Export

- Modal background overlay: rgba(17, 24, 39, 0.55).
- Modal panel: Charcoal Panel in dark mode or Panel White in light mode.
- The PDF dialog should feel like a form checklist, not a marketing prompt.
- Clear actions: Cancel, Generate PDF.
- Loading state uses skeleton rows or progress text, never a generic circular spinner.

## 6. Layout Principles

- Use CSS Grid for the main workspace.
- Desktop workspace: `grid-template-columns: minmax(360px, 0.9fr) minmax(420px, 1.1fr)`.
- Maximum content width: 1440px centered.
- Page padding: `clamp(1rem, 2.5vw, 2rem)`.
- Section gap: `clamp(1.5rem, 4vw, 3rem)`.
- Panel padding: 16px mobile, 20px to 24px desktop.
- No overlapping elements. Every text, button, chart, and diagram needs its own clear space.
- No full-height decorative hero. Use `min-h-[100dvh]` only if a full viewport layout is truly needed.
- No horizontal scroll on mobile.
- Never create a generic row of three equal cards.

## 7. Responsive Rules

- Below 768px, all multi-column layouts collapse to one column.
- Touch targets must be at least 44px high.
- Long Vietnamese labels must wrap cleanly or use a smaller label line, never overflow.
- Tables become stacked rows or horizontally managed internal tables with clear containment; the page itself must not scroll sideways.
- The cross-section diagram keeps a stable aspect ratio and scales down within the viewport.
- Header navigation collapses into a compact menu or wraps neatly without covering content.
- Language and theme controls remain accessible in the first viewport.

## 8. Motion & Interaction

Motion should communicate calculation state and interaction feedback.

- Default motion: spring-like, weighty, and short. Use `stiffness: 100, damping: 20` when a spring model is available.
- Animate only `transform` and `opacity`.
- Do not animate width, height, top, or left.
- Tab changes: quick fade and 4px vertical slide.
- Result reveal: stagger rows by 40ms to 70ms after calculation.
- Active diagram highlight: subtle pulse with opacity only.
- Loading calculation: use a skeleton or progress phrase that matches the calculation area size.
- No looping decoration unless it represents an active process.

## 9. Copywriting Rules

Use direct Vietnamese and English engineering language. The product helps users calculate, verify, and export reports.

Good copy examples:

- "Nhập thông số dầm"
- "Kiểm tra ứng suất"
- "Độ võng đạt yêu cầu"
- "Xuất báo cáo PDF"
- "Cần tăng tiết diện hoặc giảm tải"
- "Tài liệu tham khảo"

Banned copy:

- "Elevate your workflow"
- "Unleash productivity"
- "Next-gen platform"
- "Seamless experience"
- "Scroll to explore"
- "Swipe down"
- Generic names like "John Doe", "Acme", or "Nexus".

## 10. Accessibility And Engineering Trust

- All inputs need visible labels.
- Color cannot be the only pass/fail signal; include text such as "ĐẠT" or "KHÔNG ĐẠT".
- Maintain contrast suitable for long technical sessions.
- Use real units everywhere: mm, cm, kg, kg/cm².
- Make formulas and references legible, not hidden behind decoration.
- Error states must tell the user what to fix in plain language.
- PDF export state must clearly show whether calculation is required before export.

## 11. Anti-Patterns Banned

- No emojis anywhere in generated UI.
- No Inter font.
- No pure black (#000000).
- No neon or outer glow shadows.
- No purple/blue neon gradients.
- No oversaturated accent colors.
- No excessive gradient text.
- No custom mouse cursor.
- No overlapping content.
- No centered marketing hero as the first screen.
- No three equal feature cards in a row.
- No fake-perfect metrics.
- No generic placeholder people or company names.
- No broken Unsplash links; use local assets, simple SVG diagrams, or stable placeholders only when needed.
- No decorative blobs, floating orbs, bokeh, or meaningless background gradients.
- No large blocks of explanatory text inside the calculator workspace.

## 12. Stitch Generation Prompt

Use this prompt when sending to Stitch:

> Create a premium technical calculator interface for "Crane Beam Design Studio", a Vietnamese/English web app for crane beam structural calculation. Generate the real application screen, not a landing page. The first viewport must show a sticky header, compact technical command band, beam type tabs, grouped numeric inputs, a live cross-section diagram, safety result panels, chart areas, and PDF export controls. Use the design system in this document exactly: Geist typography, JetBrains Mono for numbers, neutral zinc/slate engineering palette, one Crane Blue accent (#2563EB), no neon, no Inter, no pure black, no overlapping elements, no generic three-card feature row. The UI should feel like a calm engineering cockpit: precise, trustworthy, dense enough for calculations, but readable for non-expert users.
