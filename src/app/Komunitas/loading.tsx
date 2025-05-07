import Navbar from '@/components/Navbar';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#EAF4DE] text-[#594C1A]">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Skeleton */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-5 h-5 bg-[#EAF4DE] rounded animate-pulse" />
                <div className="h-6 w-24 bg-[#EAF4DE] rounded animate-pulse" />
              </div>
              
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-[#EAF4DE] rounded animate-pulse" />
                ))}
              </div>
              
              <div className="mt-8">
                <div className="h-4 w-24 bg-[#EAF4DE] rounded animate-pulse mb-3" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-6 w-20 bg-[#EAF4DE] rounded-full animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content Skeleton */}
          <div className="md:w-3/4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <div className="h-10 w-48 bg-white rounded-full animate-pulse" />
              <div className="h-10 w-32 bg-white rounded-full animate-pulse" />
            </div>

            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#EAF4DE] animate-pulse" />
                    <div>
                      <div className="h-5 w-32 bg-[#EAF4DE] rounded animate-pulse mb-1" />
                      <div className="h-4 w-24 bg-[#EAF4DE] rounded animate-pulse" />
                    </div>
                  </div>
                  
                  <div className="h-6 w-3/4 bg-[#EAF4DE] rounded animate-pulse mb-3" />
                  <div className="h-20 w-full bg-[#EAF4DE] rounded animate-pulse mb-4" />
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-6 w-16 bg-[#EAF4DE] rounded-full animate-pulse" />
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
                    <div className="h-6 w-16 bg-[#EAF4DE] rounded animate-pulse" />
                    <div className="h-6 w-16 bg-[#EAF4DE] rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 