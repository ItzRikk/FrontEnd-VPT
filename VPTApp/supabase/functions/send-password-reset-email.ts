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

const RESEND_API_ENDPOINT = 'https://api.resend.com/emails'
const FROM_EMAIL = 'onboarding@resend.dev'

serve(async (req) => {
  try {
    const { email } = await req.json()
    
    if (!email?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()
    
    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // First, mark any existing unused codes for this email as used
    const { error: updateError } = await supabase
      .from('password_reset_codes')
      .update({ used: true })
      .eq('email', trimmedEmail)
      .eq('used', false)

    if (updateError) {
      console.error('Debug - Failed to update existing codes:', updateError)
      // Continue anyway to insert new code
    }

    // Insert new reset code
    const { error: insertError } = await supabase
      .from('password_reset_codes')
      .insert([{
        email: trimmedEmail,
        code,
        expires_at: expiresAt.toISOString(),
        used: false
      }])

    if (insertError) {
      console.error('Debug - Failed to insert new code:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to store reset code' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Send email with reset code
    const resendRes = await fetch(RESEND_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `VPT App <${FROM_EMAIL}>`,
        to: trimmedEmail,
        subject: 'Your VPT Password Reset Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Password Reset Code</h2>
            <p style="font-size: 16px; color: #555;">Your password reset code is:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="font-size: 24px; font-weight: bold; color: #000; text-align: center; margin: 0;">${code}</p>
            </div>
            <p style="color: #666;">This code will expire in 15 minutes.</p>
            <p style="color: #999; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
          </div>
        `,
      }),
    })

    if (!resendRes.ok) {
      const resendError = await resendRes.text()
      console.error('Debug - Failed to send email:', resendError)
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        message: 'Reset code sent successfully',
        success: true
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Debug - Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}) 