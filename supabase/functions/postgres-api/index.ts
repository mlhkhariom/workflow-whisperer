import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const postgresUrl = Deno.env.get('EXTERNAL_POSTGRES_URL');

  if (!postgresUrl) {
    console.error('EXTERNAL_POSTGRES_URL is not configured');
    return new Response(
      JSON.stringify({ error: 'Database connection not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let client: Client | null = null;

  try {
    const rawBody = await req.text();
    if (!rawBody) {
      return new Response(
        JSON.stringify({ error: 'Missing request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let parsedBody: { action?: string; data?: any };
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, data } = parsedBody;
    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing action: ${action}`, data);

    // Connect to PostgreSQL
    client = new Client(postgresUrl);
    await client.connect();

    let result: any;

    switch (action) {
      // Products - GET
      case 'get-laptop':
        result = await client.queryObject('SELECT * FROM laptops ORDER BY id');
        return jsonResponse(result.rows);

      case 'get-desktops':
        result = await client.queryObject('SELECT * FROM desktops ORDER BY id');
        return jsonResponse(result.rows);

      case 'get-accessories':
        result = await client.queryObject('SELECT * FROM accessories ORDER BY id');
        return jsonResponse(result.rows);

      // Products - ADD
      case 'add-laptop':
        result = await client.queryObject(
          `INSERT INTO laptops (brand, model, price_range, stock_quantity, image_url_1) 
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [data?.name?.split(' ')[0] || '', data?.name?.split(' ').slice(1).join(' ') || '', String(data?.price || '0'), data?.stock || 0, data?.imageUrl || null]
        );
        return jsonResponse(result.rows[0] || { success: true });

      case 'add-desktop':
        result = await client.queryObject(
          `INSERT INTO desktops (name, price_range, stock_quantity, image_url_1) 
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [data?.name || '', String(data?.price || '0'), data?.stock || 0, data?.imageUrl || null]
        );
        return jsonResponse(result.rows[0] || { success: true });

      case 'add-accessory':
        result = await client.queryObject(
          `INSERT INTO accessories (accessories_name, price_range_inr, image_url_1) 
           VALUES ($1, $2, $3) RETURNING *`,
          [data?.name || '', String(data?.price || '0'), data?.imageUrl || null]
        );
        return jsonResponse(result.rows[0] || { success: true });

      // Products - UPDATE
      case 'update-laptop':
        result = await client.queryObject(
          `UPDATE laptops SET brand = $1, model = $2, price_range = $3, stock_quantity = $4, image_url_1 = $5 
           WHERE id = $6 RETURNING *`,
          [data?.name?.split(' ')[0] || '', data?.name?.split(' ').slice(1).join(' ') || '', String(data?.price || '0'), data?.stock || 0, data?.imageUrl || null, data?.id]
        );
        return jsonResponse(result.rows[0] || { success: true });

      case 'update-desktop':
        result = await client.queryObject(
          `UPDATE desktops SET name = $1, price_range = $2, stock_quantity = $3, image_url_1 = $4 
           WHERE id = $5 RETURNING *`,
          [data?.name || '', String(data?.price || '0'), data?.stock || 0, data?.imageUrl || null, data?.id]
        );
        return jsonResponse(result.rows[0] || { success: true });

      case 'update-accessory':
        result = await client.queryObject(
          `UPDATE accessories SET accessories_name = $1, price_range_inr = $2, image_url_1 = $3 
           WHERE id = $4 RETURNING *`,
          [data?.name || '', String(data?.price || '0'), data?.imageUrl || null, data?.id]
        );
        return jsonResponse(result.rows[0] || { success: true });

      // Products - DELETE
      case 'delete-laptop':
        await client.queryObject('DELETE FROM laptops WHERE id = $1', [data?.id]);
        return jsonResponse({ success: true });

      case 'delete-desktop':
        await client.queryObject('DELETE FROM desktops WHERE id = $1', [data?.id]);
        return jsonResponse({ success: true });

      case 'delete-accessory':
        await client.queryObject('DELETE FROM accessories WHERE id = $1', [data?.id]);
        return jsonResponse({ success: true });

      // Chats
      case 'get-chats':
        result = await client.queryObject('SELECT * FROM chats ORDER BY created_at DESC');
        return jsonResponse(result.rows);

      case 'send-message':
        result = await client.queryObject(
          `INSERT INTO chats (contact_uid, message_text, role, created_at) 
           VALUES ($1, $2, 'assistant', NOW()) RETURNING *`,
          [data?.contactId, data?.message]
        );
        return jsonResponse(result.rows[0] || { success: true });

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Database error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (e) {
        console.error('Error closing connection:', e);
      }
    }
  }
});

function jsonResponse(data: any) {
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
