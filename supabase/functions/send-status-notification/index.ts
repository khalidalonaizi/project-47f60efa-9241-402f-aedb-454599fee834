import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  propertyId: string;
  newStatus: string;
  propertyTitle: string;
}

const statusLabels: Record<string, string> = {
  approved: "تمت الموافقة",
  rejected: "مرفوض",
  pending: "قيد المراجعة",
};

serve(async (req) => {
  console.log("Received request to send-status-notification");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { propertyId, newStatus, propertyTitle }: NotificationRequest = await req.json();
    console.log(`Processing notification for property: ${propertyId}, status: ${newStatus}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get property owner info
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('user_id')
      .eq('id', propertyId)
      .single();

    if (propError || !property) {
      console.error("Property not found:", propError);
      throw new Error("Property not found");
    }

    // Get user email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(property.user_id);

    if (userError || !userData.user?.email) {
      console.error("User email not found:", userError);
      throw new Error("User email not found");
    }

    const userEmail = userData.user.email;
    console.log(`Sending email to: ${userEmail}`);

    const statusText = statusLabels[newStatus] || newStatus;
    const statusColor = newStatus === 'approved' ? '#22c55e' : newStatus === 'rejected' ? '#ef4444' : '#f59e0b';

    // Send email using Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "عقاري <onboarding@resend.dev>",
        to: [userEmail],
        subject: `تحديث حالة إعلانك: ${propertyTitle}`,
        html: `
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, sans-serif; direction: rtl; padding: 20px; background: #f9fafb;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1f2937; margin: 0;">🏠 عقاري</h1>
                <p style="color: #6b7280;">منصة العقارات السعودية</p>
              </div>
              
              <div style="border-bottom: 2px solid #e5e7eb; margin-bottom: 20px; padding-bottom: 20px;">
                <h2 style="color: #1f2937; margin-bottom: 10px;">تحديث حالة الإعلان</h2>
                <p style="color: #6b7280; margin: 0;">تم تحديث حالة إعلانك العقاري</p>
              </div>
              
              <div style="background: #f9fafb; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                <p style="color: #6b7280; margin: 0 0 10px;">عنوان الإعلان:</p>
                <p style="color: #1f2937; font-weight: bold; font-size: 18px; margin: 0;">${propertyTitle}</p>
              </div>
              
              <div style="text-align: center; padding: 20px;">
                <span style="background: ${statusColor}; color: white; padding: 10px 30px; border-radius: 25px; font-weight: bold; font-size: 16px;">
                  ${statusText}
                </span>
              </div>
              
              ${newStatus === 'approved' ? `
              <p style="color: #22c55e; text-align: center; margin-top: 20px;">
                🎉 تهانينا! إعلانك الآن مرئي للجميع على المنصة.
              </p>
              ` : newStatus === 'rejected' ? `
              <p style="color: #ef4444; text-align: center; margin-top: 20px;">
                نأسف، تم رفض إعلانك. يرجى مراجعة الشروط وإعادة المحاولة.
              </p>
              ` : ''}
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
                <p>هذا البريد تم إرساله تلقائياً من منصة عقاري</p>
                <p>© 2024 عقاري - جميع الحقوق محفوظة</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Email sent result:", emailResult);

    if (!emailResponse.ok) {
      throw new Error(emailResult.message || "Failed to send email");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-status-notification:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
