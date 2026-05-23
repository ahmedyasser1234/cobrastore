import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Search, Filter, ChevronRight } from 'lucide-react';

const ProductCatalog: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', search, category, priceRange],
    queryFn: async () => {
      const { data } = await api.get('/products', {
        params: { search, category, minPrice: priceRange[0], maxPrice: priceRange[1] }
      });
      return data;
    }
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data } = await api.get('/departments');
      return data;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Departments</h3>
          <div className="space-y-2">
            {departments?.map((dept: any) => (
              <div key={dept.id}>
                <button className="flex items-center justify-between w-full text-left text-text-sub hover:text-primary transition-colors">
                  {dept.name}
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Price Range</h3>
          <input 
            type="range" 
            min="0" 
            max="1000" 
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
            className="w-full accent-primary" 
          />
          <div className="flex justify-between text-sm text-text-sub mt-2">
            <span>$0</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-sub" size={20} />
          <input 
            type="text"
            placeholder="Search products..."
            className="input-field pl-12 h-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-80 bg-gray-100 rounded-elkoko animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products?.items.map((product: any) => (
              <div key={product.id} className="card group">
                <div className="aspect-square rounded-lg overflow-hidden mb-4 relative">
                  <img 
                    src={product.images?.[0]?.imageUrl || 'https://via.placeholder.com/300'} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    alt={product.name}
                  />
                  {product.isFeatured && (
                    <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full font-medium">
                      Featured
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-lg mb-1">{product.name}</h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase font-bold tracking-wider">
                    {product.department?.name}
                  </span>
                  <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded text-primary uppercase font-bold tracking-wider">
                    {product.vendorCategory?.name}
                  </span>
                </div>
                <p className="text-text-sub text-sm mb-1 font-medium">Store: {product.vendor?.storeName}</p>
                <p className="text-[10px] text-slate-400 italic mb-3">Collection: {product.vendorCollection?.name}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xl font-bold text-primary">${product.basePrice}</span>
                  <button className="bg-primary/10 text-primary p-2 rounded-full hover:bg-primary hover:text-white transition-all">
                    <Filter size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductCatalog;
