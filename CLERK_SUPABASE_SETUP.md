# Clerk-Supabase Integration Setup Guide

This guide provides step-by-step instructions for implementing robust Clerk-Supabase integration with proper authentication testing and Row Level Security (RLS) policies.

## 🚀 Quick Start

### 1. Run Supabase Setup SQL

Execute the `supabase-setup.sql` file in your Supabase SQL Editor:

```sql
-- This creates the test function and proper RLS policies
-- See supabase-setup.sql for the complete setup
```

### 2. Test Authentication Context

The enhanced `UserService` now includes authentication testing:

```typescript
// Test authentication before data operations
const authTest = await UserService.testAuthenticationContext();
console.log('Auth test results:', authTest);
```

## 🔧 Implementation Details

### Enhanced UserService Features

✅ **Authentication Testing**: Verifies JWT tokens and user roles  
✅ **RLS Policy Detection**: Identifies when policies block access  
✅ **Graceful Error Handling**: Provides clear error messages  
✅ **User ID Validation**: Checks JWT sub claim matches Clerk user ID  

### Dashboard Error Handling

✅ **Metadata Fallback**: Uses Clerk metadata when Supabase data is missing  
✅ **Graceful Degradation**: Shows dashboard even with partial data  
✅ **No Redirect Loops**: Prevents infinite redirects on errors  

### Manual Override Options

✅ **Manual Completion Button**: Bypass automatic flow if needed  
✅ **URL Parameter Support**: Dashboard access via completion parameters  
✅ **localStorage Backup**: Stores completion status locally  

## 🧪 Testing Your Setup

### 1. Test Authentication Function

In Supabase SQL Editor:
```sql
SELECT test_authorization_header();
```

Expected result:
```json
{
  "role": "authenticated",
  "sub": "user_xxxxx",
  "exp": 1234567890
}
```

### 2. Test Data Loading

Check browser console for these logs:
```
📥 Loading onboarding data for Clerk user: user_xxxxx
🔍 Auth test results: { role: 'authenticated', userId: 'user_xxxxx', error: null }
✅ Successfully loaded user onboarding data: {...}
```

### 3. Test Error Scenarios

- **RLS Blocked**: Should show "RLS Policy Violation" error
- **No Data**: Should use metadata fallback
- **Auth Failed**: Should show authentication issue details

## 🔒 RLS Policy Details

### Clerk-Compatible Policies

```sql
-- Uses auth.jwt()->>'sub' instead of auth.uid()
CREATE POLICY "Users can view their own onboarding data" ON onboarding
  FOR SELECT 
  TO authenticated 
  USING ((auth.jwt()->>'sub') = clerk_user_id);
```

### Why This Works

- **Clerk uses string IDs**: `user_xxxxx`
- **Supabase auth.uid() returns UUIDs**: `123e4567-e89b-12d3-a456-426614174000`
- **auth.jwt()->>'sub' extracts Clerk user ID**: Matches exactly

## 🚨 Troubleshooting

### Common Issues

1. **"RLS Policy Violation" Error**
   - Check if `test_authorization_header()` returns proper JWT
   - Verify policies use `auth.jwt()->>'sub'` not `auth.uid()`

2. **"Authentication issue" Error**
   - Ensure Clerk JWT is being passed to Supabase
   - Check if user role is 'authenticated'

3. **Empty Error Objects**
   - Usually indicates RLS blocking access
   - Use temporary permissive policy for testing

### Debug Commands

```typescript
// Test authentication context
const authTest = await UserService.testAuthenticationContext();

// Check user metadata
console.log('User metadata:', user.unsafeMetadata);

// Test manual completion
localStorage.setItem('onboardingCompleted', 'true');
window.location.href = '/dashboard?manual=true';
```

## 📋 Expected Results

### Successful Flow
```
✅ Data saved to Supabase successfully
🔄 Updating Clerk user metadata...
✅ Clerk metadata update called successfully
⏳ Waiting for metadata to propagate...
🔍 Updated user metadata after reload: { onboardingComplete: true, ... }
🔄 Starting navigation to dashboard...
✅ Router navigation initiated
```

### Middleware Logs
```
🔍 Middleware check: {
  path: '/dashboard',
  userId: 'Present',
  onboardingComplete: true,
  urlCompleted: '1234567890'
}
✅ Allowing dashboard access with completion parameter
```

## 🔄 Manual Override

If automatic completion fails:

1. **Click Manual Button**: "🚨 Complete Manually (if stuck)"
2. **Use URL Parameter**: Navigate to `/dashboard?manual=true`
3. **Check localStorage**: Verify `onboardingCompleted: 'true'`

## 🧹 Cleanup

After testing, remove temporary permissive policies:

```sql
DROP POLICY IF EXISTS "Temporary permissive select policy" ON onboarding;
```

## 📞 Support

If you encounter issues:

1. Check browser console for detailed error logs
2. Verify Supabase SQL setup was executed correctly
3. Test authentication function in Supabase SQL Editor
4. Use manual override as temporary solution

---

**Note**: This setup ensures robust Clerk-Supabase integration with proper authentication, error handling, and fallback mechanisms. 