import Link from 'next/link';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryPrice = product.prices.find(p => p.isActive) || product.prices[0];
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getProductTypeLabel = (type: string) => {
    switch (type) {
      case 'DIGITAL':
        return 'Digital Product';
      case 'OFFLINE_SERVICE':
        return 'Service';
      case 'ONLINE_CONSULTING':
        return 'Consulting';
      default:
        return type;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        {product.media && product.media.length > 0 ? (
          <img
            src={product.media[0].url}
            alt={product.media[0].alt || product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400 text-center">
            <div className="text-4xl mb-2">📦</div>
            <div>No Image</div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2 whitespace-nowrap">
            {getProductTypeLabel(product.type)}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {product.description}
        </p>
        
        <div className="flex justify-between items-center">
          {primaryPrice && (
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(primaryPrice.unitAmount, primaryPrice.currency)}
            </span>
          )}
          
          <Link
            href={`/products/${product.id}`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}