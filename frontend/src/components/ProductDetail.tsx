import React, { useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import { toast } from 'react-hot-toast';
import { ShoppingCart } from 'lucide-react';

interface ProductDetailProps {
  product: any;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (product.variations?.length > 0 && !selectedVariation) {
      toast.error('Please select a variation');
      return;
    }

    addItem({
      productId: product.id,
      variationId: selectedVariation?.id,
      name: product.name,
      price: selectedVariation ? selectedVariation.price : product.basePrice,
      quantity,
      image: product.images?.[0]?.imageUrl,
      attributes: selectedVariation?.attributes
    });

    toast.success('Added to cart!');
  };

  const currentPrice = selectedVariation ? selectedVariation.price : product.basePrice;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-7xl mx-auto p-6">
      <div className="space-y-4">
        <div className="aspect-square bg-white rounded-elkoko overflow-hidden border border-gray-100">
          <img 
            src={product.images?.[0]?.imageUrl || 'https://via.placeholder.com/600'} 
            className="w-full h-full object-cover"
            alt={product.name}
          />
        </div>
        <div className="flex gap-4">
          {product.images?.map((img: any) => (
            <div key={img.id} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 cursor-pointer">
              <img src={img.imageUrl} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-primary font-semibold mt-2">Vendor: {product.vendor?.storeName}</p>
        </div>

        <div className="text-4xl font-bold text-gray-900">${currentPrice}</div>

        <div className="prose text-gray-600 max-w-none">
          {product.description}
        </div>

        {product.variations?.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Choose Option</h3>
            <div className="flex flex-wrap gap-2">
              {product.variations.map((v: any) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariation(v)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    selectedVariation?.id === v.id 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {Object.values(v.attributes).join(' / ')}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-6 pt-6 border-t border-gray-100">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-2 hover:bg-gray-50 border-r border-gray-200"
            >-</button>
            <span className="px-6 py-2 font-medium">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="px-4 py-2 hover:bg-gray-50 border-l border-gray-200"
            >+</button>
          </div>

          <button onClick={handleAddToCart} className="btn-primary flex-1">
            <ShoppingCart size={20} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
