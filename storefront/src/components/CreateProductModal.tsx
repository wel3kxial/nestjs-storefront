'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: {
    name: string;
    description: string;
    type: string;
    isActive: boolean;
    startTime?: string;
    duration?: number;
    address?: string;
  }) => Promise<void>;
  loading: boolean;
}

export default function CreateProductModal({ isOpen, onClose, onSubmit, loading }: CreateProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'DIGITAL',
    isActive: true,
    startTime: '',
    duration: 60,
    address: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.type === 'number'
      ? Number(e.target.value)
      : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Name and description are required');
      return;
    }

    // Additional validation for ONLINE_CONSULTING
    if (formData.type === 'ONLINE_CONSULTING') {
      if (!formData.startTime) {
        setError('Start time is required for online consulting');
        return;
      }
      if (!formData.duration || formData.duration <= 0) {
        setError('Duration must be greater than 0 for online consulting');
        return;
      }
    }

    // Additional validation for OFFLINE_SERVICE
    if (formData.type === 'OFFLINE_SERVICE') {
      if (!formData.startTime) {
        setError('Start time is required for offline service');
        return;
      }
      if (!formData.duration || formData.duration <= 0) {
        setError('Duration must be greater than 0 for offline service');
        return;
      }
      if (!formData.address.trim()) {
        setError('Address is required for offline service');
        return;
      }
    }

    try {
      const submitData = formData.type === 'ONLINE_CONSULTING' || formData.type === 'OFFLINE_SERVICE'
        ? formData 
        : { 
            name: formData.name, 
            description: formData.description, 
            type: formData.type, 
            isActive: formData.isActive 
          };
      await onSubmit(submitData);
      // Reset form on success
      setFormData({
        name: '',
        description: '',
        type: 'DIGITAL',
        isActive: true,
        startTime: '',
        duration: 60,
        address: ''
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    }
  };

  const handleClose = () => {
    setError('');
    setFormData({
      name: '',
      description: '',
      type: 'DIGITAL',
      isActive: true,
      startTime: '',
      duration: 60,
      address: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Create New Product</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                disabled={loading}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                placeholder="Enter product description"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Product Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
              >
                <option value="DIGITAL">💻 Digital Product</option>
                <option value="OFFLINE_SERVICE">🏃‍♂️ Offline Service</option>
                <option value="ONLINE_CONSULTING">💬 Online Consulting</option>
              </select>
            </div>

            {/* Scheduling fields for ONLINE_CONSULTING and OFFLINE_SERVICE */}
            {(formData.type === 'ONLINE_CONSULTING' || formData.type === 'OFFLINE_SERVICE') && (
              <>
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required={formData.type === 'ONLINE_CONSULTING' || formData.type === 'OFFLINE_SERVICE'}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required={formData.type === 'ONLINE_CONSULTING' || formData.type === 'OFFLINE_SERVICE'}
                    disabled={loading}
                    min="15"
                    max="480"
                    step="15"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                    placeholder="Enter duration in minutes"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Duration must be between 15 minutes and 8 hours (480 minutes)
                  </p>
                </div>
              </>
            )}

            {/* Address field for OFFLINE_SERVICE */}
            {formData.type === 'OFFLINE_SERVICE' && (
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Service Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required={formData.type === 'OFFLINE_SERVICE'}
                  disabled={loading}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                  placeholder="Enter the address where the service will be provided"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide the complete address where the offline service will take place
                </p>
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                disabled={loading}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active (visible to customers)
              </label>
            </div>

            {/* Info notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-blue-700 text-sm">
                <strong>Note:</strong> After creating the product, you can add pricing and other details 
                through the product management interface.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}