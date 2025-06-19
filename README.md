# 🌍 Aion Country Explorer

A modern, performant Next.js application for exploring detailed information about countries around the world. Built with Next.js 14, TypeScript, Tailwind CSS, and Zustand for optimal performance and user experience.

## ✨ Features

- 🗺️ **Explore 250+ Countries** - Comprehensive country data from REST Countries API
- 🔍 **Real-time Search & Filtering** - Search by name and filter by region with debounced input
- ⭐ **Favorites Management** - Save favorite countries with local persistence
- 🔐 **Protected Routes** - Mock authentication with route protection
- 📱 **Fully Responsive Design** - Modern UI that works on all devices
- ⚡ **Static Site Generation** - Pre-rendered pages for optimal performance
- 🎨 **Modern UI/UX** - Beautiful glassmorphism design with smooth animations
- 🌙 **Dark Mode Support** - Automatic theme detection with manual toggle
- 📊 **Virtualized Lists** - Efficient rendering of large datasets
- 🔄 **Error Boundaries** - Graceful error handling and recovery
- 🚀 **Progressive Enhancement** - Works with JavaScript disabled

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aion-country-explorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🔐 Authentication Credentials

The application uses mock authentication for demonstration purposes:

- **Username:** `testuser`
- **Password:** `password123`

> **Note:** These credentials are hardcoded for demo purposes. In a real application, this would be replaced with proper authentication service integration.

### Authentication Flow
1. Navigate to `/login` page
2. Enter credentials above
3. Successful login redirects to home page
4. Protected routes (`/favorites`) require authentication
5. Logout clears session and redirects to login

## 🏗️ Architecture & Design Choices

### Static Site Generation (SSG) Strategy

**Why SSG was chosen:**
- **Performance:** Pre-rendered pages load instantly (250+ Country Data)
- **Scalability:** Reduced server load with static assets (Virtualization Use)
- **User Experience:** Faster Time to First Contentful Paint (TTCP)
- **SEO Benefits:** Better search engine indexing with pre-rendered content
- **CDN Optimization:** Static files can be cached at edge locations

**Implementation Details:**
- **Homepage (`/`):** Uses `getAllCountries()` at build time to fetch all countries
- **Country Details (`/country/[id]`):** Uses `generateStaticParams()` to pre-render all 250+ country pages
- **API Integration:** REST Countries API data is fetched once during build and validated with Zod schemas
- **Incremental Static Regeneration (ISR):** Can be configured for data updates without full rebuilds

**SSG vs SSR Trade-offs:**
- **Chose SSG** because country data is relatively static and doesn't change frequently
- **Benefits:** Faster loading, better caching, reduced API calls
- **Trade-off:** Build time increases with 250+ pages, but acceptable for this use case

### State Management Solution: Zustand

**Why Zustand was selected:**
- **Simplicity:** Minimal boilerplate compared to Redux
- **TypeScript Support:** Excellent type inference and safety
- **Bundle Size:** Lightweight (~1.2KB gzipped)
- **Persistence:** Built-in middleware for localStorage integration
- **Performance:** No unnecessary re-renders with selective subscriptions

**Store Structure:**
```typescript
interface AppState {
  isAuthenticated: boolean;
  favorites: string[];
  login: () => void;
  logout: () => void;
  toggleFavorite: (code: string) => void;
}
```

**Persistence Strategy:**
- Favorites are automatically persisted to localStorage
- Authentication state is maintained across browser sessions
- Implements Zustand's `persist` middleware for seamless data persistence

## 🎨 UI/UX Design Decisions

### Visual Design Philosophy
- **Glassmorphism:** Modern, semi-transparent design elements with backdrop blur
- **Subtle Animations:** Smooth transitions without overwhelming users (60fps target)
- **Responsive First:** Mobile-first design approach with progressive enhancement
- **Accessibility:** ARIA labels, keyboard navigation, contrast ratios (WCAG 2.1 AA)
- **Color Psychology:** Strategic use of colors for different states and actions
- **Typography Hierarchy:** Clear content structure with consistent spacing

### Performance Optimizations
- **Image Optimization:** Next.js Image component with proper sizing and lazy loading
- **Virtualization:** Implemented for handling 250+ country cards efficiently
- **Debounced Search:** 300ms delay to reduce unnecessary API calls and improve UX
- **Code Splitting:** Dynamic imports for non-critical components
- **Memoization:** React.memo and useMemo for expensive computations
- **Bundle Optimization:** Tree shaking and dead code elimination
- **Critical CSS:** Above-the-fold styles inlined for faster rendering

### User Experience Features
- **Loading States:** Skeleton components during data fetching with progressive loading
- **Error Boundaries:** Graceful error handling and recovery with retry mechanisms
- **Search Highlighting:** Visual feedback for search terms with fuzzy matching
- **Toast Notifications:** User feedback for actions with appropriate timing
- **Protected Routing:** Seamless authentication flow with redirect handling
- **Infinite Scroll:** Pagination alternative for better mobile experience
- **Keyboard Shortcuts:** Power user features for navigation and actions

### Animation System
- **Framer Motion Integration:** Smooth, performant animations
- **Page Transitions:** Consistent navigation experience
- **Micro-interactions:** Hover states, click feedback, loading animations
- **Accessibility Considerations:** Respects user's motion preferences

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── country/[id]/   # Dynamic country detail pages
│   ├── favorites/      # Favorites page (protected)
│   ├── login/          # Authentication page
│   └── layout.tsx      # Root layout with global styles
├── components/         # Reusable components
│   ├── shared/         # Business logic components
│   └── ui/             # UI primitives and atoms
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication logic
│   ├── useDebounce.ts  # Search optimization
│   └── useTheme.ts     # Dark mode management
├── lib/                # Utility functions
│   ├── api.ts          # REST Countries API integration
│   └── validation.ts   # Zod schemas and validation
├── store/              # Zustand state management
│   └── appStore.ts     # Global application state
├── types/              # TypeScript type definitions
│   └── country.ts      # Country data interfaces
└── __tests__/          # Test files and setup
```

## 🔄 Development Workflow

### Code Quality Tools
- **ESLint:** Code linting with Next.js recommended rules
- **TypeScript:** Strict type checking
- **Prettier:** Code formatting (if configured)
- **Jest & Testing Library:** Comprehensive testing setup


## 📊 Performance Metrics


### Bundle Analysis
- **Initial Bundle:** < 200KB gzipped
- **Client-side JS:** Minimal, only for interactivity
- **Image Optimization:** WebP with fallbacks
- **Code Splitting:** Route-based and component-based

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [REST Countries API](https://restcountries.com/) for comprehensive country data
- [Next.js](https://nextjs.org/) for the excellent React framework
- [Tailwind CSS](https://tailwindcss.com/) for rapid UI development
- [Zustand](https://github.com/pmndrs/zustand) for simple state management

---

**Built with ❤️ for Aion** - Demonstrating modern web development practices and performance optimization techniques.
