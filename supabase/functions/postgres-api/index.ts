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

      // ==================== LAPTOPS ====================
      case 'get-laptop':
        result = await client.queryObject(`
          SELECT row_number, brand, model, processor, generation, ram_gb, storage_type, storage_gb, 
                 screen_size, graphics, condition, price_range, stock_quantity, special_feature,
                 warranty_in_months, image_url_1, image_url_2, updated_at
          FROM laptops ORDER BY row_number
        `);
        return jsonResponse(result.rows);

      case 'add-laptop':
        result = await client.queryObject(
          `INSERT INTO laptops (brand, model, processor, generation, ram_gb, storage_type, storage_gb,
                                screen_size, graphics, condition, price_range, stock_quantity, 
                                special_feature, warranty_in_months, image_url_1, image_url_2, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW()) 
           RETURNING row_number, *`,
          [
            data?.brand || '', data?.model || '', data?.processor || '', data?.generation || '',
            data?.ram_gb || null, data?.storage_type || '', data?.storage_gb || null,
            data?.screen_size || '', data?.graphics || '', data?.condition || 'Used',
            data?.price_range || '', data?.stock_quantity || 0, data?.special_feature || '',
            data?.warranty_in_months || null, data?.image_url_1 || null, data?.image_url_2 || null
          ]
        );
        return jsonResponse(result.rows[0] || { success: true });

      case 'update-laptop':
        result = await client.queryObject(
          `UPDATE laptops SET 
             brand = $1, model = $2, processor = $3, generation = $4, ram_gb = $5, 
             storage_type = $6, storage_gb = $7, screen_size = $8, graphics = $9, 
             condition = $10, price_range = $11, stock_quantity = $12, special_feature = $13,
             warranty_in_months = $14, image_url_1 = $15, image_url_2 = $16, updated_at = NOW()
           WHERE row_number = $17 RETURNING row_number, *`,
          [
            data?.brand || '', data?.model || '', data?.processor || '', data?.generation || '',
            data?.ram_gb || null, data?.storage_type || '', data?.storage_gb || null,
            data?.screen_size || '', data?.graphics || '', data?.condition || 'Used',
            data?.price_range || '', data?.stock_quantity || 0, data?.special_feature || '',
            data?.warranty_in_months || null, data?.image_url_1 || null, data?.image_url_2 || null,
            data?.id
          ]
        );
        return jsonResponse(result.rows[0] || { success: true });

      case 'delete-laptop':
        await client.queryObject('DELETE FROM laptops WHERE row_number = $1', [data?.id]);
        return jsonResponse({ success: true });

      // ==================== DESKTOPS ====================
      case 'get-desktops':
        result = await client.queryObject(`
          SELECT row_number, brand, model, processor, generation, ram_gb, ram_type, storage_gb,
                 monitor_size, graphics, condition, price_range, stock_quantity, special_feature,
                 warranty_in_months, image_url_1, image_url_2, updated_at
          FROM desktops ORDER BY row_number
        `);
        return jsonResponse(result.rows);

      case 'add-desktop':
        result = await client.queryObject(
          `INSERT INTO desktops (brand, model, processor, generation, ram_gb, ram_type, storage_gb,
                                 monitor_size, graphics, condition, price_range, stock_quantity,
                                 special_feature, warranty_in_months, image_url_1, image_url_2, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
           RETURNING row_number, *`,
          [
            data?.brand || '', data?.model || '', data?.processor || '', data?.generation || '',
            data?.ram_gb || null, data?.ram_type || '', data?.storage_gb || null,
            data?.monitor_size || '', data?.graphics || '', data?.condition || 'Used',
            data?.price_range || '', data?.stock_quantity || 0, data?.special_feature || '',
            data?.warranty_in_months || null, data?.image_url_1 || null, data?.image_url_2 || null
          ]
        );
        return jsonResponse(result.rows[0] || { success: true });

      case 'update-desktop':
        result = await client.queryObject(
          `UPDATE desktops SET 
             brand = $1, model = $2, processor = $3, generation = $4, ram_gb = $5,
             ram_type = $6, storage_gb = $7, monitor_size = $8, graphics = $9,
             condition = $10, price_range = $11, stock_quantity = $12, special_feature = $13,
             warranty_in_months = $14, image_url_1 = $15, image_url_2 = $16, updated_at = NOW()
           WHERE row_number = $17 RETURNING row_number, *`,
          [
            data?.brand || '', data?.model || '', data?.processor || '', data?.generation || '',
            data?.ram_gb || null, data?.ram_type || '', data?.storage_gb || null,
            data?.monitor_size || '', data?.graphics || '', data?.condition || 'Used',
            data?.price_range || '', data?.stock_quantity || 0, data?.special_feature || '',
            data?.warranty_in_months || null, data?.image_url_1 || null, data?.image_url_2 || null,
            data?.id
          ]
        );
        return jsonResponse(result.rows[0] || { success: true });

      case 'delete-desktop':
        await client.queryObject('DELETE FROM desktops WHERE row_number = $1', [data?.id]);
        return jsonResponse({ success: true });

      // ==================== ACCESSORIES ====================
      case 'get-accessories':
        result = await client.queryObject(`
          SELECT row_number, accessories_name, price_range_inr, image_url_1, image_url_2, updated_at
          FROM accessories ORDER BY row_number
        `);
        return jsonResponse(result.rows);

      case 'add-accessory':
        result = await client.queryObject(
          `INSERT INTO accessories (accessories_name, price_range_inr, image_url_1, image_url_2, updated_at)
           VALUES ($1, $2, $3, $4, NOW()) RETURNING row_number, *`,
          [data?.name || '', data?.price_range || '', data?.image_url_1 || null, data?.image_url_2 || null]
        );
        return jsonResponse(result.rows[0] || { success: true });

      case 'update-accessory':
        result = await client.queryObject(
          `UPDATE accessories SET 
             accessories_name = $1, price_range_inr = $2, image_url_1 = $3, image_url_2 = $4, updated_at = NOW()
           WHERE row_number = $5 RETURNING row_number, *`,
          [data?.name || '', data?.price_range || '', data?.image_url_1 || null, data?.image_url_2 || null, data?.id]
        );
        return jsonResponse(result.rows[0] || { success: true });

      case 'delete-accessory':
        await client.queryObject('DELETE FROM accessories WHERE row_number = $1', [data?.id]);
        return jsonResponse({ success: true });

      // ==================== CHATS ====================
      case 'get-chats':
        result = await client.queryObject(`
          SELECT id, contact_uid, role, content, created_at 
          FROM chat_messages 
          ORDER BY created_at DESC
        `);
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
