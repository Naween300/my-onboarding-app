export async function createAyrshareProfile(userIdOrEmail: string) {
  const response = await fetch('https://api.ayrshare.com/api/profiles', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.AYRSHARE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: userIdOrEmail }),
  });
  if (!response.ok) throw new Error('Failed to create Ayrshare profile');
  const data = await response.json();
  return data.profileKey;
}

export async function generateAyrshareJWT(profileKey: string) {
  const response = await fetch(`https://api.ayrshare.com/api/profiles/${profileKey}/generateJWT`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.AYRSHARE_API_KEY}`,
    },
  });
  if (!response.ok) throw new Error('Failed to generate JWT');
  const data = await response.json();
  return `https://app.ayrshare.com/link?jwt=${data.jwt}`;
}

export async function postToFacebook(profileKey: string, postText: string, imageUrl: string) {
  const response = await fetch('https://api.ayrshare.com/api/post', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.AYRSHARE_API_KEY}`,
      'Profile-Key': profileKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      post: postText,
      platforms: ['facebook'],
      mediaUrls: [imageUrl],
    }),
  });
  return await response.json();
} 