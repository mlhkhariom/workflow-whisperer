import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    
    if (!n8nWebhookUrl) {
      throw new Error('N8N_WEBHOOK_URL not configured');
    }

    const { action, data } = await req.json();
    console.log('n8n-proxy called with action:', action);

    let endpoint = '';
    let method = 'GET';
    let body = null;

    switch (action) {
      case 'get_products':
        endpoint = '/products';
        break;
      case 'get_chats':
        endpoint = '/chats';
        break;
      case 'get_chat_messages':
        endpoint = '/chat-messages';
        method = 'POST';
        body = JSON.stringify({ contact_uid: data?.contact_uid });
        break;
      case 'send_message':
        endpoint = '/send-message';
        method = 'POST';
        body = JSON.stringify({ 
          contact_uid: data?.contact_uid,
          message: data?.message 
        });
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const url = `${n8nWebhookUrl}${endpoint}`;
    console.log('Calling n8n endpoint:', url);

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      ...(body && { body }),
    });

    const responseData = await response.json();
    console.log('n8n response:', responseData);

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in n8n-proxy function:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
