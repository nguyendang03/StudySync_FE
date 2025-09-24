import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // Routes that should NOT have Header and Footer (auth pages)
  const authRoutes = ['/login', '/register', '/forgot-password'];
  
  // Check if current route is an auth route
  const isAuthRoute = authRoutes.includes(location.pathname);
  
  // If it's an auth route, render children without Header/Footer
  if (isAuthRoute) {
    return <>{children}</>;
  }
  
  // For all other routes, render with Header and Footer
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

export default Layout;