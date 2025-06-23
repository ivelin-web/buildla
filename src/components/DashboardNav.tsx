'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8">
          <Link 
            href="/dashboard" 
            className={`py-4 text-sm font-medium cursor-pointer ${
              isActive('/dashboard') 
                ? 'text-gray-900 border-b-2 border-blue-500' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </Link>
          <Link 
            href="/dashboard/preview" 
            className={`py-4 text-sm font-medium cursor-pointer ${
              isActive('/dashboard/preview') 
                ? 'text-gray-900 border-b-2 border-blue-500' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Chat Preview
          </Link>
          <Link 
            href="/dashboard/assistants" 
            className={`py-4 text-sm font-medium cursor-pointer ${
              isActive('/dashboard/assistants') 
                ? 'text-gray-900 border-b-2 border-blue-500' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Assistants
          </Link>
          <Link 
            href="/dashboard/offers" 
            className={`py-4 text-sm font-medium cursor-pointer ${
              isActive('/dashboard/offers') 
                ? 'text-gray-900 border-b-2 border-blue-500' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Offers
          </Link>
        </nav>
      </div>
    </div>
  );
} 