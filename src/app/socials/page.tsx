'use client';
import React from 'react';
import { SimpleSidebar } from '@/components/SimpleSidebar';
import { useUser } from '@clerk/nextjs';
import { createAyrshareProfile } from '@/lib/ayrshare';

export default function SocialsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const { user, isLoaded } = useUser();
  const [status, setStatus] = React.useState<string | null>(null);

  const handleConnectFacebook = async () => {
    if (!isLoaded || !user) {
      setStatus('User not loaded. Please sign in.');
      return;
    }
    setStatus('Checking Ayrshare profile...');
    let profileKey = localStorage.getItem('ayrshareProfileKey');
    if (!profileKey) {
      try {
        profileKey = await createAyrshareProfile(user.emailAddresses[0]?.emailAddress || user.id);
        localStorage.setItem('ayrshareProfileKey', profileKey);
        setStatus('Ayrshare profile created and key stored.');
      } catch (err) {
        setStatus('Failed to create Ayrshare profile.');
        return;
      }
    } else {
      setStatus('Ayrshare profileKey found in localStorage.');
    }
    // Next: generate JWT and open linking URL (not implemented here)
  };

  return (
    <>
      <SimpleSidebar onToggle={setSidebarCollapsed} />
      <div className={`flex h-screen bg-gray-50 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-6">Social Accounts</h1>
          <button
            onClick={handleConnectFacebook}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow"
          >
            Connect Facebook Page
          </button>
          {status && <div className="mt-4 text-gray-700">{status}</div>}
        </div>
      </div>
    </>
  );
} 