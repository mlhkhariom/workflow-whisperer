import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendMessageRequest {
  phone_number: string;
  message_body?: string;
  template_name?: string;
  template_language?: string;
  field_1?: string;
  field_2?: string;
  field_3?: string;
  field_4?: string;
  field_5?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const apiToken = Deno.env.get('WHATSAPP_API_TOKEN');
  const vendorUid = Deno.env.get('WHATSAPP_VENDOR_UID');
  const apiBaseUrl = 'https://wbuz.in/api';

  if (!apiToken || !vendorUid) {
    console.error('WhatsApp API credentials not configured');
    return new Response(
      JSON.stringify({ error: 'WhatsApp API credentials not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const { action, data } = body;

    console.log(`WhatsApp API action: ${action}`, data);

    switch (action) {
      case 'send-message': {
        const { phone_number, message_body, template_name, template_language } = data as SendMessageRequest;

        if (!phone_number) {
          return new Response(
            JSON.stringify({ error: 'Phone number is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Clean phone number - remove + and leading 0
        const cleanPhone = phone_number.replace(/^\+/, '').replace(/^0+/, '');

        // Build request body according to API documentation
        const requestBody: Record<string, any> = {
          phone_number: cleanPhone,
        };

        // If template is provided, use template-based sending
        if (template_name) {
          requestBody.template_name = template_name;
          requestBody.template_language = template_language || 'en';
          
          // Add template fields if provided
          if (data.field_1) requestBody.field_1 = data.field_1;
          if (data.field_2) requestBody.field_2 = data.field_2;
          if (data.field_3) requestBody.field_3 = data.field_3;
          if (data.field_4) requestBody.field_4 = data.field_4;
          if (data.field_5) requestBody.field_5 = data.field_5;
        } else if (message_body) {
          // Direct message body
          requestBody.message_body = message_body;
        }

        const apiUrl = `${apiBaseUrl}/${vendorUid}/contact/send-message?token=${apiToken}`;
        
        console.log('Sending WhatsApp message to:', cleanPhone);
        console.log('API URL:', apiUrl);
        console.log('Request body:', JSON.stringify(requestBody));

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const responseText = await response.text();
        console.log('WhatsApp API response status:', response.status);
        console.log('WhatsApp API response:', responseText);

        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { raw: responseText };
        }

        if (!response.ok) {
          return new Response(
            JSON.stringify({ 
              error: 'Failed to send message', 
              details: responseData,
              status: response.status 
            }),
            { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, data: responseData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get-contacts': {
        // Fetch contacts from WhatsApp API
        const apiUrl = `${apiBaseUrl}/${vendorUid}/contacts?token=${apiToken}`;
        
        console.log('Fetching WhatsApp contacts');

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiToken}`,
          },
        });

        const responseText = await response.text();
        console.log('WhatsApp contacts response status:', response.status);
        console.log('WhatsApp contacts response:', responseText.substring(0, 500));

        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { raw: responseText };
        }

        if (!response.ok) {
          return new Response(
            JSON.stringify({ 
              error: 'Failed to fetch contacts', 
              details: responseData,
              status: response.status 
            }),
            { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, data: responseData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get-contact': {
        // Fetch a specific contact by phone number or email
        const { phone_number_or_email } = data || {};
        
        if (!phone_number_or_email) {
          return new Response(
            JSON.stringify({ error: 'phone_number_or_email is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const apiUrl = `${apiBaseUrl}/${vendorUid}/contact?phone_number_or_email=${encodeURIComponent(phone_number_or_email)}&token=${apiToken}`;
        
        console.log('Fetching WhatsApp contact:', phone_number_or_email);

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiToken}`,
          },
        });

        const responseText = await response.text();
        console.log('WhatsApp contact response status:', response.status);
        console.log('WhatsApp contact response:', responseText.substring(0, 500));

        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { raw: responseText };
        }

        if (!response.ok) {
          return new Response(
            JSON.stringify({ 
              error: 'Failed to fetch contact', 
              details: responseData,
              status: response.status 
            }),
            { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, data: responseData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('WhatsApp API error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
