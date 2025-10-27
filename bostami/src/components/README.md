# Skeleton Loader Components

## Overview
The skeleton loader components provide loading states while theme configurations are being fetched from the backend. This prevents the app from showing the wrong theme before the configuration is loaded.

## Components

### 1. SkeletonLoader
General-purpose skeleton loader for most pages.

### 2. CVSkeletonLoader
CV-specific skeleton loader designed for CV-related pages (Resume, About, Home).

## Features
- **Responsive Design**: Adapts to different screen sizes
- **Theme-Aware**: Supports both light and dark modes
- **Smooth Animations**: Shimmer effects for better user experience
- **Accessible**: Proper loading indicators and text
- **Route-Aware**: Automatically chooses appropriate skeleton based on current route

## CV Skeleton Features
- **Profile Card**: Mimics the actual profile card with avatar, name, profession, social links, and contact info
- **Resume Sections**: Shows skeleton for education/experience cards and skills
- **Skills Progress**: Animated progress bars for skills section
- **Download Button**: Placeholder for CV download functionality

## Usage
The skeleton loaders are automatically shown when the `loading` state is `true` in the `AllData` hook. The system automatically chooses between:

- **CVSkeletonLoader**: For CV-related routes (`/resume`, `/about`, `/`)
- **SkeletonLoader**: For other routes (Blog, Portfolio, Contact)

## Implementation
The skeleton loaders are integrated into the `ThemedApp` component in `App.js`:

```jsx
const LoadingSkeleton = () => {
  const location = useLocation();
  const isCVRoute = location.pathname.includes('/resume') || 
                   location.pathname.includes('/about') || 
                   location.pathname === '/';
  
  return isCVRoute ? <CVSkeletonLoader /> : <SkeletonLoader />;
};

const ThemedApp = () => {
  const { activeThemeId, loading, error } = UseData();

  if (loading) {
    return <LoadingSkeleton />;
  }

  // ... rest of the component
};
```

## Styling
Both components use CSS animations and gradients to create realistic loading placeholders. They automatically adapt to the user's preferred color scheme (light/dark mode).

## Error Handling
If there's an error loading the configuration, the app will still render with the default theme and log a warning to the console.
