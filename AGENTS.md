## Project Summary
A restaurant order management system ("Bheed Control") designed to reduce crowding by allowing customers to scan a QR code, browse the menu, and place orders from their mobile devices. The system generates automatic tokens and provides real-time status updates for both customers and staff.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database/Auth**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management**: React Context (Cart)
- **Notifications**: Sonner

## Architecture
- `src/app/`: Contains all routes (Home, Menu, Checkout, Order Status, Admin Dashboard)
- `src/components/`: Reusable UI components (using shadcn/ui patterns)
- `src/lib/`: Database client, Context providers, and utility functions
- `src/types/`: TypeScript interfaces for the domain model

## User Preferences
- Clean, modern UI with orange accents (food-focused)
- Real-time updates for order tracking
- No-registration flow for customers to reduce friction

## Project Guidelines
- Use relative URLs for client-side API calls
- Real-time subscriptions for order status updates
- Mobile-first design for customer-facing pages
- Dark-themed high-contrast dashboard for kitchen staff

## Common Patterns
- **Database Access**: Use `@supabase/supabase-js` for all data operations.
- **Real-time**: Use Supabase Realtime for order status updates (`supabase.channel`).
- **Cart**: Global state via `CartProvider` in `src/lib/CartContext.tsx`.
