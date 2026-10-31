# Implementation Plan: Montante PDV - Facebook Auto-Publishing Module

## Project Overview
Implementing a complete Facebook auto-publishing system for Montante PDV using Meta Graph API v26.0. This is a greenfield Next.js 14+ project with TypeScript, TailwindCSS, and Meta Graph API integration.

**Stack:** Next.js 14+ (App Router), TypeScript, TailwindCSS, Meta Graph API v26.0

---

## Implementation Steps

- [ ] 1. **Initialize Next.js project with TypeScript and create package.json**
      Create a new Next.js 14 project with TypeScript, configure package.json with all required dependencies: next@14, react@18, react-dom@18, typescript, tailwindcss, postcss, autoprefixer, and all @types packages.
      Files: package.json
      Verify: `npm install` completes successfully without errors

- [ ] 2. **Create TypeScript configuration (tsconfig.json)**
      Configure TypeScript with Next.js 14 defaults, enable strict mode, set path aliases (@/* -> src/*), include app router types, and configure module resolution for ESNext.
      Files: tsconfig.json
      Verify: TypeScript configuration is valid - no syntax errors when opening any .ts file

- [ ] 3. **Configure TailwindCSS (tailwind.config.ts, postcss.config.js)**
      Set up TailwindCSS with content paths for src/app/**/*.{js,ts,jsx,tsx,mdx} and src/components/**/*.{js,ts,jsx,tsx,mdx}. Configure theme extensions for custom colors if needed. Create PostCSS config.
      Files: tailwind.config.ts, postcss.config.js
      Verify: TailwindCSS configuration is valid - `npx tailwindcss -i ./src/app/globals.css -o ./dist/test.css` runs without errors

- [ ] 4. **Create Next.js configuration (next.config.js) and .gitignore**
      Create minimal Next.js config with TypeScript support. Create .gitignore with node_modules, .next, .env.local, out, dist, and other common patterns.
      Files: next.config.js, .gitignore
      Verify: Configuration files are valid - no syntax errors

- [ ] 5. **Create environment configuration files (.env.example, .env.local)**
      Create .env.example with META_PAGE_ID and META_PAGE_ACCESS_TOKEN as placeholders with comments explaining how to obtain them. Create .env.local with META_PAGE_ID="1416962368160245" and META_PAGE_ACCESS_TOKEN="<O_TEU_PAGE_ACCESS_TOKEN_AQUI>".
      Files: .env.example, .env.local
      Verify: Files exist and contain correct variable names

- [ ] 6. **Create TypeScript interfaces and types (src/types/facebook.ts)**
      Define FacebookPostRequest interface with message (string) and optional link (string). Define FacebookPostResponse interface with id (string). Define FacebookError interface with message, type, code, fbtrace_id. Define FacebookApiError interface wrapping error. Create type guard function isFacebookApiError(response: unknown): response is FacebookApiError.
      Files: src/types/facebook.ts
      Verify: `npx tsc --noEmit` passes without errors in this file

- [ ] 7. **Implement Facebook service (src/services/facebook.ts)**
      Create publishToFacebook function that accepts message (string) and optional link (string). Function makes POST request to https://graph.facebook.com/v26.0/${META_PAGE_ID}/feed with body containing message, link (if provided), and access_token. Returns Promise<{ success: true; postId: string } | { success: false; error: string }>. Handle all Meta Graph API errors using type guards. Support emojis and line breaks in message content. Use fetch API with proper headers (Content-Type: application/json).
      Files: src/services/facebook.ts
      Verify: `npx tsc --noEmit` passes without errors in this file

- [ ] 8. **Create API route handler (src/app/api/marketing/publish-facebook/route.ts)**
      Implement POST handler using Next.js 14 Route Handler pattern. Validate request has Authorization header or check environment variable for simple auth. Parse request body as JSON expecting { message: string, link?: string }. Validate message is not empty. Call publishToFacebook service. Return JSON response with appropriate status codes: 200 for success with { success: true, postId }, 400 for invalid request with { success: false, error }, 401 for unauthorized with { success: false, error }, 500 for server errors with { success: false, error }.
      Files: src/app/api/marketing/publish-facebook/route.ts
      Verify: `npx tsc --noEmit` passes without errors in this file

- [ ] 9. **Create utility functions (src/lib/utils.ts)**
      Create cn function for merging classnames (use clsx or custom implementation). Create formatDate function for timestamp formatting. Create other common utilities as needed.
      Files: src/lib/utils.ts
      Verify: `npx tsc --noEmit` passes without errors in this file

- [ ] 10. **Create Button UI component (src/components/ui/Button.tsx)**
      Create reusable Button component with TypeScript. Support variants: primary (blue bg), secondary (gray bg), danger (red bg). Support disabled and loading states. When loading=true, show spinner icon and disable interaction. Accept className for additional styling. Use forwardRef for ref forwarding. Export as default.
      Files: src/components/ui/Button.tsx
      Verify: `npx tsc --noEmit` passes without errors in this file

- [ ] 11. **Create Textarea UI component (src/components/ui/Textarea.tsx)**
      Create styled Textarea component with label support. Show character counter at bottom right. Accept maxLength prop (default 5000). Accept value, onChange, placeholder, disabled props. Use TailwindCSS for styling with focus states. Export as default.
      Files: src/components/ui/Textarea.tsx
      Verify: `npx tsc --noEmit` passes without errors in this file

- [ ] 12. **Create Alert UI component (src/components/ui/Alert.tsx)**
      Create Alert component with variants: success (green), error (red), warning (yellow), info (blue). Accept title and message props. Include appropriate icons for each variant (✓ for success, ✕ for error, ⚠ for warning, ℹ for info). Use TailwindCSS for styling. Export as default.
      Files: src/components/ui/Alert.tsx
      Verify: `npx tsc --noEmit` passes without errors in this file

- [ ] 13. **Create TemplateButtons component (src/components/marketing/TemplateButtons.tsx)**
      Create component that renders 4 buttons with pre-configured templates. Templates: 1) "Alerta de Estoque" with message "🚨 Atenção! Alguns produtos estão com stock baixo. Reponha agora para não perder vendas! 📦", 2) "Ordem de Serviço" with "🔧 Manutenção programada! Nosso sistema estará ainda melhor em breve. Agradecemos a compreensão! ⚙️", 3) "Abertura de Caixa" with "✅ Caixa aberto! Estamos prontos para atender você com o melhor sistema de PDV. 💼", 4) "Promoção Trial" with "🎉 Experimente o Montante GRÁTIS por 3 meses! Sistema completo de PDV para o seu negócio. Teste agora! 🚀". Accept onTemplateSelect callback prop that receives the template message. Use grid layout for responsive design. Export as default.
      Files: src/components/marketing/TemplateButtons.tsx
      Verify: `npx tsc --noEmit` passes without errors in this file

- [ ] 14. **Create PostPreview component (src/components/marketing/PostPreview.tsx)**
      Create component that simulates Facebook post appearance. Accept message and optional link props. Display "Montante - PDV" as page name with a placeholder avatar. Show formatted message with line breaks preserved. If link provided, show it as a card at the bottom. Use TailwindCSS to style like a Facebook post (white background, rounded borders, padding, shadow). Show current timestamp. Export as default.
      Files: src/components/marketing/PostPreview.tsx
      Verify: `npx tsc --noEmit` passes without errors in this file

- [ ] 15. **Create global styles (src/app/globals.css)**
      Import TailwindCSS base, components, and utilities. Add custom global styles for body (background color, text color, font). Ensure proper CSS reset and base styles.
      Files: src/app/globals.css
      Verify: CSS file has valid syntax

- [ ] 16. **Create root layout (src/app/layout.tsx)**
      Create RootLayout component with proper metadata (title: "Montante PDV - Marketing", description: "Sistema de publicação automática no Facebook"). Import globals.css. Use Inter font from next/font/google. Include proper HTML lang="pt" attribute. Export metadata and default RootLayout.
      Files: src/app/layout.tsx
      Verify: `npx tsc --noEmit` passes without errors in this file

- [ ] 17. **Create home page (src/app/page.tsx)**
      Create simple landing page that redirects to /marketing or shows a welcome message with a link to the marketing dashboard. Use Next.js Link component. Style with TailwindCSS (centered content, modern design).
      Files: src/app/page.tsx
      Verify: `npx tsc --noEmit` passes without errors in this file

- [ ] 18. **Create marketing dashboard page (src/app/marketing/page.tsx)**
      Create "use client" page component that implements the complete marketing interface. Include: page title and description, TemplateButtons component with handler to fill textarea, controlled Textarea for post message, optional text input for link URL, real-time PostPreview, "Publicar no Facebook Agora" button with loading state, Alert component to show success (with postId) or error messages. Implement fetch to /api/marketing/publish-facebook with proper error handling. Use useState for message, link, loading, and alert states. Responsive layout with TailwindCSS (max-w-4xl container, grid for sections). Export as default.
      Files: src/app/marketing/page.tsx
      Verify: `npx tsc --noEmit` passes without errors in this file

- [ ] 19. **Create README.md documentation**
      Write comprehensive README in Portuguese with sections: 1) Descrição do Projeto (what is Montante PDV Facebook integration), 2) Requisitos (Node.js 18+, npm/yarn, Meta Developer account, Facebook Page), 3) Instalação (clone, npm install, env setup), 4) Como Obter o Page Access Token (step-by-step guide: create app in Meta Developer Console, add Facebook Login product, generate User Access Token with pages_manage_posts and pages_read_engagement permissions, use Graph API Explorer to get long-lived token, get Page Access Token from /{page-id}?fields=access_token), 5) Configuração das Variáveis de Ambiente (copy .env.example to .env.local, fill in values), 6) Como Usar (npm run dev, navigate to /marketing, select template or write custom message, publish), 7) Estrutura de Pastas (tree view of src/), 8) Endpoints da API (POST /api/marketing/publish-facebook with request/response examples), 9) Tecnologias Utilizadas (Next.js, TypeScript, TailwindCSS, Meta Graph API v26.0).
      Files: README.md
      Verify: File exists and contains all required sections

- [ ] 20. **Create checklist.md**
      Create implementation checklist with status tracking. Include items: Project initialization ✓, TypeScript configuration ✓, TailwindCSS setup ✓, Environment variables ✓, Type definitions ✓, Facebook service implementation ✓, API route implementation ✓, UI components (Button, Textarea, Alert) ✓, Marketing components (TemplateButtons, PostPreview) ✓, Pages (home, marketing dashboard) ✓, Documentation ✓, Build test ⏳, Manual test with real token ⏳, Production deployment ⏳.
      Files: checklist.md
      Verify: File exists with proper markdown checklist format

- [ ] 21. **Run TypeScript compilation check**
      Execute TypeScript compiler in noEmit mode to verify all TypeScript files are valid and have no type errors across the entire project.
      Files: (all .ts/.tsx files)
      Verify: `npx tsc --noEmit` completes with exit code 0 and no errors

- [ ] 22. **Run production build**
      Execute Next.js production build to verify the entire application builds successfully without errors. This validates all pages, API routes, components, and configurations are correct.
      Files: (entire project)
      Verify: `npm run build` completes successfully with exit code 0, .next directory is created with optimized bundles

---

## Verification Strategy

After completing all steps, the following verifications should be performed:

1. **Build Verification:** `npm run build` must complete without errors
2. **Type Safety:** `npx tsc --noEmit` must pass without type errors
3. **Development Server:** `npm run dev` should start on port 3000
4. **Route Accessibility:** http://localhost:3000/marketing should render the marketing dashboard
5. **Manual API Test:** Use Postman/curl to POST to http://localhost:3000/api/marketing/publish-facebook with valid credentials and verify post creation on Facebook
6. **Template Functionality:** Click each template button and verify textarea populates correctly
7. **Preview Functionality:** Type in textarea and verify PostPreview updates in real-time
8. **Success Flow:** With valid META_PAGE_ACCESS_TOKEN, publish a test post and verify success alert with postId
9. **Error Handling:** With invalid token, verify error alert displays appropriate message

---

## Dependencies Summary

**Production:**
- next@^14.0.0
- react@^18.0.0
- react-dom@^18.0.0
- typescript@^5.0.0

**Development:**
- @types/node@^20.0.0
- @types/react@^18.0.0
- @types/react-dom@^18.0.0
- tailwindcss@^3.4.0
- postcss@^8.4.0
- autoprefixer@^10.4.0

---

## Notes

- This is a greenfield project starting from an empty workspace
- All paths use the src/ directory structure as per Next.js 14+ conventions
- The implementation follows Next.js App Router patterns (not Pages Router)
- Authentication in the API route is simplified (basic header check) - can be enhanced later with proper auth middleware
- The Page Access Token must be obtained manually from Meta Developer Console before testing
- Error messages from Meta Graph API are properly formatted and displayed to the user
- All text is in Portuguese as per the original request
- The project structure allows for future expansion (additional social media integrations, scheduled posts, etc.)
