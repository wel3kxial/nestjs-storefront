'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { Product } from '@/types';
import AdminLayout from '@/components/AdminLayout';
import CreateProductModal from '@/components/CreateProductModal';
import EditProductModal from '@/components/EditProductModal';
import DeleteProductModal from '@/components/DeleteProductModal';
import { Search, Filter, Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllProducts();
      setProducts(data);
      setError(''); // Clear any previous errors
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (productData: {
    name: string;
    description: string;
    type: string;
    isActive: boolean;
    startTime?: string;
    duration?: number;
    address?: string;
  }) => {
    setActionLoading(true);
    try {
      await adminApi.createProduct(productData);
      await fetchProducts(); // Refresh the products list
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
      throw err; // Re-throw to let modal handle it
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditProduct = async (productData: {
    name: string;
    description: string;
    type: string;
    isActive: boolean;
    startTime?: string;
    duration?: number;
    address?: string;
  }) => {
    if (!selectedProduct) return;
    
    setActionLoading(true);
    try {
      await adminApi.updateProduct(selectedProduct.id, productData);
      await fetchProducts(); // Refresh the products list
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
      throw err; // Re-throw to let modal handle it
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    setActionLoading(true);
    try {
      await adminApi.deleteProduct(selectedProduct.id);
      await fetchProducts(); // Refresh the products list
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
      throw err; // Re-throw to let modal handle it
    } finally {
      setActionLoading(false);
      setSelectedProduct(null);
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedProduct(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedProduct(null);
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DIGITAL':
        return 'bg-blue-100 text-blue-800';
      case 'OFFLINE_SERVICE':
        return 'bg-green-100 text-green-800';
      case 'ONLINE_CONSULTING':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DIGITAL':
        return '💻';
      case 'OFFLINE_SERVICE':
        return '🏃‍♂️';
      case 'ONLINE_CONSULTING':
        return '💬';
      default:
        return '📦';
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      (product.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (product.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === '' || product.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const typeOptions = ['DIGITAL', 'OFFLINE_SERVICE', 'ONLINE_CONSULTING'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
            <p className="text-gray-600">Manage all products in the system</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Types</option>
                {typeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Products Grid */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">Loading products...</div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">No products found</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(product.type)}`}>
                      <span className="mr-1">{getTypeIcon(product.type)}</span>
                      {product.type}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-gray-400 hover:text-indigo-600"
                        title="Edit product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(product)}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name || 'Untitled Product'}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {product.description || 'No description available'}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    {product.prices && product.prices.length > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Price:</span>
                        <span className="font-medium">
                          {formatPrice(product.prices[0].unitAmount, product.prices[0].currency)}
                        </span>
                      </div>
                    )}
                    
                    {/* Scheduling info for ONLINE_CONSULTING */}
                    {product.type === 'ONLINE_CONSULTING' && (product.startTime || product.duration) && (
                      <>
                        {product.startTime && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Start Time:</span>
                            <span className="text-xs text-gray-600">
                              {new Date(product.startTime).toLocaleString()}
                            </span>
                          </div>
                        )}
                        {product.duration && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Duration:</span>
                            <span className="text-xs text-gray-600">
                              {product.duration} min
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Created:</span>
                      <span className="text-xs text-gray-600">
                        {formatDate(product.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Total Products</div>
            <div className="text-2xl font-bold text-gray-900">{products.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Digital</div>
            <div className="text-2xl font-bold text-blue-600">
              {products.filter(p => p.type === 'DIGITAL').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Services</div>
            <div className="text-2xl font-bold text-green-600">
              {products.filter(p => p.type === 'OFFLINE_SERVICE').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Consulting</div>
            <div className="text-2xl font-bold text-purple-600">
              {products.filter(p => p.type === 'ONLINE_CONSULTING').length}
            </div>
          </div>
        </div>

        {/* Modals */}
        <CreateProductModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProduct}
          loading={actionLoading}
        />

        <EditProductModal
          isOpen={showEditModal}
          onClose={closeEditModal}
          onSubmit={handleEditProduct}
          loading={actionLoading}
          product={selectedProduct}
        />

        <DeleteProductModal
          isOpen={showDeleteModal}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteProduct}
          loading={actionLoading}
          product={selectedProduct}
        />
      </div>
    </AdminLayout>
  );
}