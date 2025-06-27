'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Select from 'react-select';

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
  const [selectedPages, setSelectedPages] = useState<any[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [postStatus, setPostStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingConnections, setIsLoadingConnections] = useState(true);
  const [postResults, setPostResults] = useState<any[]>([]);
  
  // ✅ Add new state for adding pages
  const [isAddingNewPage, setIsAddingNewPage] = useState(false);
  const [showAddPageModal, setShowAddPageModal] = useState(false);

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

      const response = await fetch('/api/facebook-connections', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user?.id || '',
        },
      });

      if (!response.ok) {
        console.error('❌ Failed to fetch connections:', response.status);
        setIsLoadingConnections(false);
        return;
      }

      const { data: savedConnections } = await response.json();

      if (savedConnections && savedConnections.length > 0) {
        console.log('✅ Found existing connections:', savedConnections);
        
        const formattedPages = savedConnections.map((conn: any) => ({
          id: conn.page_id,
          name: conn.page_name,
          access_token: 'stored_token',
        }));

        setConnectedPages(formattedPages);
        // ✅ Auto-select all connected pages by default
        setSelectedPages(formattedPages);
        setIsConnected(true);
        console.log('🎉 Using existing Facebook connections');
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

  // ✅ Enhanced function to add new Facebook pages
  const handleAddNewFacebookPage = () => {
    if (!window.FB) {
      loadFacebookSDK();
      setTimeout(handleAddNewFacebookPage, 1000);
      return;
    }

    setIsAddingNewPage(true);
    setShowAddPageModal(true);

    // ✅ Request additional permissions for new pages
    window.FB.login((response: any) => {
      console.log('Add new page login response:', response);
      
      if (response.status === 'connected') {
        fetchAndAddNewPages(response.authResponse.accessToken);
      } else {
        setErrorMessage('Failed to connect new Facebook page. Please try again.');
        setIsAddingNewPage(false);
      }
    }, {
      scope: 'pages_manage_posts,pages_read_engagement,pages_show_list',
      auth_type: 'rerequest' // ✅ Force re-authentication to get new pages
    });
  };

  // ✅ Function to fetch and add new pages
  const fetchAndAddNewPages = async (accessToken: string) => {
    try {
      console.log('🔍 Fetching all available Facebook pages...');
      
      const response = await fetch(
        `https://graph.facebook.com/me/accounts?access_token=${accessToken}&limit=100`
      );
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        console.log('📄 All available pages:', data.data);
        
        // ✅ Filter out already connected pages
        const existingPageIds = connectedPages.map(page => page.id);
        const newPages = data.data.filter((page: any) => !existingPageIds.includes(page.id));
        
        if (newPages.length > 0) {
          console.log('✨ New pages found:', newPages);
          
          // ✅ Add new pages to connected pages
          const updatedPages = [...connectedPages, ...newPages];
          setConnectedPages(updatedPages);
          
          // ✅ Auto-select new pages
          setSelectedPages([...selectedPages, ...newPages]);
          
          // ✅ Save new connections to database
          await saveNewConnectionsToDatabase(newPages);
          
          setErrorMessage(`Successfully added ${newPages.length} new Facebook page${newPages.length !== 1 ? 's' : ''}!`);
          setPostStatus('success');
        } else {
          setErrorMessage('No new Facebook pages found. All available pages are already connected.');
          setPostStatus('idle');
        }
      } else {
        setErrorMessage('No Facebook pages found. Please make sure you have Facebook pages.');
      }
    } catch (error) {
      console.error('❌ Error fetching new pages:', error);
      setErrorMessage('Failed to fetch new Facebook pages.');
    } finally {
      setIsAddingNewPage(false);
      setTimeout(() => {
        setShowAddPageModal(false);
        if (postStatus === 'success') {
          setPostStatus('idle');
          setErrorMessage('');
        }
      }, 3000);
    }
  };

  // ✅ Function to remove a specific page connection
  const handleRemovePage = async (pageToRemove: any) => {
    try {
      console.log('🗑️ Removing page:', pageToRemove.name);
      
      // ✅ Remove from database
      const response = await fetch('/api/facebook-connections', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerk_user_id: user?.id,
          page_id: pageToRemove.id,
        }),
      });

      if (response.ok) {
        // ✅ Update local state
        const updatedConnectedPages = connectedPages.filter(page => page.id !== pageToRemove.id);
        const updatedSelectedPages = selectedPages.filter(page => page.id !== pageToRemove.id);
        
        setConnectedPages(updatedConnectedPages);
        setSelectedPages(updatedSelectedPages);
        
        console.log(`✅ Successfully removed ${pageToRemove.name}`);
        
        // ✅ If no pages left, set as disconnected
        if (updatedConnectedPages.length === 0) {
          setIsConnected(false);
        }
      }
    } catch (error) {
      console.error('❌ Error removing page:', error);
    }
  };

  // ✅ Keep all your existing functions (loadFacebookSDK, handleFacebookLogin, etc.)
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
      setTimeout(handleFacebookLogin, 1000);
      return;
    }

    // ✅ Clear any existing Facebook session first
    window.FB.logout(() => {
      console.log('🧹 Cleared existing Facebook session');
      
      // ✅ Force fresh login with updated permissions
      window.FB.login((response: any) => {
        console.log('Facebook login response:', response);
        
        if (response.status === 'connected') {
          console.log('✅ Fresh access token received:', response.authResponse.accessToken);
          setIsConnected(true);
          fetchUserPages(response.authResponse.accessToken);
        } else {
          setErrorMessage('Facebook login failed. Please try again.');
        }
      }, {
        scope: 'pages_manage_posts,pages_read_engagement,pages_show_list',
        auth_type: 'rerequest', // ✅ Force re-authentication
        return_scopes: true // ✅ Return granted permissions
      });
    });
  };

  // ✅ Enhanced token validation
  const validateAccessToken = async (accessToken: string) => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/me?access_token=${accessToken}`
      );
      const data = await response.json();
      
      if (data.error) {
        console.error('❌ Access token validation failed:', data.error);
        return false;
      }
      
      console.log('✅ Access token is valid for user:', data.name);
      return true;
    } catch (error) {
      console.error('❌ Token validation error:', error);
      return false;
    }
  };

  const fetchUserPages = async (accessToken: string) => {
    try {
      // ✅ Validate token first
      const isValidToken = await validateAccessToken(accessToken);
      if (!isValidToken) {
        setErrorMessage('Invalid access token. Please reconnect your Facebook account.');
        return;
      }

      console.log('🔍 Fetching Facebook pages with valid token...');
      
      const response = await fetch(
        `https://graph.facebook.com/me/accounts?access_token=${accessToken}&limit=100`
      );
      const data = await response.json();
      
      if (data.error) {
        console.error('❌ Facebook API error:', data.error);
        setErrorMessage(`Facebook API error: ${data.error.message}`);
        return;
      }
      
      console.log('📄 Pages data received:', data);
      
      if (data.data && data.data.length > 0) {
        setConnectedPages(data.data);
        setSelectedPages(data.data);
        await saveNewConnectionsToDatabase(data.data);
      } else {
        setErrorMessage('No Facebook pages found. Please make sure you have a Facebook page.');
      }
    } catch (error) {
      console.error('❌ Error fetching pages:', error);
      setErrorMessage('Failed to fetch Facebook pages.');
    }
  };

  // ✅ Enhanced posting function for multiple pages
  const handlePostToFacebook = async () => {
    if (!selectedPages.length || !postContent) {
      setErrorMessage('Please select at least one Facebook page and add content.');
      return;
    }

    setIsPosting(true);
    setPostStatus('idle');
    setPostResults([]);

    try {
      console.log(`🚀 Starting Facebook post to ${selectedPages.length} pages...`);
      
      const results = [];
      
      // ✅ Post to each selected page
      for (const page of selectedPages) {
        try {
          console.log(`📤 Posting to ${page.name}...`);
          
          let result;
          if (postImage) {
            result = await postImageToFacebookPage(page);
          } else {
            result = await postTextToFacebookPage(page);
          }
          
          results.push({
            page: page.name,
            status: 'success',
            result: result
          });
          
          console.log(`✅ Successfully posted to ${page.name}`);
        } catch (error: any) {
          console.error(`❌ Failed to post to ${page.name}:`, error);
          results.push({
            page: page.name,
            status: 'error',
            error: error.message
          });
        }
      }
      
      setPostResults(results);
      
      // ✅ Determine overall status
      const successCount = results.filter(r => r.status === 'success').length;
      const errorCount = results.filter(r => r.status === 'error').length;
      
      if (successCount === selectedPages.length) {
        setPostStatus('success');
        setErrorMessage(`Successfully posted to all ${successCount} pages!`);
      } else if (successCount > 0) {
        setPostStatus('success');
        setErrorMessage(`Posted to ${successCount} pages successfully. ${errorCount} failed.`);
      } else {
        setPostStatus('error');
        setErrorMessage(`Failed to post to all pages.`);
      }

      await saveConnectionToSupabase();
      
      setTimeout(() => {
        onClose();
      }, 3000); // ✅ Longer delay to show results
      
    } catch (error: any) {
      console.error('❌ Error posting to Facebook:', error);
      setPostStatus('error');
      setErrorMessage(`Failed to post: ${error.message}`);
    } finally {
      setIsPosting(false);
    }
  };

  // ✅ Enhanced posting functions for individual pages
  const postImageToFacebookPage = async (page: any) => {
    if (!postImage) return;

    // ✅ Validate page access token first
    if (!page.access_token || page.access_token === 'stored_token') {
      throw new Error(`No valid access token for ${page.name}. Please reconnect.`);
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          const minWidth = 600;
          const minHeight = 315;
          
          canvas.width = Math.max(img.width, minWidth);
          canvas.height = Math.max(img.height, minHeight);
          
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const highQualityDataURL = canvas.toDataURL('image/jpeg', 0.9);
          const blob = dataURItoBlob(highQualityDataURL);
          
          console.log(`📤 Uploading image to ${page.name} with token validation...`);
          
          const formData = new FormData();
          formData.append('message', postContent);
          formData.append('source', blob, 'facebook-post.jpg');
          formData.append('access_token', page.access_token);

          const response = await fetch(
            `https://graph.facebook.com/${page.id}/photos`,
            {
              method: 'POST',
              body: formData
            }
          );

          const result = await response.json();
          
          if (!response.ok) {
            console.error(`❌ Facebook API error for ${page.name}:`, result);
            throw new Error(result.error?.message || 'Failed to upload image');
          }

          console.log(`✅ Successfully posted to ${page.name}:`, result);
          resolve(result);
        } catch (error) {
          console.error(`❌ Error posting to ${page.name}:`, error);
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = postImage;
    });
  };

  const postTextToFacebookPage = async (page: any) => {
    const formData = new FormData();
    formData.append('message', postContent);
    formData.append('access_token', page.access_token);

    const response = await fetch(
      `https://graph.facebook.com/${page.id}/feed`,
      {
        method: 'POST',
        body: formData
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to post text');
    }

    return result;
  };

  // ✅ Keep all your existing helper functions (dataURItoBlob, saveConnectionToSupabase, etc.)
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

  const saveConnectionToSupabase = async () => {
    try {
      console.log('💾 Saving Facebook connections to Supabase...');
      
      if (!user?.id || !selectedPages.length) {
        console.error('❌ Missing user ID or selected pages');
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      // ✅ Save each selected page connection with individual error handling
      for (const page of selectedPages) {
        try {
          console.log(`💾 Saving connection for ${page.name}...`);
          
          const response = await fetch('/api/facebook-connections', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              clerk_user_id: user.id,
              page_id: page.id,
              page_name: page.name,
            }),
          });

          if (response.ok) {
            console.log(`✅ Successfully saved connection for ${page.name}`);
            successCount++;
          } else {
            const errorData = await response.json();
            console.error(`❌ Failed to save connection for ${page.name}:`, errorData);
            errorCount++;
          }
        } catch (pageError) {
          console.error(`❌ Error saving connection for ${page.name}:`, pageError);
          errorCount++;
        }
      }

      if (successCount > 0) {
        console.log(`✅ Successfully saved ${successCount} Facebook connections`);
      }
      
      if (errorCount > 0) {
        console.warn(`⚠️ Failed to save ${errorCount} connections`);
      }

    } catch (error) {
      console.error('❌ Error saving connections to Supabase:', error);
    }
  };

  // ✅ Keep your existing saveNewConnectionsToDatabase and handleDisconnect functions
  const saveNewConnectionsToDatabase = async (pages: any[]) => {
    try {
      for (const page of pages) {
        const response = await fetch('/api/facebook-connections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clerk_user_id: user?.id,
            page_id: page.id,
            page_name: page.name,
          }),
        });

        if (!response.ok) {
          console.error('❌ Failed to save connection for page:', page.name);
        }
      }
      
      console.log('✅ New connections saved to database');
    } catch (error) {
      console.error('❌ Error saving new connections:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      console.log('🔌 Disconnecting Facebook...');
      const response = await fetch('/api/facebook-connections', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user?.id || '',
        },
      });

      if (response.ok) {
        setIsConnected(false);
        setConnectedPages([]);
        setSelectedPages([]);
        console.log('✅ Facebook disconnected successfully');
      }
    } catch (error) {
      console.error('❌ Error disconnecting:', error);
    }
  };

  if (!isOpen) return null;

  // ✅ Prepare options for react-select
  const pageOptions = connectedPages.map(page => ({
    value: page.id,
    label: page.name,
    page: page
  }));

  const selectedOptions = selectedPages.map(page => ({
    value: page.id,
    label: page.name,
    page: page
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
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
                <h4 className="text-lg font-medium text-gray-900 mb-2">Connect your Facebook Pages</h4>
                <p className="text-gray-600 text-sm">
                  Connect your Facebook pages to start posting content directly.
                </p>
              </div>
              
              <button
                onClick={handleFacebookLogin}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Connect Facebook Pages
              </button>
            </div>
          ) : (
            <div>
              {/* ✅ Enhanced Connection Status with Add New Page Button */}
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-800 text-sm font-medium">
                      {connectedPages.length} Facebook Page{connectedPages.length !== 1 ? 's' : ''} Connected
                    </span>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    Disconnect All
                  </button>
                </div>
                
                {/* ✅ Add New Page Button */}
                <button
                  onClick={handleAddNewFacebookPage}
                  disabled={isAddingNewPage}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <span>➕</span>
                  <span>{isAddingNewPage ? 'Adding New Page...' : 'Add New Facebook Page'}</span>
                </button>
              </div>

              {/* ✅ Enhanced Multi-Page Selection with Remove Options */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Facebook Pages ({selectedPages.length} selected)
                </label>
                
                {/* ✅ Connected Pages List with Individual Remove Options */}
                <div className="mb-3 space-y-2 max-h-32 overflow-y-auto">
                  {connectedPages.map((page) => (
                    <div key={page.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedPages.some(selected => selected.id === page.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPages([...selectedPages, page]);
                            } else {
                              setSelectedPages(selectedPages.filter(selected => selected.id !== page.id));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-900">{page.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemovePage(page)}
                        className="text-red-500 hover:text-red-700 text-sm"
                        title="Remove this page"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>

                {/* ✅ Select All / Deselect All Buttons */}
                <div className="flex space-x-2 mb-3">
                  <button
                    onClick={() => setSelectedPages([...connectedPages])}
                    className="flex-1 py-1 px-3 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setSelectedPages([])}
                    className="flex-1 py-1 px-3 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Deselect All
                  </button>
                </div>
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
                      />
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center justify-center h-32 bg-gray-200 rounded">
                      <p className="text-xs text-gray-500">Capturing image...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ✅ Enhanced Status Messages */}
              {(postStatus === 'success' || showAddPageModal) && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm font-medium">✅ {errorMessage}</p>
                  {postResults.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {postResults.map((result, index) => (
                        <div key={index} className="text-xs">
                          <span className={result.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                            {result.status === 'success' ? '✅' : '❌'} {result.page}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
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
                  disabled={isPosting || !selectedPages.length}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isPosting ? `Posting to ${selectedPages.length} pages...` : `Post to ${selectedPages.length} page${selectedPages.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 