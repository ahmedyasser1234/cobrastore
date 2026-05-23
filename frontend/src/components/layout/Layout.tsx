import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import CompareModal from '../ui/CompareModal';
import { useCompareStore } from '../../store/useCompareStore';
import { Scale } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  opaqueNavbar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, opaqueNavbar }) => {
  const { items, setCompareOpen } = useCompareStore();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar opaque={opaqueNavbar} />
      <CartDrawer />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />

      {/* Compare Floating Button */}
      {items.length > 0 && (
        <button 
          onClick={() => setCompareOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-primary hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        >
          <div className="relative">
            <Scale size={24} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-900">
              {items.length}
            </span>
          </div>
        </button>
      )}

      <CompareModal />
    </div>
  );
};

export default Layout;
