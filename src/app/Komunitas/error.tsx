'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#EAF4DE] text-[#594C1A]">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-2xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <AlertTriangle size={48} className="text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Oops! Something went wrong</h2>
            <p className="text-[#938656] mb-6">
              {error.message || 'An unexpected error occurred while loading the community page.'}
            </p>
            <div className="space-x-4">
              <button
                onClick={() => reset()}
                className="px-6 py-2 bg-[#594C1A] text-white rounded-full hover:bg-[#938656] transition-colors"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 border border-[#594C1A] text-[#594C1A] rounded-full hover:bg-[#EAF4DE] transition-colors"
              >
                Refresh page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 