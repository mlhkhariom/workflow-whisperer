import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
      console.error('N8N_WEBHOOK_URL is not configured');
      return new Response(
        JSON.stringify({ error: 'N8N webhook URL not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawBody = await req.text();
    if (!rawBody) {
      return new Response(
        JSON.stringify({ error: 'Missing request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let parsedBody: { action?: unknown; data?: unknown };
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (e) {
      console.error('Invalid JSON body:', rawBody);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const action = typeof parsedBody.action === 'string' ? parsedBody.action : null;
    const data = parsedBody.data;

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid "action"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing action: ${action}`, data);

    // Call the n8n webhook directly with action in body
    console.log(`Calling n8n webhook: ${n8nWebhookUrl}`);

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ action, data: data ?? null }),
    });

    const responseText = await response.text();
    console.log(`n8n status: ${response.status}`);
    console.log('n8n raw response:', responseText);

    if (!response.ok) {
      console.error(`n8n webhook error: ${response.status} - ${responseText}`);
      return new Response(
        JSON.stringify({ error: `n8n webhook failed: ${response.status}`, details: responseText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Some routes may legitimately return an empty body — treat that as an empty array
    if (!responseText) {
      return new Response(
        JSON.stringify([]),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result: unknown;
    try {
      result = JSON.parse(responseText);
    } catch {
      console.error('n8n returned invalid JSON');
      return new Response(
        JSON.stringify({ error: 'Invalid JSON returned by n8n', details: responseText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('n8n response parsed OK');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in n8n-proxy function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
