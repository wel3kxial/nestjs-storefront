'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productsApi, cartApi } from '@/lib/api';
import { Product, Price } from '@/types';
import { isAuthenticated } from '@/lib/auth';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<Price | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true);
      const data = await productsApi.getProduct(id);
      setProduct(data);
      const activePrice = data.prices.find(p => p.isActive) || data.prices[0];
      setSelectedPrice(activePrice);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    if (!product || !selectedPrice) return;

    try {
      setAddingToCart(true);
      
      // First, try to get existing cart or create a new one
      let cart;
      try {
        cart = await cartApi.getCart();
      } catch {
        cart = await cartApi.createCart();
      }

      await cartApi.addToCart(cart.id, {
        productId: product.id,
        priceId: selectedPrice.id,
        quantity,
      });

      // Show success message or redirect to cart
      alert('Product added to cart!');
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading product...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'Product not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              {product.media && product.media.length > 0 ? (
                <img
                  src={product.media[0].url}
                  alt={product.media[0].alt || product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <div className="text-6xl mb-4">📦</div>
                  <div>No Image Available</div>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                  {getProductTypeLabel(product.type)}
                </span>
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              </div>

              <p className="text-gray-600 text-lg leading-relaxed">
                {product.description}
              </p>

              {/* Price Selection */}
              {product.prices.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Price Option
                  </label>
                  <div className="space-y-2">
                    {product.prices.filter(p => p.isActive).map((price) => (
                      <label key={price.id} className="flex items-center">
                        <input
                          type="radio"
                          name="price"
                          value={price.id}
                          checked={selectedPrice?.id === price.id}
                          onChange={() => setSelectedPrice(price)}
                          className="mr-2"
                        />
                        <span>{formatPrice(price.unitAmount, price.currency)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Price and Add to Cart */}
              <div className="border-t pt-6">
                {selectedPrice && (
                  <div className="text-3xl font-bold text-gray-900 mb-4">
                    {formatPrice(selectedPrice.unitAmount * quantity, selectedPrice.currency)}
                  </div>
                )}
                
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || !selectedPrice}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md text-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}