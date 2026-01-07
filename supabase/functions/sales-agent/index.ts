import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mock product database matching the n8n workflow
const products = {
  laptops: [
    { name: "ASUS ROG Strix G16", price: 1399, specs: "RTX 4060, 16GB RAM, 165Hz Display", stock: 24 },
    { name: "Lenovo Legion 5 Pro", price: 1499, specs: "RTX 4070, 16GB RAM, 240Hz Display", stock: 18 },
    { name: "MSI Raider GE78", price: 2499, specs: "RTX 4080, 32GB RAM, 240Hz Display", stock: 8 },
    { name: "Dell G15 Gaming", price: 999, specs: "RTX 4050, 16GB RAM, 120Hz Display", stock: 35 },
  ],
  desktops: [
    { name: "Dell XPS Desktop", price: 1899, specs: "RTX 4070, 32GB RAM, 1TB SSD", stock: 5 },
    { name: "HP Omen 45L", price: 2199, specs: "RTX 4080, 64GB RAM, 2TB SSD", stock: 12 },
    { name: "Custom Gaming PC", price: 2999, specs: "RTX 4090, 64GB RAM, 4TB SSD", stock: 3 },
  ],
  accessories: [
    { name: "Mechanical Keyboard RGB", price: 149, specs: "Cherry MX switches, RGB backlight", stock: 0 },
    { name: "4K Gaming Monitor 32\"", price: 599, specs: "144Hz, 1ms response, HDR", stock: 31 },
    { name: "Gaming Mouse Pro", price: 79, specs: "25000 DPI, wireless, RGB", stock: 45 },
    { name: "Gaming Headset 7.1", price: 129, specs: "Surround sound, noise canceling mic", stock: 28 },
  ],
};

const systemPrompt = `You are TinoChat, an AI Sales Agent for a computer store. You help customers find the perfect laptops, desktops, and accessories.

## Available Products:

### Laptops:
${products.laptops.map(p => `- ${p.name} - $${p.price} (${p.specs}) - ${p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}`).join('\n')}

### Desktops:
${products.desktops.map(p => `- ${p.name} - $${p.price} (${p.specs}) - ${p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}`).join('\n')}

### Accessories:
${products.accessories.map(p => `- ${p.name} - $${p.price} (${p.specs}) - ${p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}`).join('\n')}

## Guidelines:
- Be friendly, helpful, and enthusiastic about products
- Use emojis sparingly to make responses engaging (🎮 💻 🖥️ ⌨️)
- Format product recommendations clearly with name, price, and key specs
- Ask clarifying questions about budget, use case, and preferences
- Recommend products based on customer needs
- Mention stock availability when relevant
- Keep responses concise but informative
- If a product is out of stock, suggest alternatives`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationHistory } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing chat request with", conversationHistory?.length || 0, "history messages");

    // Build messages array with system prompt and history
    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory || []).map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream the response back
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Sales agent error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
