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

    // Connect to PostgreSQL with TLS disabled
    const connectionUrl = postgresUrl.includes('?') 
      ? `${postgresUrl}&sslmode=disable` 
      : `${postgresUrl}?sslmode=disable`;
    
    client = new Client(connectionUrl);
    await client.connect();

    let result: any;

    switch (action) {
      // Debug - List all tables
      case 'list-tables':
        result = await client.queryObject(`
          SELECT table_name, table_schema 
          FROM information_schema.tables 
          WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
          ORDER BY table_schema, table_name
        `);
        console.log('Tables found:', result.rows);
        return jsonResponse(result.rows);

      // Debug - Describe table columns
      case 'describe-table':
        result = await client.queryObject(`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = $1
          ORDER BY ordinal_position
        `, [data?.table]);
        console.log('Columns:', result.rows);
        return jsonResponse(result.rows);

      // Products - GET (using row_number as id)
      case 'get-laptop':
        result = await client.queryObject('SELECT row_number as id, * FROM laptops ORDER BY row_number');
        return jsonResponse(result.rows);

      case 'get-desktops':
        result = await client.queryObject('SELECT row_number as id, * FROM desktops ORDER BY row_number');
        return jsonResponse(result.rows);

      case 'get-accessories':
        result = await client.queryObject('SELECT row_number as id, * FROM accessories ORDER BY row_number');
        return jsonResponse(result.rows);

      // Products - ADD
      case 'add-laptop':
        result = await client.queryObject(
          `INSERT INTO laptops (brand, model, price_range, stock_quantity, image_url_1) 
           VALUES ($1, $2, $3, $4, $5) RETURNING row_number as id, *`,
          [data?.name?.split(' ')[0] || '', data?.name?.split(' ').slice(1).join(' ') || '', String(data?.price || '0'), data?.stock || 0, data?.imageUrl || null]
        );
        return jsonResponse(result.rows[0] || { success: true });

      case 'add-desktop':
        result = await client.queryObject(
          `INSERT INTO desktops (brand, model, price_range, stock_quantity, image_url_1) 
           VALUES ($1, $2, $3, $4, $5) RETURNING row_number as id, *`,
          [data?.name?.split(' ')[0] || '', data?.name?.split(' ').slice(1).join(' ') || '', String(data?.price || '0'), data?.stock || 0, data?.imageUrl || null]
        );
        return jsonResponse(result.rows[0] || { success: true });

      case 'add-accessory':
        result = await client.queryObject(
          `INSERT INTO accessories (accessories_name, price_range_inr, image_url_1) 
           VALUES ($1, $2, $3) RETURNING row_number as id, *`,
          [data?.name || '', String(data?.price || '0'), data?.imageUrl || null]
        );
        return jsonResponse(result.rows[0] || { success: true });

      // Products - UPDATE (using row_number)
      case 'update-laptop':
        result = await client.queryObject(
          `UPDATE laptops SET brand = $1, model = $2, price_range = $3, stock_quantity = $4, image_url_1 = $5 
           WHERE row_number = $6 RETURNING row_number as id, *`,
          [data?.name?.split(' ')[0] || '', data?.name?.split(' ').slice(1).join(' ') || '', String(data?.price || '0'), data?.stock || 0, data?.imageUrl || null, data?.id]
        );
        return jsonResponse(result.rows[0] || { success: true });

      case 'update-desktop':
        result = await client.queryObject(
          `UPDATE desktops SET brand = $1, model = $2, price_range = $3, stock_quantity = $4, image_url_1 = $5 
           WHERE row_number = $6 RETURNING row_number as id, *`,
          [data?.name?.split(' ')[0] || '', data?.name?.split(' ').slice(1).join(' ') || '', String(data?.price || '0'), data?.stock || 0, data?.imageUrl || null, data?.id]
        );
        return jsonResponse(result.rows[0] || { success: true });

      case 'update-accessory':
        result = await client.queryObject(
          `UPDATE accessories SET accessories_name = $1, price_range_inr = $2, image_url_1 = $3 
           WHERE row_number = $4 RETURNING row_number as id, *`,
          [data?.name || '', String(data?.price || '0'), data?.imageUrl || null, data?.id]
        );
        return jsonResponse(result.rows[0] || { success: true });

      // Products - DELETE (using row_number)
      case 'delete-laptop':
        await client.queryObject('DELETE FROM laptops WHERE row_number = $1', [data?.id]);
        return jsonResponse({ success: true });

      case 'delete-desktop':
        await client.queryObject('DELETE FROM desktops WHERE row_number = $1', [data?.id]);
        return jsonResponse({ success: true });

      case 'delete-accessory':
        await client.queryObject('DELETE FROM accessories WHERE row_number = $1', [data?.id]);
        return jsonResponse({ success: true });

      // Chats - using chat_messages table (columns: id, contact_uid, role, content, created_at)
      case 'get-chats':
        result = await client.queryObject('SELECT * FROM chat_messages ORDER BY created_at DESC');
        return jsonResponse(result.rows);

      case 'send-message':
        result = await client.queryObject(
          `INSERT INTO chat_messages (contact_uid, content, role, created_at) 
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
