# Integrating React & Shadcn Components in California Project

Your current codebase is a static, high-performance HTML/CSS/JavaScript landing page structure. To use React, Tailwind CSS, Typescript, and Shadcn UI, you need to set up a React application environment.

Here are the step-by-step instructions to initialize a shadcn project, configure Tailwind/TypeScript, and integrate the `stagger-testimonials.tsx` component.

---

## 1. Setup a React Project with Tailwind & TypeScript

We recommend using **Vite** or **Next.js**. Here is how to initialize it via Vite:

### Step A: Initialize Vite with React + TS
Run the following command in your terminal:
```bash
npm create vite@latest california-react -- --template react-ts
cd california-react
```

### Step B: Install Tailwind CSS
Install Tailwind and its peer dependencies, then generate configuration files:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step C: Configure Tailwind Paths
Update `tailwind.config.js` to scan for React files:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add the Tailwind directives to your main CSS file (`src/index.css`):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 2. Initialize Shadcn UI CLI

Shadcn UI operates on a components-based CLI that initializes the required folders and standard Tailwind themes.

Run the shadcn initialization command:
```bash
npx shadcn@latest init
```

### Prompt Configuration Choices:
* **Style:** Default
* **Base color:** Slate / Zinc
* **CSS variables:** Yes
* **TypeScript:** Yes (configured automatically from Vite TS template)
* **components.json paths:** Keep defaults (configured in `@/components` and `@/lib/utils`)

---

## 3. Why the Default Path `/components/ui` is Important

When initializing shadcn, it creates a folder configuration inside `components.json`:
```json
{
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

### Importance of `/components/ui`:
1. **Automation:** The CLI command (e.g., `npx shadcn@latest add button`) automatically writes code files directly into `components/ui/button.tsx`. If this directory doesn't exist, the CLI will error or fragment components.
2. **Path Aliasing:** Import statements like `import { cn } from "@/lib/utils"` and `import { Button } from "@/components/ui/button"` use TypeScript/Vite compiler aliases. Keeping files in `/components/ui` ensures imports remain clean, predictable, and refactor-safe.
3. **Separation of Concerns:** It separates reusable low-level primitives (buttons, inputs, dialogues in `/components/ui`) from feature-specific application blocks (like `/components/Hero.tsx` or `/components/Testimonials.tsx`).

---

## 4. Install Component Dependencies

The stagger testimonials component relies on `lucide-react` for navigation arrows and `clsx`/`tailwind-merge` (encapsulated under the `cn` utility) for dynamic classes:
```bash
npm install lucide-react clsx tailwind-merge
```

---

## 5. Component Files Placed in Work Space

We have automatically created the folder structure and written the component files inside your workspace:
* **Component Code:** `components/ui/stagger-testimonials.tsx`
* **Demo Page Usage:** `components/ui/demo.tsx`

Once you run the Vite server, you can import and mount the `<DemoOne />` or `<StaggerTestimonials />` component inside your React pages.
