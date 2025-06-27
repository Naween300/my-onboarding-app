'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

// Fix: Declare FB on window for TypeScript
declare global {
  interface Window {
    FB: any;
  }
}

interface FacebookPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postContent: string;
  postImage?: string;
}

export const FacebookPostModal = ({ isOpen, onClose, postContent, postImage }: FacebookPostModalProps) => {
  const { user } = useUser();
  const [isConnected, setIsConnected] = useState(false);
  const [connectedPages, setConnectedPages] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [postStatus, setPostStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingConnections, setIsLoadingConnections] = useState(true);

  // ✅ Check for existing connections when modal opens
  useEffect(() => {
    if (isOpen && user?.id) {
      checkExistingConnections();
    }
  }, [isOpen, user?.id]);

  const checkExistingConnections = async () => {
    try {
      setIsLoadingConnections(true);
      console.log('🔍 Checking for existing Facebook connections...');
      console.log('👤 Current user ID:', user?.id);

      // ✅ Use API route for consistent data access
      const response = await fetch('/api/facebook-connections', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user?.id || '', // Pass user ID in header
        },
      });

      if (!response.ok) {
        console.error('❌ Failed to fetch connections:', response.status);
        setIsLoadingConnections(false);
        return;
      }

      const { data: savedConnections } = await response.json();

      console.log('🔍 Raw connections from API:', savedConnections);

      if (savedConnections && savedConnections.length > 0) {
        console.log('✅ Found existing connections:', savedConnections);
        
        // ✅ Convert saved connections to the format Facebook SDK expects
        const formattedPages = savedConnections.map((conn: any) => ({
          id: conn.page_id,
          name: conn.page_name,
          access_token: 'stored_token', // We'll handle token refresh later
        }));

        setConnectedPages(formattedPages);
        setSelectedPage(formattedPages[0]);
        setIsConnected(true);
        console.log('🎉 Using existing Facebook connection');
      } else {
        console.log('📝 No existing connections found, user needs to connect');
        setIsConnected(false);
      }
    } catch (error) {
      console.error('❌ Error checking connections:', error);
      setIsConnected(false);
    } finally {
      setIsLoadingConnections(false);
    }
  };

  const loadFacebookSDK = () => {
    if (typeof window !== 'undefined' && !window.FB) {
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        console.log('✅ Facebook SDK loaded successfully');
      };
      document.head.appendChild(script);
    }
  };

  const handleFacebookLogin = () => {
    if (!window.FB) {
      loadFacebookSDK();
      setTimeout(handleFacebookLogin, 1000); // Retry after SDK loads
      return;
    }
    window.FB.login((response: any) => {
      console.log('Facebook login response:', response);
      if (response.status === 'connected') {
        setIsConnected(true);
        fetchUserPages(response.authResponse.accessToken);
      } else {
        setErrorMessage('Facebook login failed. Please try again.');
      }
    }, {
      scope: 'pages_manage_posts,pages_read_engagement,pages_show_list'
    });
  };

  const fetchUserPages = async (accessToken: string) => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/me/accounts?access_token=${accessToken}`
      );
      const data = await response.json();
      console.log('Pages data:', data);
      if (data.data && data.data.length > 0) {
        setConnectedPages(data.data);
        setSelectedPage(data.data[0]);
        // ✅ Save new connections to database
        await saveNewConnectionsToDatabase(data.data);
      } else {
        setErrorMessage('No Facebook pages found. Please make sure you have a Facebook page.');
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      setErrorMessage('Failed to fetch Facebook pages.');
    }
  };

  const saveNewConnectionsToDatabase = async (pages: any[]) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      for (const page of pages) {
        const connectionData = {
          clerk_user_id: user?.id,
          page_id: page.id,
          page_name: page.name,
          connected_at: new Date().toISOString(),
          is_active: true
        };
        await supabase
          .from('facebook_connections')
          .upsert(connectionData, {
            onConflict: 'clerk_user_id,page_id',
            ignoreDuplicates: false
          });
      }
      console.log('✅ New connections saved to database');
    } catch (error) {
      console.error('❌ Error saving new connections:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      console.log('🔌 Disconnecting Facebook...');
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      await supabase
        .from('facebook_connections')
        .update({ is_active: false })
        .eq('clerk_user_id', user?.id);
      setIsConnected(false);
      setConnectedPages([]);
      setSelectedPage(null);
      console.log('✅ Facebook disconnected successfully');
    } catch (error) {
      console.error('❌ Error disconnecting:', error);
    }
  };

  const dataURItoBlob = (dataURI: string) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const handlePostToFacebook = async () => {
    if (!selectedPage || !postContent) return;

    setIsPosting(true);
    setPostStatus('idle');

    try {
      console.log('🚀 Starting Facebook post...');
      
      if (postImage) {
        await postImageToFacebook();
      } else {
        await postTextToFacebook();
      }

      setPostStatus('success');
      await saveConnectionToSupabase();
      
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Error posting to Facebook:', error);
      setPostStatus('error');
      setErrorMessage(`Failed to post: ${error.message}`);
    } finally {
      setIsPosting(false);
    }
  };

  const postImageToFacebook = async () => {
    if (!postImage || !selectedPage) return;

    console.log('📤 Processing image for Facebook upload...');
    
    // ✅ Enhanced image processing for Facebook requirements
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise((resolve, reject) => {
      img.onload = async () => {
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // ✅ Set minimum dimensions for Facebook
        const minWidth = 600;  // Facebook minimum width
        const minHeight = 315; // Facebook minimum height
        
        canvas.width = Math.max(img.width, minWidth);
        canvas.height = Math.max(img.height, minHeight);
        
        // Draw image with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // ✅ Convert to high-quality JPEG (Facebook prefers JPEG)
        const highQualityDataURL = canvas.toDataURL('image/jpeg', 0.9);
        const blob = dataURItoBlob(highQualityDataURL);
        
        // ✅ Check file size (Facebook minimum is usually around 15KB)
        console.log('📊 Image size:', blob.size, 'bytes');
        
        if (blob.size < 15000) { // Less than 15KB
          console.warn('⚠️ Image might be too small for Facebook');
        }
        
        const formData = new FormData();
        formData.append('message', postContent);
        formData.append('source', blob, 'facebook-post.jpg');
        formData.append('access_token', selectedPage.access_token);

        try {
          const response = await fetch(
            `https://graph.facebook.com/${selectedPage.id}/photos`,
            {
              method: 'POST',
              body: formData
            }
          );

          const result = await response.json();
          
          if (!response.ok) {
            console.error('❌ Facebook API Error:', result);
            throw new Error(result.error?.message || 'Failed to upload image');
          }

          console.log('✅ Image uploaded successfully:', result);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = postImage;
    });
  };

  const postTextToFacebook = async () => {
    const formData = new FormData();
    formData.append('message', postContent);
    formData.append('access_token', selectedPage.access_token);

    const response = await fetch(
      `https://graph.facebook.com/${selectedPage.id}/feed`,
      {
        method: 'POST',
        body: formData
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to post text');
    }

    console.log('✅ Text posted successfully:', result);
    return result;
  };

  const saveConnectionToSupabase = async () => {
    try {
      console.log('💾 Saving Facebook connection to Supabase...');
      
      if (!user?.id || !selectedPage) {
        console.error('❌ Missing user ID or selected page');
        return;
      }

      // ✅ Call API route instead of direct Supabase
      const response = await fetch('/api/facebook-connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerk_user_id: user.id,
          page_id: selectedPage.id,
          page_name: selectedPage.name,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save connection');
      }

      console.log('✅ Facebook connection saved successfully:', result.data);
      return result.data;

    } catch (error) {
      console.error('❌ Error saving connection to Supabase:', error);
      setErrorMessage(`Failed to save connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  // Quick Debug Test: Service role insert
  const testDirectInsert = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      // Test with service role (should work)
      const supabaseService = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
      );

      const testData = {
        clerk_user_id: user?.id,
        page_id: 'test_123',
        page_name: 'Test Page',
        connected_at: new Date().toISOString(),
        is_active: true
      };

      const { data, error } = await supabaseService
        .from('facebook_connections')
        .insert(testData)
        .select();

      console.log('🧪 Service role test:', { data, error });
    } catch (error) {
      console.error('🧪 Test failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Post to Facebook</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {isLoadingConnections ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Checking Facebook connections...</p>
            </div>
          ) : !isConnected ? (
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">f</span>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Connect your Facebook Page</h4>
                <p className="text-gray-600 text-sm">
                  Connect your Facebook page to start posting content directly.
                </p>
              </div>
              
              <button
                onClick={handleFacebookLogin}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Connect Facebook Page
              </button>
            </div>
          ) : (
            <div>
              {/* Connection Status */}
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-800 text-sm font-medium">Facebook Connected</span>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
              {/* Page Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Facebook Page</label>
                <select
                  value={selectedPage?.id || ''}
                  onChange={(e) => {
                    const page = connectedPages.find(p => p.id === e.target.value);
                    setSelectedPage(page);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {connectedPages.map((page) => (
                    <option key={page.id} value={page.id}>{page.name}</option>
                  ))}
                </select>
              </div>

              {/* Post Preview */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Post Preview</label>
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <p className="text-sm text-gray-800">{postContent}</p>
                  {postImage ? (
                    <div className="mt-2">
                      <img 
                        src={postImage} 
                        alt="Post preview" 
                        className="w-full h-32 object-cover rounded"
                        onLoad={() => console.log('✅ Image loaded in modal')}
                        onError={() => console.error('❌ Image failed to load in modal')}
                      />
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center justify-center h-32 bg-gray-200 rounded">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-xs text-gray-500">Capturing image...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Messages */}
              {postStatus === 'success' && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">✅ Successfully posted to Facebook!</p>
                </div>
              )}

              {postStatus === 'error' && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">❌ {errorMessage}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePostToFacebook}
                  disabled={isPosting || !selectedPage}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isPosting ? 'Posting...' : 'Post Now'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 