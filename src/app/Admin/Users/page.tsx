"use client";

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, orderBy, limit, getDoc, doc } from 'firebase/firestore';
import { isAdmin, setUserAsAdmin, removeUserAsAdmin } from '@/services/adminService';
import { isArchitect, setUserAsArchitect, removeUserAsArchitect } from '@/services/architectService';
import { useRouter } from 'next/navigation';
import { app, db } from '@/lib/firebase';
import {
  Search,
  Filter,
  UserPlus,
  UserMinus,
  ChevronDown,
  ChevronUp,
  Menu,
  Users,
  Loader2
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';

const auth = getAuth(app);

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isArchitect: boolean;
  joinDate: string;
}

export default function UserManagement() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingUser, setProcessingUser] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'admin' | 'architect' | 'user'>('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async (userId: string) => {
      const adminStatus = await isAdmin(userId);
      const architectStatus = await isArchitect(userId);
      setAuthorized(adminStatus || architectStatus);

      if (!adminStatus && !architectStatus) {
        router.push('/');
      } else {
        fetchUsers();
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkAdminStatus(user.uid);
      } else {
        setLoading(false);
        setAuthorized(false);
        router.push('/Login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, 'profiles');
      const q = query(usersCollection, orderBy('createdAt', 'desc'), limit(50));
      const snapshot = await getDocs(q);

      const userData: User[] = [];
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const userId = docSnapshot.id;
        
        let adminStatus = data.isAdmin === true || data.role === "admin";
        let architectStatus = data.isArchitect === true || data.role === "architect";
        
        if (!adminStatus || !architectStatus) {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role === "admin") adminStatus = true;
            if (userData.role === "architect") architectStatus = true;
          }
        }

        userData.push({
          id: userId,
          email: data.email || 'No email',
          name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'No name',
          isAdmin: adminStatus,
          isArchitect: architectStatus,
          joinDate: data.createdAt || 'Unknown'
        });
      }

      setUsers(userData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleSetUserRole = async (userId: string, role: "admin" | "architect" | "user", isAdding: boolean) => {
    try {
      setProcessingUser(userId);
      
      if (role === "admin") {
        if (isAdding) {
          await setUserAsAdmin(userId);
        } else {
          await removeUserAsAdmin(userId);
        }
      } else if (role === "architect") {
        if (isAdding) {
          await setUserAsArchitect(userId);
        } else {
          await removeUserAsArchitect(userId);
        }
      }
      
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      alert('Failed to update user role');
    } finally {
      setProcessingUser(null);
    }
  };

  const handleBatchRoleUpdate = async (role: "admin" | "architect", makeRole: boolean) => {
    try {
      const updates = Array.from(selectedUsers).map(userId => 
        handleSetUserRole(userId, role, makeRole)
      );
      await Promise.all(updates);
      setSelectedUsers(new Set());
    } catch (error) {
      console.error("Error updating batch roles:", error);
      alert('Failed to update user roles');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Email', 'Join Date', 'Status'],
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        new Date(user.joinDate).toLocaleDateString('id-ID'),
        user.isAdmin ? 'Admin' : user.isArchitect ? 'Arsitek' : 'Pengguna'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (statusFilter === 'all') return matchesSearch;
      if (statusFilter === 'admin') return matchesSearch && user.isAdmin;
      if (statusFilter === 'architect') return matchesSearch && user.isArchitect;
      return matchesSearch && !user.isAdmin && !user.isArchitect;
    });

  const filteredAndSortedUsers = filteredUsers.sort((a, b) => {
    let comparison = 0;
    comparison = a.name.localeCompare(b.name);
    return comparison;
  });

  const userStats = {
    total: users.length,
    admins: users.filter(user => user.isAdmin).length,
    architects: users.filter(user => user.isArchitect).length,
    regular: users.filter(user => !user.isAdmin && !user.isArchitect).length,
    newThisMonth: users.filter(user => {
      const joinDate = new Date(user.joinDate);
      const now = new Date();
      return joinDate.getMonth() === now.getMonth() && 
             joinDate.getFullYear() === now.getFullYear();
    }).length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F6EC]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data pengguna...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F6F6EC] flex">
      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 transition-all duration-300 lg:ml-64">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="px-3 sm:px-4 md:px-6">
            <div className="flex justify-between items-center py-2 sm:py-3 md:py-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 sm:p-2 text-gray-600 hover:text-gray-900"
              >
                <Menu size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6">
          <div className="mb-3 sm:mb-4 md:mb-6">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Manajemen Pengguna</h1>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-gray-600">Kelola dan pantau pengguna sistem</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Total Pengguna</p>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">{userStats.total}</p>
                </div>
                <div className="p-1.5 sm:p-2 md:p-3 bg-blue-50 rounded-lg">
                  <Users className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Admin</p>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">{userStats.admins}</p>
                </div>
                <div className="p-1.5 sm:p-2 md:p-3 bg-green-50 rounded-lg">
                  <UserPlus className="text-green-600 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Arsitek</p>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">{userStats.architects}</p>
                </div>
                <div className="p-1.5 sm:p-2 md:p-3 bg-purple-50 rounded-lg">
                  <UserPlus className="text-purple-600 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Pengguna Reguler</p>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">{userStats.regular}</p>
                </div>
                <div className="p-1.5 sm:p-2 md:p-3 bg-amber-50 rounded-lg">
                  <UserMinus className="text-amber-600 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Search, Filter and Report */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-6">
            <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 md:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400 sm:w-5 sm:h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari pengguna berdasarkan nama atau email..."
                    className="block w-full pl-8 sm:pl-9 pr-3 py-2 text-xs sm:text-sm md:text-base border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3 md:gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  <Filter size={14} className="mr-1.5 sm:mr-2 sm:w-4 sm:h-4" />
                  Filter
                  {showFilters ? <ChevronUp size={14} className="ml-1.5 sm:ml-2 sm:w-4 sm:h-4" /> : <ChevronDown size={14} className="ml-1.5 sm:ml-2 sm:w-4 sm:h-4" />}
                </button>
                <button
                  onClick={handleExport}
                  className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 border border-transparent rounded-lg text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Export
                </button>
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-2 sm:mt-3 md:mt-4 p-2 sm:p-3 md:p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  <div>
                    <label htmlFor="roleFilter" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Filter by Role</label>
                    <select
                      id="roleFilter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as 'all' | 'admin' | 'architect' | 'user')}
                      className="block w-full pl-2 sm:pl-3 pr-8 sm:pr-10 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 rounded-lg"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="architect">Arsitek</option>
                      <option value="user">Pengguna Regular</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Batch Actions */}
          {selectedUsers.size > 0 && (
            <div className="mb-4 sm:mb-6 md:mb-8 bg-white rounded-xl shadow-sm p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <p className="text-sm text-gray-600">
                  {selectedUsers.size} pengguna dipilih
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleBatchRoleUpdate("admin", true)}
                    className="inline-flex items-center px-2 sm:px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg"
                  >
                    <UserPlus size={16} className="mr-1.5" />
                    Jadikan Admin
                  </button>
                  <button
                    onClick={() => handleBatchRoleUpdate("architect", true)}
                    className="inline-flex items-center px-2 sm:px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg"
                  >
                    <UserPlus size={16} className="mr-1.5" />
                    Jadikan Arsitek
                  </button>
                  <button
                    onClick={() => setSelectedUsers(new Set())}
                    className="inline-flex items-center px-2 sm:px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
            {/* Table for Larger Screens */}
            <div className="overflow-x-auto hidden sm:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-4 sm:py-3 sm:text-sm">
                      <input type="checkbox" className="form-checkbox h-4 w-4 text-amber-600 transition duration-150 ease-in-out" />
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-4 sm:py-3 sm:text-sm">Nama</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-4 sm:py-3 sm:text-sm">Email</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-4 sm:py-3 sm:text-sm">Tanggal Bergabung</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-4 sm:py-3 sm:text-sm">Status</th>
                    <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-4 sm:py-3 sm:text-sm">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 sm:px-4 md:px-6 py-4 text-center text-sm text-gray-500">
                        {searchQuery ? 'Tidak ada pengguna yang cocok dengan pencarian.' : 'Tidak ada pengguna yang ditemukan.'}
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap sm:px-4 sm:py-3">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user.id)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedUsers);
                              if (e.target.checked) {
                                newSelected.add(user.id);
                              } else {
                                newSelected.delete(user.id);
                              }
                              setSelectedUsers(newSelected);
                            }}
                            className="form-checkbox h-4 w-4 text-amber-600 transition duration-150 ease-in-out"
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 sm:px-4 sm:py-3 sm:text-sm truncate max-w-[100px] sm:max-w-none">{user.name}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 sm:px-4 sm:py-3 sm:text-sm truncate max-w-[100px] sm:max-w-none">{user.email}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 sm:px-4 sm:py-3 sm:text-sm">{new Date(user.joinDate).toLocaleDateString()}</td>
                        <td className="px-3 py-2 whitespace-nowrap sm:px-4 sm:py-3">
                          <div className="flex gap-2">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {user.isAdmin ? 'Admin' : ''}
                            </span>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isArchitect ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                              {user.isArchitect ? 'Arsitek' : ''}
                            </span>
                            {!user.isAdmin && !user.isArchitect && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                Pengguna
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right text-xs font-medium sm:px-4 sm:py-3 sm:text-sm">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleSetUserRole(user.id, "admin", !user.isAdmin)}
                              disabled={processingUser === user.id}
                              className={`text-${user.isAdmin ? 'red' : 'green'}-600 hover:text-${user.isAdmin ? 'red' : 'green'}-900`}
                            >
                              {processingUser === user.id ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              ) : user.isAdmin ? (
                                <>
                                  <UserMinus size={16} className="mr-1.5" />
                                  Hapus Admin
                                </>
                              ) : (
                                <>
                                  <UserPlus size={16} className="mr-1.5" />
                                  Jadikan Admin
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleSetUserRole(user.id, "architect", !user.isArchitect)}
                              disabled={processingUser === user.id}
                              className={`text-${user.isArchitect ? 'red' : 'purple'}-600 hover:text-${user.isArchitect ? 'red' : 'purple'}-900`}
                            >
                              {processingUser === user.id ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              ) : user.isArchitect ? (
                                <>
                                  <UserMinus size={16} className="mr-1.5" />
                                  Hapus Arsitek
                                </>
                              ) : (
                                <>
                                  <UserPlus size={16} className="mr-1.5" />
                                  Jadikan Arsitek
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Card View for Mobile */}
            <div className="sm:hidden divide-y divide-gray-200">
              {filteredAndSortedUsers.length === 0 ? (
                 <div className="text-center py-8 sm:py-12 bg-white">
                  <div className="p-6 sm:p-8">
                    <Users size={32} className="mx-auto text-gray-400 sm:w-12 sm:h-12" />
                    <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-900">Tidak ada pengguna ditemukan</h3>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">Coba sesuaikan pencarian atau filter Anda</p>
                  </div>
                </div>
              ) : (
                filteredAndSortedUsers.map((user) => (
                  <div key={user.id} className="p-4 bg-white flex items-center justify-between">
                    {/* User Info - 2 Columns */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm flex-grow">
                      <div>
                        <div className="font-medium text-gray-900">Nama:</div>
                        <div className="text-gray-700 truncate max-w-[120px]">{user.name}</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Email:</div>
                        <div className="text-gray-700 truncate max-w-[120px]">{user.email}</div>
                      </div>
                       <div>
                        <div className="font-medium text-gray-900">Status:</div>
                         <div className="flex gap-2">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {user.isAdmin ? 'Admin' : ''}
                          </span>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isArchitect ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                            {user.isArchitect ? 'Arsitek' : ''}
                          </span>
                          {!user.isAdmin && !user.isArchitect && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Pengguna
                            </span>
                          )}
                        </div>
                      </div>
                       <div>
                        <div className="font-medium text-gray-900">Bergabung:</div>
                        <div className="text-gray-700">{new Date(user.joinDate).toLocaleDateString()}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 ml-4">
                      <button
                        onClick={() => handleSetUserRole(user.id, "admin", !user.isAdmin)}
                        disabled={processingUser === user.id}
                        className={`inline-flex items-center px-2 py-1.5 rounded-lg text-xs font-medium transition-colors text-${user.isAdmin ? 'red' : 'green'}-600 hover:text-${user.isAdmin ? 'red' : 'green'}-900`}
                      >
                         {processingUser === user.id ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                          ) : user.isAdmin ? (
                            <>
                              <UserMinus size={16} className="mr-1.5" />
                              Hapus Admin
                            </>
                          ) : (
                            <>
                              <UserPlus size={16} className="mr-1.5" />
                              Jadikan Admin
                            </>
                          )}
                      </button>
                      <button
                        onClick={() => handleSetUserRole(user.id, "architect", !user.isArchitect)}
                        disabled={processingUser === user.id}
                        className={`inline-flex items-center px-2 py-1.5 rounded-lg text-xs font-medium transition-colors text-${user.isArchitect ? 'red' : 'purple'}-600 hover:text-${user.isArchitect ? 'red' : 'purple'}-900`}
                      >
                         {processingUser === user.id ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                          ) : user.isArchitect ? (
                            <>
                              <UserMinus size={16} className="mr-1.5" />
                              Hapus Arsitek
                            </>
                          ) : (
                            <>
                              <UserPlus size={16} className="mr-1.5" />
                              Jadikan Arsitek
                            </>
                          )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Empty State */}
            {filteredAndSortedUsers.length === 0 && !loading && (
              <div className="text-center py-8 sm:py-12 bg-white hidden">
                <div className="p-6 sm:p-8">
                  <Users size={32} className="mx-auto text-gray-400 sm:w-12 sm:h-12" />
                  <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-900">Tidak ada pengguna ditemukan</h3>
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">Coba sesuaikan pencarian atau filter Anda</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
               <div className="text-center py-8 sm:py-12 bg-white">
                <div className="p-6 sm:p-8">
                  <Loader2 size={32} className="mx-auto text-gray-400 animate-spin sm:w-12 sm:h-12" />
                  <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-900">Memuat pengguna...</h3>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 