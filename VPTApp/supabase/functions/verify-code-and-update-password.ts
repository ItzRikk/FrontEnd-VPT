// @ts-ignore: Deno types
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore: Supabase types
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// Declare Deno namespace for TypeScript
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

serve(async (req) => {
  try {
    const { email, code, new_password } = await req.json()
    
    if (!email?.trim() || !code?.trim() || !new_password?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()
    // Format code: remove non-numeric chars and ensure 6 digits with leading zeros
    const cleanCode = code.toString().replace(/[^0-9]/g, '').padStart(6, '0')

    console.log('Debug - Received values:', {
      email: trimmedEmail,
      code: cleanCode,
      codeLength: cleanCode.length
    })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Find valid reset code
    const { data: codes, error: codeError } = await supabase
      .from('password_reset_codes')
      .select()
      .eq('email', trimmedEmail)
      .eq('code', cleanCode)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .limit(1)
      .single()

    console.log('Debug - Found reset codes:', codes)

    if (codeError || !codes) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired code' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserByEmail(
      trimmedEmail,
      { password: new_password }
    )

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update password' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Mark code as used
    await supabase
      .from('password_reset_codes')
      .update({ used: true })
      .eq('id', codes.id)

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Debug - Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to reset password' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}) 