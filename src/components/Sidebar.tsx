import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Home, 
  Package,
  LogOut,
  LayoutDashboard,
  HelpCircle,
  X
} from 'lucide-react';
import { getAuth } from 'firebase/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const adminFeatures = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/Admin",
    color: "text-blue-600"
  },
  {
    title: "Manajemen Pengguna",
    icon: Users,
    href: "/Admin/Users",
    color: "text-blue-600"
  },
  {
    title: "Manajemen Rumah",
    icon: Home,
    href: "/Admin/Houses",
    color: "text-green-600"
  },
  {
    title: "Tracking Material",
    icon: Package,
    href: "/Admin/MaterialTracking",
    color: "text-orange-600"
  },
  {
    title: "Support",
    icon: HelpCircle,
    href: "/Admin/support",
    color: "text-purple-600"
  }
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const auth = getAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              <X size={24} />
            </button>
          </div>
          
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {adminFeatures.map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors ${
                  pathname === feature.href ? 'bg-gray-50' : ''
                }`}
                onClick={onClose}
              >
                <feature.icon className={`mr-3 ${feature.color}`} size={20} />
                <span>{feature.title}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={() => {
                auth.signOut();
                onClose();
              }}
              className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="mr-3 text-red-600" size={20} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 