import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('user_enhanced_onboarding')
    .upsert(req.body, { onConflict: 'clerk_user_id' });

  if (error) {
    return res.status(500).json({ success: false, error });
  }
  res.status(200).json({ success: true, data });
} 