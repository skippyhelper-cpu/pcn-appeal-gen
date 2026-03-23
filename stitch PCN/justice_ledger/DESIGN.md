# Design System Strategy: The Digital Advocate

## 1. Overview & Creative North Star

**Creative North Star: "The Authoritative Concierge"**
The digital landscape for legal appeals is often cluttered, intimidating, and overly utilitarian. This design system breaks that mold by adopting a "High-End Editorial" aesthetic. We aim to move beyond the generic "SaaS template" by utilizing sophisticated tonal layering, intentional asymmetry, and a rigorous commitment to whitespace.

The system is built on the principle of **Inherent Credibility**. We don't use aggressive shadows or loud borders to command attention; instead, we use architectural depth and refined typography to guide the user through the appeal process with the calm confidence of a senior legal clerk. By favoring background shifts over structural lines, the UI feels expansive and frictionless—essential for users dealing with the stress of a parking fine.

---

## 2. Colors

Our palette transitions from standard "utility" colors to a tiered system of depth and intention.

### The Color Logic
*   **Primary (`#00236f`):** The "Midnight Blue." Used for foundational authority and primary navigation.
*   **Secondary (`#0051d5`):** The "Action Blue." Reserved for interactive momentum.
*   **Tertiary (`#735c00`):** The "Refined Gold." A sophisticated evolution of the brand yellow, used for highlighting critical status and premium accents without sacrificing readability.

### Strategic Rules
*   **The "No-Line" Rule:** 1px solid borders for sectioning are strictly prohibited. Layout boundaries must be defined solely through color shifts. Use `surface-container-low` for secondary sections and `surface-container-high` for callouts. 
*   **Surface Hierarchy & Nesting:** Treat the UI as physical layers. A `surface-container-lowest` card should sit atop a `surface-container-low` background to create a "soft lift." This nesting defines importance through tonal contrast rather than strokes.
*   **The "Glass & Gradient" Rule:** Use Glassmorphism for floating elements (like sticky headers or floating action buttons) using `surface` tokens with a 70-80% opacity and a `backdrop-filter: blur(12px)`. 
*   **Signature Textures:** Main CTAs or Hero sections should employ subtle linear gradients (e.g., `primary` to `primary-container` at 135 degrees) to add a tactile, "premium paper" feel that flat hex codes cannot achieve.

---

## 3. Typography

The typography system uses **Inter** to convey modern precision. The hierarchy is designed to feel like a well-structured legal document—authoritative yet accessible.

*   **Display (LG/MD/SM):** Set at -0.02em letter spacing. Used for "Hero" moments. It should feel massive and undeniable.
*   **Headline (LG/MD/SM):** Bold weights (700) for section titles. Use these to anchor the page; their weight provides the visual "gravity" that replaces traditional dividers.
*   **Title (LG/MD/SM):** Medium weights (500-600) for card titles and form headers. 
*   **Body (LG/MD/SM):** Regular weight (400) with generous line-height (1.6) for readability. This provides the "breathing room" required for complex legal text.
*   **Labels (MD/SM):** Monospace elements (`ui-monospace`) are reserved for "Reference Numbers" or "Contravention Codes" to provide a technical, "data-accurate" feel.

---

## 4. Elevation & Depth

We eschew the "drop shadow" of 2010. Depth in this system is organic and atmospheric.

*   **The Layering Principle:** Use the `surface-container` tiers (Lowest to Highest) to stack information.
    *   *Base:* `surface`
    *   *Section:* `surface-container-low`
    *   *Floating Card:* `surface-container-lowest`
*   **Ambient Shadows:** When a "floating" effect is mandatory, use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(18, 28, 40, 0.06)`. Note the use of the `on-surface` color (`#121c28`) for the shadow tint to keep it natural.
*   **The "Ghost Border" Fallback:** If accessibility requires a container edge, use the `outline-variant` token at 15% opacity. It should be felt, not seen.
*   **Glassmorphism:** For overlays, use a semi-transparent `surface-container-lowest` with a `backdrop-blur`. This ensures the UI feels like a single, cohesive environment rather than disparate parts.

---

## 5. Components

### Buttons
*   **Primary:** `primary` background with a subtle gradient to `primary-container`. `lg` corner radius (`0.5rem`). High-contrast `on-primary` text.
*   **Secondary:** `surface-container-highest` background. No border. These should feel like part of the surface.
*   **Tertiary:** Text-only with a slight `secondary` color tint. Used for "Cancel" or "Back" actions.

### Cards & Lists
*   **Rule:** Zero divider lines. 
*   **Implementation:** Use a `16` (4rem) spacing scale between list items or shift the background of alternating items to `surface-container-low`. Cards use the `xl` (`0.75rem`) radius for a softer, more professional touch.

### Input Fields
*   **Visual State:** Background set to `surface-container-lowest` with a "Ghost Border." On focus, the border transitions to a 2px `secondary` stroke. 
*   **Validation:** Error states use `error` text and a `error-container` background glow—never just a red border.

### Additional Signature Components
*   **Progress Stepper:** A bespoke "Glass Trace" line. Use a thick `surface-container-highest` bar with a `secondary` gradient fill to indicate progress through the appeal generation.
*   **The "Evidence Slot":** A dedicated drop zone for photos of tickets. Use a `surface-container-low` dashed "Ghost Border" to invite interaction without cluttering the visual field.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical margins (e.g., 60/40 splits) to create an editorial, "magazine" feel for long-form content.
*   **Do** leverage the `tertiary-fixed` yellow for "High-Importance Notice" banners to ensure urgency is conveyed through color, not icons alone.
*   **Do** prioritize vertical whitespace. If a section feels cramped, double the spacing token (e.g., move from `8` to `16`).

### Don't
*   **Don't** use pure black (`#000000`) for text. Always use `on-surface` (`#121c28`) to maintain the "Midnight Blue" brand depth.
*   **Don't** use 1px dividers to separate form fields. Group them with logic and whitespace.
*   **Don't** use "Standard Blue" for links. Use `secondary` with a 2px underline offset to maintain the premium typographic feel.
*   **Don't** use sharp corners. Every component must use at least the `md` (`0.375rem`) radius to maintain the "Helpful & Straightforward" brand personality.