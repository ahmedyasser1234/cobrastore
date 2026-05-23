import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';

interface LayoutProps {
  children: React.ReactNode;
  opaqueNavbar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, opaqueNavbar }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar opaque={opaqueNavbar} />
      <CartDrawer />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
