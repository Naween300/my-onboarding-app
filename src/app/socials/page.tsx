'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { SocialAccountManager } from '../../components/SocialAccountManager';
import { uploadImageToSupabase } from '../../lib/storage';
import { DashboardLayout } from '../../components/DashboardLayout';

export default function SocialsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useUser();
  const [connectedPlatforms, setConnectedPlatforms] = useState<any[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [postContent, setPostContent] = useState('Test post from Upload-Post modal!');
  const [imageData, setImageData] = useState<string>('');
  const [status, setStatus] = useState<string | null>(null);

  // Platform selection component
  const PlatformSelector = () => {
    const availablePlatforms = [
      { id: 'facebook', name: 'Facebook', icon: '📘' },
      { id: 'instagram', name: 'Instagram', icon: '📷' },
      { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
      { id: 'tiktok', name: 'TikTok', icon: '🎵' },
      { id: 'twitter', name: 'X (Twitter)', icon: '🐦' }
    ];
    return (
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Select Platforms:</h4>
        <div className="flex flex-wrap gap-2">
          {availablePlatforms.map((platform) => {
            const isConnected = connectedPlatforms.find((p: any) => p.platform === platform.id)?.connected;
            const isSelected = selectedPlatforms.includes(platform.id);
            return (
              <button
                key={platform.id}
                onClick={() => {
                  if (!isConnected) return;
                  setSelectedPlatforms(prev =>
                    isSelected
                      ? prev.filter(p => p !== platform.id)
                      : [...prev, platform.id]
                  );
                }}
                disabled={!isConnected}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  isSelected && isConnected
                    ? 'bg-blue-600 text-white'
                    : isConnected
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {platform.icon} {platform.name}
                {!isConnected && ' (Not connected)'}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Test post handler
  const handleTestPost = async () => {
    setStatus('Posting...');
    const results = [];
    for (const platform of selectedPlatforms) {
      try {
        if (platform === 'linkedin') {
          const response = await fetch('/api/social-platforms/linkedin/post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: postContent })
          });
          const result = await response.json();
          if (result.success) {
            results.push(`✅ LinkedIn: ${result.message || 'Posted successfully'}`);
          } else {
            results.push(`❌ LinkedIn: ${result.error}`);
          }
        } else if (platform === 'twitter') {
          const response = await fetch('/api/social-platforms/twitter/post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: postContent })
          });
          const result = await response.json();
          if (result.success) {
            results.push(`✅ Twitter: ${result.message || 'Posted successfully'}`);
          } else {
            results.push(`❌ Twitter: ${result.error || 'Unknown error'}`);
          }
        } else {
          let uploadedImageUrl = undefined;
          if (imageData && user?.id) {
            uploadedImageUrl = await uploadImageToSupabase(imageData, user.id);
          }
          const response = await fetch('/api/social-platforms/post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              platforms: [platform],
              text: postContent,
              mediaUrl: uploadedImageUrl
            })
          });
          const result = await response.json();
          if (result.success) {
            results.push(`✅ ${platform}: Posted successfully`);
          } else {
            results.push(`❌ ${platform}: ${result.error || 'Unknown error'}`);
          }
        }
      } catch (error) {
        results.push(`❌ ${platform}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    setStatus(results.join('\n'));
  };

  // Render UI
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-8">
        <h1 className="text-2xl font-bold mb-6">Social Accounts</h1>
        <div className="w-full max-w-xl mb-8">
          <SocialAccountManager onPlatformsUpdate={setConnectedPlatforms} />
        </div>
        <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-6 mb-8">
          <PlatformSelector />
          <textarea
            className="w-full border rounded p-2 mb-4"
            rows={3}
            value={postContent}
            onChange={e => setPostContent(e.target.value)}
            placeholder="Write your test post here..."
          />
          <button
            onClick={handleTestPost}
            disabled={selectedPlatforms.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post to {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} (Upload-Post)
          </button>
          {status && <div className="mt-4 whitespace-pre-line text-gray-700">{status}</div>}
        </div>
      </div>
    </DashboardLayout>
  );
}  