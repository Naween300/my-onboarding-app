import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await supabase
    .from('user_enhanced_onboarding')
    .select('*')
    .limit(1);

  if (error) {
    res.status(500).json({ success: false, error });
  } else {
    res.status(200).json({ success: true, data });
  }
} 