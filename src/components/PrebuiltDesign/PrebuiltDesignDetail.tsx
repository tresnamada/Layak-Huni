import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { createSupportThread } from '../../services/supportService';
import { useRouter } from 'next/navigation';
import { PrebuiltDesign } from '@/types/prebuilt-design';

const PrebuiltDesignDetail = ({ design }: {design: PrebuiltDesign}) => {
  const { user } = useAuth();
  const router = useRouter();
  
  // State variables
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Purchase handler (placeholder)
  const handlePurchase = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Implement purchase logic
      console.log('Purchase logic to be implemented');
    } catch (err) {
      console.error('Purchase error:', err);
      setError('Failed to process purchase');
    } finally {
      setLoading(false);
    }
  };
  
  const handleContactSupport = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const { success, threadId, error } = await createSupportThread(
        user.uid,
        user.email?.split('@')[0] || 'Anonymous User',
        user.email || '',
        `Support Request: ${design.title}`,
        `I have a question about the prebuilt design "${design.title}"`,
        design.id
      );
      
      if (success && threadId) {
        router.push(`/support/${threadId}`);
      } else {
        setError(error || 'Failed to create support thread');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Existing design details */}
      
      {/* Add Contact Support button */}
      <div className="mt-8 flex flex-col md:flex-row gap-4">
        {/* Existing purchase button */}
        <button 
          onClick={handlePurchase}
          className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
          disabled={loading}
        >
          {loading ? 'Processing...' : `Purchase for $${design.price}`}
        </button>
        
        {/* New Contact Support button */}
        <button 
          onClick={handleContactSupport}
          className="bg-secondary text-white px-6 py-3 rounded-lg font-medium hover:bg-secondary-dark transition-colors"
          disabled={loading}
        >
          {loading ? 'Please wait...' : 'Contact Support'}
        </button>
      </div>
      
      {/* Show error message if any */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Rest of the design details */}
    </div>
  );
};

export default PrebuiltDesignDetail; 