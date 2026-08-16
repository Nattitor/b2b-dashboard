# ✦ Nattitor | B2B Metrics Dashboard

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
</div>

<br />

<div align="center">
  <img src="./public/preview.png" alt="Nattitor B2B Dashboard Preview" width="100%" style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);" />
  <br />
  <sub><em>Live Demo: <a href="https://nattitor-dashboard.vercel.app/" target="_blank">nattitor-dashboard.vercel.app</a></em></sub>
</div>

<br />

A highly optimized, brutally aesthetic B2B analytics dashboard built with modern web technologies. Designed to deliver a premium, native-app-like experience for enterprise metrics visualization on both desktop and mobile devices.

## 🚀 Features

- **Brutalist Glassmorphism UI:** Custom-built glass panels with deep blurs, JetBrains Mono typography, and Vega Cyan accents.
- **Server-Side Pagination:** Highly performant ledger table with server-first state management via URL `searchParams`.
- **Flawless Mobile Experience:** Interactive elements tailored specifically for touch screens, completely eliminating the "fake hover" syndrome.
- **Advanced Animations:** Fluid physics, layout transitions, and intersection observers powered by Framer Motion.
- **Data Visualization:** Interactive area charts with Recharts, customized to eliminate mobile tap highlight artifacts.

## 🛠️ Architecture & Tech Stack

This project is built using the App Router in **Next.js 15**.

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS v4 (with custom `@theme` variables)
- **Animations:** Framer Motion (Hardware-accelerated)
- **Charts:** Recharts
- **Icons:** Lucide React

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nattitor/b2b-dashboard.git
   cd b2b-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment

This project is optimized for deployment on [Vercel](https://vercel.com).

1. Push your code to a GitHub repository.
2. Import the repository into Vercel.
3. Add the Supabase environment variables in the Vercel project settings.
4. Vercel will automatically detect Next.js and configure the build settings.
5. Deploy!

## 📜 License

Designed and developed by [Freddy Guerra (Nattitor)](https://github.com/Nattitor). All rights reserved.
