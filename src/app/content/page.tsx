'use client';

import { useState, useRef, useEffect } from 'react';
import { SimpleSidebar } from '@/components/SimpleSidebar';
import { FacebookPostModal } from '@/components/FacebookPostModal';
import { useUser } from '@clerk/nextjs';
import { uploadImageToSupabase } from '@/lib/storage';

// Ayrshare posting utility (client-side, for MVP)
async function postToAyrshare({ post, imageUrl }: { post: string, imageUrl?: string | null }) {
  const apiKey = process.env.NEXT_PUBLIC_AYRSHARE_API_KEY;
  if (!apiKey) {
    throw new Error('Ayrshare API key is missing');
  }
  const res = await fetch('https://api.ayrshare.com/api/post', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      post,
      platforms: ['facebook'],
      mediaUrls: imageUrl ? [imageUrl] : undefined
    })
  });
  return await res.json();
}

// Instagram posting utility using Graph API
async function postToInstagram({ imageUrl, caption, igUserId, accessToken }: { imageUrl: string, caption: string, igUserId: string, accessToken: string }) {
  try {
    // Step 1: Create media object
    const createRes = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          caption,
          access_token: accessToken,
        }),
      }
    );
    const createData = await createRes.json();
    if (createData.error) {
      throw new Error(`Create media failed: ${createData.error.message}`);
    }
    if (!createData.id) {
      throw new Error('Failed to create media object: ' + JSON.stringify(createData));
    }
    // Step 2: Publish media object
    const publishRes = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: createData.id,
          access_token: accessToken,
        }),
      }
    );
    const publishData = await publishRes.json();
    if (publishData.error) {
      throw new Error(`Publish failed: ${publishData.error.message}`);
    }
    if (!publishData.id) {
      throw new Error('Failed to publish media: ' + JSON.stringify(publishData));
    }
    return publishData;
  } catch (error) {
    console.error('Instagram posting error:', error);
    throw error;
  }
}

export default function ContentPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('social-post');
  const [postContent, setPostContent] = useState('🍓 Savor the taste of freshness! Our Berry Blast juice combines strawberries, blueberries, and raspberries for a sweet and tangy treat. #BerryBlast #FruitFusion #HealthyLiving');
  const [selectedTone, setSelectedTone] = useState('friendly');
  const [selectedContentType, setSelectedContentType] = useState('promotional');
  const [showFacebookModal, setShowFacebookModal] = useState(false);
  const [canvasImageData, setCanvasImageData] = useState<string>('');
  const postPreviewRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  const templates = [
    { id: 'social-post', name: 'Social Media Post', icon: '📱' },
    { id: 'story', name: 'Instagram Story', icon: '📖' },
    { id: 'reel', name: 'Instagram Reel', icon: '🎥' },
    { id: 'linkedin', name: 'LinkedIn Post', icon: '💼' }
  ];

  const contentTypes = [
    'Informative', 'Promotional', 'Educational', 'Entertaining', 'Inspirational'
  ];

  const tones = [
    'Professional', 'Friendly', 'Casual', 'Authoritative', 'Humorous'
  ];

  const trendingHashtags = [
    '#important', '#business', '#marketing', '#growth', '#innovation', '#success'
  ];

  const capturePostAsImage = async () => {
    if (!postPreviewRef.current) {
      console.error('❌ Post preview ref not found');
      return '';
    }
    try {
      console.log('📸 Starting image capture...');
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(postPreviewRef.current, {
        background: '#ffffff',
        useCORS: true,
        allowTaint: true,
        width: 500,
        height: 600,
        logging: true
      });
      const dataURL = canvas.toDataURL('image/png', 0.9);
      console.log('✅ Image captured successfully:', {
        width: canvas.width,
        height: canvas.height,
        dataSize: dataURL.length
      });
      return dataURL;
    } catch (error) {
      console.error('❌ Error capturing post image:', error);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 500;
      canvas.height = 400;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        ctx.fillText('Fresh Orange Juice Post', 50, 50);
        ctx.fillText(postContent.substring(0, 50) + '...', 50, 100);
      }
      return canvas.toDataURL('image/png', 0.9);
    }
  };

  const handlePostNow = async () => {
    setShowFacebookModal(true);
    setCanvasImageData('');
    setTimeout(async () => {
      const imageData = await capturePostAsImage();
      setCanvasImageData(imageData);

      // No Supabase insert, just use the Google Drive link
      const result = await postToAyrshare({
        post: postContent,
      });

      if (result.status === "success") {
        alert('✅ Posted to Facebook via Ayrshare!');
      } else if (result.errors && result.errors.length > 0) {
        alert('❌ Failed to post: ' + (result.errors[0].message || JSON.stringify(result.errors)));
      } else {
        alert('❌ Failed to post: ' + (result.error || JSON.stringify(result)));
      }
    }, 100);
  };

  // Instagram handler
  const handleInstagramPost = async () => {
    try {
      const accessToken = process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN;
      const igUserId = process.env.NEXT_PUBLIC_INSTAGRAM_USER_ID;
      if (!accessToken || !igUserId) {
        alert('❌ Instagram credentials missing. Check your .env file.');
        return;
      }
      // Use a reliable direct image URL
      const imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop';
      const result = await postToInstagram({
        imageUrl,
        caption: postContent,
        igUserId,
        accessToken
      });
      alert('✅ Posted to Instagram successfully!');
      console.log('Instagram post result:', result);
    } catch (error: any) {
      alert('❌ Failed to post to Instagram: ' + (error.message || error));
      console.error('Instagram posting error:', error);
    }
  };

  // Add the handleWebShare function
  const handleWebShare = (content: string) => {
    const shareUrl = "https://unsplash.com/photos/a-close-up-of-some-snow-Px5UF7da7q4"; // Change to your actual page URL

    if (navigator.share) {
      navigator.share({
        title: 'Fresh Orange Juice',
        text: content,
        url: shareUrl,
      })
        .then(() => console.log('Share successful'))
        .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback: Facebook Share Dialog (desktop)
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        'facebook-share-dialog',
        'width=600,height=400'
      );
    }
  };

  // Load Facebook SDK
  useEffect(() => {
    // Only load once
    if (document.getElementById('facebook-jssdk')) return;
    const fbRoot = document.createElement('div');
    fbRoot.id = 'fb-root';
    document.body.appendChild(fbRoot);
    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    document.body.appendChild(script);
    (window as any).fbAsyncInit = function() {
      (window as any).FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID, // Uses your .env value
        xfbml: true,
        version: 'v20.0'
      });
    };
  }, []);

  // Facebook Share Dialog
  const shareOnFacebook = () => {
    const FB = (window as any).FB;
    if (!FB) {
      alert('Facebook SDK not loaded yet. Please try again in a moment.');
      return;
    }
    FB.ui({
      method: 'share',
      href: 'https://unsplash.com/photos/a-close-up-of-some-snow-Px5UF7da7q4', // Must be public and have correct og:image
      hashtag: '#FreshJuice', // Only one hashtag allowed
      quote: '🍊 dsfdsfRefreshing start to your day! Our 100% natural orange juice is packed with Vitamin C and fresh-squeezed goodness. Perfect for a healthy lifestyle!' // May or may not appear
    }, function(response: any) {
      if (response && !response.error_message) {
        alert('Posting completed.');
      } else {
        alert('Error while posting.');
      }
    });
  };
  return (
    <>
      <SimpleSidebar onToggle={setSidebarCollapsed} />
      <div className={`flex h-screen bg-gray-50 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <div className={`bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 ${
          sidebarCollapsed ? 'w-72' : 'w-80'
        }`}>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Content Creator</h2>
            
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Templates</h3>
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`w-full flex items-center p-3 rounded-lg border transition-all ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl mr-3">{template.icon}</span>
                    <span className="font-medium">{template.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Product Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Product Name</label>
                  <input
                    type="text"
                    defaultValue="Fresh Orange Juice"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Key Features</label>
                  <textarea
                    defaultValue="100% Natural, Vitamin C Rich, Fresh Squeezed"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Price Point</label>
                  <input
                    type="text"
                    defaultValue="Premium Quality"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Brand Colors</h3>
              <div className="flex space-x-2">
                <div className="w-12 h-12 rounded-lg border-2 border-gray-200 bg-green-600" />
                <div className="w-12 h-12 rounded-lg border-2 border-gray-200 bg-orange-500" />
                <button className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400">
                  +
                </button>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Content Types</h3>
              <div className="flex flex-wrap gap-2">
                {contentTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedContentType(type.toLowerCase())}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      selectedContentType === type.toLowerCase()
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Tone</h3>
              <div className="flex flex-wrap gap-2">
                {tones.map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setSelectedTone(tone.toLowerCase())}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      selectedTone === tone.toLowerCase()
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all">
              ✨ Generate Content
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                <span>📁</span>
                <span>Save to draft</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                <span>📅</span>
                <span>Schedule post</span>
              </button>
            </div>
            <div className="flex flex-col space-y-2">
              <button 
                onClick={handlePostNow}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Post now → Facebook
              </button>
              <button 
                onClick={handleInstagramPost}
                className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white px-6 py-2 rounded-lg hover:from-pink-600 hover:to-yellow-600 font-medium flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Post now → Instagram
              </button>
            </div>
          </div>

          <div className="flex-1 p-8 overflow-auto bg-gray-100">
            <div className="flex items-center justify-center min-h-full">
              <div 
                ref={postPreviewRef}
                className="bg-white rounded-lg shadow-xl overflow-hidden" 
                style={{ 
                  width: '500px',
                  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif'
                }}
              >
                <div className="px-4 pt-3 pb-2 flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                      FJ
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold text-gray-900 text-[15px] leading-5">Fresh Juice Co.</span>
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <span className="text-gray-500 text-[13px]">2h</span>
                      <div className="w-3 h-3 text-gray-500 text-[12px]">🌍</div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 p-1">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </div>

                <div className="px-4 pb-3">
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="w-full border-none resize-none focus:outline-none text-gray-900 text-[15px] leading-[20px] bg-transparent"
                    placeholder="What's on your mind?"
                    rows={4}
                    style={{ fontFamily: 'inherit' }}
                  />
                </div>

                <div className="relative">
                  <div 
                    className="w-full bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300 flex items-center justify-center relative overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
                    style={{ height: '262px' }}
                  >
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      <div className="relative">
                        <div className="w-24 h-48 bg-gradient-to-b from-orange-500 to-orange-600 rounded-lg mx-auto relative overflow-hidden shadow-2xl">
                          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-t-lg border-2 border-green-400"></div>
                          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-20 h-24 bg-white rounded-lg opacity-95 flex flex-col items-center justify-center shadow-lg">
                            <div className="text-orange-600 text-sm font-bold">100%</div>
                            <div className="text-orange-600 text-xs font-bold">NATURAL</div>
                            <div className="text-orange-600 text-xs">ORANGE</div>
                            <div className="text-orange-500 text-xs mt-1">JUICE</div>
                            <div className="w-12 h-1 bg-orange-400 rounded mt-1"></div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-orange-400 to-orange-300 rounded-b-lg"></div>
                          <div className="absolute top-6 left-2 w-2 h-32 bg-white opacity-30 rounded-full"></div>
                        </div>
                      </div>
                      {Array.from({ length: 15 }, (_, i) => (
                        <div
                          key={i}
                          className="absolute rounded-full border-2 border-orange-400 opacity-40"
                          style={{
                            width: `${20 + (i % 3) * 8}px`,
                            height: `${20 + (i % 3) * 8}px`,
                            top: `${10 + (i % 5) * 18}%`,
                            left: `${5 + (i % 6) * 15}%`,
                            background: `radial-gradient(circle at 30% 30%, #fb923c, #ea580c)`,
                            transform: `rotate(${i * 24}deg)`
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-orange-500 opacity-60"></div>
                            <div className="absolute w-0.5 h-full bg-orange-500 opacity-60"></div>
                          </div>
                        </div>
                      ))}
                      <div className="absolute top-8 right-12 w-12 h-12 rounded-full border-3 border-orange-400 opacity-70" 
                           style={{ background: 'radial-gradient(circle at center, #fb923c 40%, #ea580c 100%)' }}>
                        <div className="absolute inset-2 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-orange-600"></div>
                          <div className="absolute w-0.5 h-full bg-orange-600"></div>
                        </div>
                      </div>
                      <div className="absolute bottom-12 left-8 w-16 h-16 rounded-full border-3 border-orange-400 opacity-70"
                           style={{ background: 'radial-gradient(circle at center, #fb923c 40%, #ea580c 100%)' }}>
                        <div className="absolute inset-3 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-orange-600"></div>
                          <div className="absolute w-0.5 h-full bg-orange-600"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Share Button - updated to use Facebook SDK */}
                <div className="flex justify-end mt-4">
                  <button
                    onClick={shareOnFacebook}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8a3 3 0 0 0-2.83 2H8.83A3 3 0 1 0 6 14.83v.34A3 3 0 1 0 8.83 20h6.34A3 3 0 1 0 18 14.83v-.34A3 3 0 1 0 15.17 8h2.66A3 3 0 1 0 18 8z" />
                    </svg>
                    Share on Facebook
                  </button>
                </div>

                <div className="px-4 py-3">
                  <div className="flex items-center justify-between text-[13px] text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <div className="flex -space-x-1">
                        <div className="w-[18px] h-[18px] bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] border border-white">👍</div>
                        <div className="w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] border border-white">❤️</div>
                        <div className="w-[18px] h-[18px] bg-yellow-500 rounded-full flex items-center justify-center text-white text-[10px] border border-white">😊</div>
                      </div>
                      <span className="ml-2 hover:underline cursor-pointer">47</span>
                    </div>
                    <div className="flex space-x-3">
                      <span className="hover:underline cursor-pointer">8 comments</span>
                      <span className="hover:underline cursor-pointer">3 shares</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-1">
                    <div className="flex items-center">
                      <button className="flex-1 flex items-center justify-center space-x-2 py-2 hover:bg-gray-50 rounded-md text-gray-600 text-[15px] font-medium transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V18m-7-8a2 2 0 01-2-2V6a2 2 0 012-2h2.343M7 20L4.343 17.343A2 2 0 013 15.828V9.172a2 2 0 01.586-1.414L6 5.414a2 2 0 011.414-.586h.172a2 2 0 011.414.586L12 8.414a2 2 0 01.586 1.414v5.172a2 2 0 01-.586 1.414L9.586 19.414A2 2 0 018.172 20H7z" />
                        </svg>
                        <span>Like</span>
                      </button>
                      <button className="flex-1 flex items-center justify-center space-x-2 py-2 hover:bg-gray-50 rounded-md text-gray-600 text-[15px] font-medium transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Comment</span>
                      </button>
                      <button className="flex-1 flex items-center justify-center space-x-2 py-2 hover:bg-gray-50 rounded-md text-gray-600 text-[15px] font-medium transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`bg-white border-l border-gray-200 overflow-y-auto transition-all duration-300 ${
          sidebarCollapsed ? 'w-72' : 'w-80'
        }`}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Suggestions</h3>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Trending hashtags</h4>
              <div className="flex flex-wrap gap-2">
                {trendingHashtags.map((hashtag) => (
                  <button
                    key={hashtag}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-200"
                  >
                    {hashtag}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Hot topics</h4>
              <div className="flex flex-wrap gap-2">
                {['Summer drinks', 'Healthy lifestyle', 'Natural products', 'Vitamin C', 'Fresh juice', 'Organic'].map((topic) => (
                  <button
                    key={topic}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm hover:bg-blue-200"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Content Ideas</h4>
              <div className="space-y-3">
                {[
                  'Share the health benefits of fresh orange juice',
                  'Behind-the-scenes of juice making process',
                  'Customer testimonials and reviews',
                  'Seasonal fruit availability updates'
                ].map((idea, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                    {idea}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <FacebookPostModal
        isOpen={showFacebookModal}
        onClose={() => {
          setShowFacebookModal(false);
          setCanvasImageData('');
        }}
        postContent={postContent}
        postImage={canvasImageData}
      />
    </>
  );
} 