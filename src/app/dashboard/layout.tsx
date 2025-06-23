'use client';

import { Button } from '@/components/ui/button';
import DashboardNav from '@/components/DashboardNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Buildla Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your AI assistants and monitor performance</p>
            </div>
            <Button 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50 cursor-pointer"
              onClick={() => window.location.href = '/auth'}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <DashboardNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
} 