import Navbar from '@/components/Navbar';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#EAF4DE] text-[#594C1A]">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {/* Back Button Skeleton */}
        <div className="h-8 w-48 bg-white rounded-full animate-pulse mb-6" />

        {/* Post Detail Card Skeleton */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#EAF4DE] animate-pulse" />
              <div>
                <div className="h-5 w-32 bg-[#EAF4DE] rounded animate-pulse mb-1" />
                <div className="h-4 w-24 bg-[#EAF4DE] rounded animate-pulse" />
              </div>
            </div>

            <div className="h-8 w-3/4 bg-[#EAF4DE] rounded animate-pulse mb-4" />
            <div className="space-y-2 mb-6">
              <div className="h-4 w-full bg-[#EAF4DE] rounded animate-pulse" />
              <div className="h-4 w-full bg-[#EAF4DE] rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-[#EAF4DE] rounded animate-pulse" />
            </div>

            <div className="h-48 w-full bg-[#EAF4DE] rounded animate-pulse mb-6" />

            <div className="flex flex-wrap gap-2 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 w-20 bg-[#EAF4DE] rounded-full animate-pulse" />
              ))}
            </div>

            <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 w-16 bg-[#EAF4DE] rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Comments Section Skeleton */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="h-7 w-48 bg-[#EAF4DE] rounded animate-pulse mb-6" />

            {/* Comment Form Skeleton */}
            <div className="flex items-start space-x-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-[#EAF4DE] animate-pulse flex-shrink-0" />
              <div className="flex-grow">
                <div className="h-24 w-full bg-[#EAF4DE] rounded animate-pulse mb-2" />
                <div className="h-8 w-24 bg-[#EAF4DE] rounded-full animate-pulse ml-auto" />
              </div>
            </div>

            {/* Comments List Skeleton */}
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex space-x-4">
                  <div className="w-10 h-10 rounded-full bg-[#EAF4DE] animate-pulse flex-shrink-0" />
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-5 w-32 bg-[#EAF4DE] rounded animate-pulse" />
                      <div className="h-4 w-24 bg-[#EAF4DE] rounded animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-[#EAF4DE] rounded animate-pulse" />
                      <div className="h-4 w-2/3 bg-[#EAF4DE] rounded animate-pulse" />
                    </div>
                    <div className="h-6 w-16 bg-[#EAF4DE] rounded animate-pulse mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 