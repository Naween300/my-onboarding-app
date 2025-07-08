'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { ConfirmModal } from './ConfirmModal';

interface ConnectedPlatform {
  platform: string;
  connected: boolean;
  profile_name?: string;
  expires_at?: string;
}

export function SocialAccountManager({ 
  onPlatformsUpdate 
}: { 
  onPlatformsUpdate: (platforms: ConnectedPlatform[]) => void 
}) {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Modal state
  const [modal, setModal] = useState<null | 'disconnect' | 'switch' | 'disconnect-twitter' | 'switch-twitter'>(null);

  const availablePlatforms = [
    { 
      id: 'linkedin', 
      name: 'LinkedIn', 
      icon: '💼', 
      color: 'bg-blue-700',
      description: 'Professional networking and B2B content sharing'
    },
    { 
      id: 'facebook', 
      name: 'Facebook', 
      icon: '📘', 
      color: 'bg-blue-600',
      description: 'Social networking and community engagement'
    },
    { 
      id: 'instagram', 
      name: 'Instagram', 
      icon: '📷', 
      color: 'bg-pink-500',
      description: 'Visual content and photo sharing'
    },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'bg-black' },
    { id: 'twitter', name: 'X (Twitter)', icon: '🐦', color: 'bg-gray-800' },
    { id: 'youtube', name: 'YouTube', icon: '📺', color: 'bg-red-600' }
  ];

  // Load connected platforms
  const loadConnectedPlatforms = async () => {
    try {
      console.log('🔄 Loading platform status...');
      setStatusMessage('Loading connection status...');
      const response = await fetch('/api/social-platforms/status', {
        cache: 'no-store',
        headers: { 
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        console.error('Status API error:', response.status);
        setStatusMessage('Error loading status');
        return;
      }
      const data = await response.json();
      console.log('📊 Platform status received:', data);
      setPlatforms(data.platforms || []);
      onPlatformsUpdate(data.platforms || []);
      // Update status message based on connections
      const twitterPlatform = data.platforms?.find(p => p.platform === 'twitter');
      const linkedinPlatform = data.platforms?.find(p => p.platform === 'linkedin');
      if (twitterPlatform?.connected) {
        setStatusMessage(`✅ Twitter connected as ${twitterPlatform.profile_name} (@${twitterPlatform.profile_username})`);
      } else if (linkedinPlatform?.connected) {
        setStatusMessage(`✅ LinkedIn connected as ${linkedinPlatform.profile_name}`);
      } else {
        setStatusMessage('No platforms connected');
      }
    } catch (error) {
      console.error('Failed to load platforms:', error);
      setStatusMessage('Error loading platforms');
    }
  };

  // Initial load
  useEffect(() => {
    if (user) {
      loadConnectedPlatforms();
    }
  }, [user]);

  // Enhanced OAuth success detection
  useEffect(() => {
    const success = searchParams?.get('success');
    const error = searchParams?.get('error');
    console.log('🔍 Checking URL params:', { success, error });
    if (success === 'twitter_connected') {
      console.log('🐦 Twitter connection success detected!');
      setStatusMessage('✅ Twitter connected successfully! Refreshing...');
      // Clean URL immediately
      router.replace('/socials', { scroll: false });
      // Force multiple refresh attempts with different strategies
      const refreshStrategies = [
        { delay: 500, method: 'immediate' },
        { delay: 1500, method: 'cache-bust' },
        { delay: 3000, method: 'force-reload' },
        { delay: 5000, method: 'final-attempt' }
      ];
      refreshStrategies.forEach((strategy, index) => {
        setTimeout(async () => {
          console.log(`🔄 Twitter refresh attempt ${index + 1} (${strategy.method})`);
          await loadConnectedPlatforms();
          // Force component re-render
          if (strategy.method === 'force-reload') {
            window.location.reload();
          }
        }, strategy.delay);
      });
    } else if (success === 'linkedin_connected') {
      console.log('💼 LinkedIn connection success detected!');
      setStatusMessage('✅ LinkedIn connected successfully! Refreshing...');
      router.replace('/socials', { scroll: false });
      [500, 1500, 3000].forEach((delay, index) => {
        setTimeout(() => {
          console.log(`🔄 LinkedIn refresh attempt ${index + 1}`);
          loadConnectedPlatforms();
        }, delay);
      });
    } else if (error) {
      console.error('OAuth error detected:', error);
      setStatusMessage(`❌ Connection failed: ${error}`);
      router.replace('/socials', { scroll: false });
    }
  }, [searchParams, router]);

  const handleConnectLinkedIn = async () => {
    setLoading('linkedin');
    setStatusMessage('Connecting to LinkedIn...');
    try {
      const response = await fetch('/api/social-platforms/linkedin/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.authUrl) {
        setStatusMessage('Redirecting to LinkedIn...');
        window.location.href = data.authUrl;
      } else {
        throw new Error('No authorization URL received');
      }
    } catch (error: any) {
      console.error('LinkedIn connection failed:', error);
      setStatusMessage(`❌ Connection failed: ${error.message}`);
      setLoading(null);
    }
  };

  const handleConnectPlatform = async (platformId: string) => {
    setLoading(platformId);
    try {
      if (platformId === 'linkedin') {
        await handleConnectLinkedIn();
      } else {
        // Handle other platforms (Upload-Post API or other integrations)
        setLoading(null);
      }
    } catch (error) {
      alert(`Failed to connect ${platformId}. Please try again.`);
      setLoading(null);
    }
  };

  const linkedinPlatform = platforms.find((p: any) => p.platform === 'linkedin');
  const isLinkedInConnected = linkedinPlatform?.connected || false;

  // Add disconnect and switch handlers using modal
  const handleDisconnectLinkedIn = async () => {
    setLoading('disconnect');
    setStatusMessage('Disconnecting from LinkedIn...');
    try {
      const response = await fetch('/api/social-platforms/linkedin/disconnect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        setStatusMessage(`✅ ${data.message}`);
        setTimeout(() => loadConnectedPlatforms(), 1000);
      } else {
        throw new Error(data.error || 'Disconnect failed');
      }
    } catch (error: any) {
      setStatusMessage(`❌ Disconnect failed: ${error.message}`);
    } finally {
      setLoading(null);
      setModal(null);
    }
  };

  const handleSwitchLinkedInProfile = async () => {
    setLoading('switch');
    setStatusMessage('Switching LinkedIn profiles...');
    try {
      // Disconnect current account
      await fetch('/api/social-platforms/linkedin/disconnect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      // Initiate new connection
      const response = await fetch('/api/social-platforms/linkedin/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.authUrl) {
        setStatusMessage('Redirecting to LinkedIn for new profile...');
        window.location.href = data.authUrl;
      } else {
        throw new Error('No authorization URL received');
      }
    } catch (error: any) {
      setStatusMessage(`❌ Profile switch failed: ${error.message}`);
      setLoading(null);
    } finally {
      setModal(null);
    }
  };

  // Twitter handlers
  const twitterPlatform = platforms.find((p: any) => p.platform === 'twitter');
  const isTwitterConnected = twitterPlatform?.connected || false;

  const handleConnectTwitter = async () => {
    setLoading('twitter');
    setStatusMessage('Connecting to Twitter...');
    try {
      const response = await fetch('/api/social-platforms/twitter/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.authUrl) {
        setStatusMessage('Redirecting to Twitter...');
        window.location.href = data.authUrl;
      } else {
        throw new Error('No authorization URL received');
      }
    } catch (error: any) {
      setStatusMessage(`❌ Connection failed: ${error.message}`);
      setLoading(null);
    }
  };

  const handleDisconnectTwitter = async () => {
    setLoading('disconnect-twitter');
    setStatusMessage('Disconnecting from Twitter...');
    try {
      const response = await fetch('/api/social-platforms/twitter/disconnect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        setStatusMessage(`✅ ${data.message}`);
        setTimeout(() => loadConnectedPlatforms(), 1000);
      } else {
        throw new Error(data.error || 'Disconnect failed');
      }
    } catch (error: any) {
      setStatusMessage(`❌ Disconnect failed: ${error.message}`);
    } finally {
      setLoading(null);
      setModal(null);
    }
  };

  const handleSwitchTwitterProfile = async () => {
    setLoading('switch-twitter');
    setStatusMessage('Switching Twitter profiles...');
    try {
      // Disconnect current account
      await fetch('/api/social-platforms/twitter/disconnect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      // Initiate new connection
      const response = await fetch('/api/social-platforms/twitter/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.authUrl) {
        setStatusMessage('Redirecting to Twitter for new profile...');
        window.location.href = data.authUrl;
      } else {
        throw new Error('No authorization URL received');
      }
    } catch (error: any) {
      setStatusMessage(`❌ Profile switch failed: ${error.message}`);
      setLoading(null);
    } finally {
      setModal(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-6">Connect Your Social Media Accounts</h3>
      {/* Status message */}
      {statusMessage && (
        <div className={`mb-4 p-3 rounded-lg ${
          statusMessage.includes('✅') 
            ? 'bg-green-50 border border-green-200 text-green-800'
            : statusMessage.includes('❌')
            ? 'bg-red-50 border border-red-200 text-red-800'
            : 'bg-blue-50 border border-blue-200 text-blue-800'
        }`}>
          <p className="text-sm">{statusMessage}</p>
        </div>
      )}
      {/* LinkedIn connection card */}
      <div className={`p-4 rounded-lg border-2 transition-all ${
        isLinkedInConnected 
          ? 'border-green-500 bg-green-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg bg-blue-700 flex items-center justify-center text-white text-xl">
              💼
            </div>
            <div>
              <div className="font-medium text-lg">LinkedIn</div>
              <div className="text-sm text-gray-500">Professional networking and B2B content</div>
              {isLinkedInConnected && linkedinPlatform?.profile_name && (
                <div className="text-xs text-green-600 mt-1">
                  ✅ Connected as {linkedinPlatform.profile_name}
                </div>
              )}
              {!isLinkedInConnected && (
                <div className="text-xs text-gray-400 mt-1">
                  ❌ Not connected
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isLinkedInConnected ? (
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="text-green-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-green-700">Connected</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setModal('switch')}
                    disabled={loading === 'switch'}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                  >
                    {loading === 'switch' ? 'Switching...' : 'Switch Profile'}
                  </button>
                  <button
                    onClick={() => setModal('disconnect')}
                    disabled={loading === 'disconnect'}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                  >
                    {loading === 'disconnect' ? 'Disconnecting...' : 'Disconnect'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleConnectLinkedIn}
                disabled={loading === 'linkedin'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading === 'linkedin' ? 'Connecting...' : 'Connect'}
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Twitter connection card */}
      <div className={`p-4 rounded-lg border-2 transition-all mt-6 ${
        isTwitterConnected 
          ? 'border-green-500 bg-green-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-white text-xl">
              🐦
            </div>
            <div>
              <div className="font-medium text-lg">X (Twitter)</div>
              <div className="text-sm text-gray-500">Real-time updates and engagement</div>
              {isTwitterConnected && twitterPlatform?.profile_name && (
                <div className="text-xs text-green-600 mt-1">
                  ✅ Connected as {twitterPlatform.profile_name}
                  {twitterPlatform.profile_username && (
                    <span className="text-gray-500"> (@{twitterPlatform.profile_username})</span>
                  )}
                </div>
              )}
              {!isTwitterConnected && (
                <div className="text-xs text-gray-400 mt-1">
                  ❌ Not connected
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isTwitterConnected ? (
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="text-green-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-green-700">Connected</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setModal('switch-twitter')}
                    disabled={loading === 'switch-twitter'}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                  >
                    {loading === 'switch-twitter' ? 'Switching...' : 'Switch Profile'}
                  </button>
                  <button
                    onClick={() => setModal('disconnect-twitter')}
                    disabled={loading === 'disconnect-twitter'}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                  >
                    {loading === 'disconnect-twitter' ? 'Disconnecting...' : 'Disconnect'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleConnectTwitter}
                disabled={loading === 'twitter'}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50"
              >
                {loading === 'twitter' ? 'Connecting...' : 'Connect'}
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Manual refresh and debug section */}
      <div className="mt-6 space-y-4">
        <div className="text-center">
          <button
            onClick={loadConnectedPlatforms}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
          >
            🔄 Force Refresh Status
          </button>
        </div>
        {/* Debug information */}
        <div className="p-3 bg-gray-100 rounded text-xs">
          <div><strong>Debug Info:</strong></div>
          <div>Platforms loaded: {platforms.length}</div>
          <div>Twitter connected: {platforms.find(p => p.platform === 'twitter')?.connected ? 'Yes' : 'No'}</div>
          <div>Twitter profile: {platforms.find(p => p.platform === 'twitter')?.profile_name || 'None'}</div>
          <div>Twitter username: @{platforms.find(p => p.platform === 'twitter')?.profile_username || 'None'}</div>
          <div>Twitter expires_at: {platforms.find(p => p.platform === 'twitter')?.expires_at || 'None'}</div>
          <div>Twitter is_active: {typeof platforms.find(p => p.platform === 'twitter')?.is_active === 'boolean' ? String(platforms.find(p => p.platform === 'twitter')?.is_active) : 'Unknown'}</div>
          <div>URL params: {searchParams?.toString() || 'None'}</div>
        </div>
      </div>
      {/* Confirm Modals */}
      <ConfirmModal
        isOpen={modal === 'disconnect'}
        title="Disconnect LinkedIn Account"
        message={`Are you sure you want to disconnect your LinkedIn account${linkedinPlatform?.profile_name ? ` (${linkedinPlatform.profile_name})` : ''}?`}
        confirmText="Disconnect"
        cancelText="Cancel"
        onConfirm={handleDisconnectLinkedIn}
        onCancel={() => setModal(null)}
        loading={loading === 'disconnect'}
      />
      <ConfirmModal
        isOpen={modal === 'switch'}
        title="Switch LinkedIn Profile"
        message={`Switch to a different LinkedIn profile? This will disconnect${linkedinPlatform?.profile_name ? ` (${linkedinPlatform.profile_name})` : ''} and connect a new account.`}
        confirmText="Switch"
        cancelText="Cancel"
        onConfirm={handleSwitchLinkedInProfile}
        onCancel={() => setModal(null)}
        loading={loading === 'switch'}
      />
      <ConfirmModal
        isOpen={modal === 'disconnect-twitter'}
        title="Disconnect Twitter Account"
        message={`Are you sure you want to disconnect your Twitter account${twitterPlatform?.profile_username ? ` (@${twitterPlatform.profile_username})` : ''}?`}
        confirmText="Disconnect"
        cancelText="Cancel"
        onConfirm={handleDisconnectTwitter}
        onCancel={() => setModal(null)}
        loading={loading === 'disconnect-twitter'}
      />
      <ConfirmModal
        isOpen={modal === 'switch-twitter'}
        title="Switch Twitter Profile"
        message={`Switch to a different Twitter profile? This will disconnect${twitterPlatform?.profile_username ? ` (@${twitterPlatform.profile_username})` : ''} and connect a new account.`}
        confirmText="Switch"
        cancelText="Cancel"
        onConfirm={handleSwitchTwitterProfile}
        onCancel={() => setModal(null)}
        loading={loading === 'switch-twitter'}
      />
    </div>
  );
} 