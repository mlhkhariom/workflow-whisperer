import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const cloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME");
    const apiKey = Deno.env.get("CLOUDINARY_API_KEY");
    const apiSecret = Deno.env.get("CLOUDINARY_API_SECRET");

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Cloudinary credentials not configured");
    }

    const { action, ...params } = await req.json();

    if (action === "upload") {
      const { image, filename, folder = "product-images" } = params;

      if (!image) {
        throw new Error("Image data is required");
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const publicId = `${folder}/${filename || `image-${timestamp}`}`;
      
      // Create signature
      const signatureString = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(signatureString);
      const hashBuffer = await crypto.subtle.digest("SHA-1", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      const formData = new FormData();
      formData.append("file", image);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);
      formData.append("public_id", publicId);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await uploadResponse.json();

      if (result.error) {
        throw new Error(result.error.message);
      }

      return new Response(
        JSON.stringify({
          success: true,
          url: result.secure_url,
          public_id: result.public_id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "list") {
      const { folder = "product-images" } = params;
      
      // Admin API requires Basic Auth, not signature
      const authString = btoa(`${apiKey}:${apiSecret}`);
      
      const listUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?prefix=${folder}/&type=upload&max_results=500`;

      const listResponse = await fetch(listUrl, {
        headers: {
          "Authorization": `Basic ${authString}`,
        },
      });
      const listResult = await listResponse.json();

      if (listResult.error) {
        throw new Error(listResult.error.message);
      }

      const images = (listResult.resources || []).map((resource: any) => ({
        name: resource.public_id.split("/").pop(),
        url: resource.secure_url,
        public_id: resource.public_id,
        created_at: resource.created_at,
      }));

      return new Response(
        JSON.stringify({ success: true, images }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "delete") {
      const { public_id } = params;

      if (!public_id) {
        throw new Error("public_id is required");
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const signatureString = `public_id=${public_id}&timestamp=${timestamp}${apiSecret}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(signatureString);
      const hashBuffer = await crypto.subtle.digest("SHA-1", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      const formData = new FormData();
      formData.append("public_id", public_id);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);

      const deleteResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await deleteResponse.json();

      return new Response(
        JSON.stringify({ success: result.result === "ok" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "rename") {
      const { from_public_id, to_public_id } = params;

      if (!from_public_id || !to_public_id) {
        throw new Error("from_public_id and to_public_id are required");
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const signatureString = `from_public_id=${from_public_id}&timestamp=${timestamp}&to_public_id=${to_public_id}${apiSecret}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(signatureString);
      const hashBuffer = await crypto.subtle.digest("SHA-1", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      const formData = new FormData();
      formData.append("from_public_id", from_public_id);
      formData.append("to_public_id", to_public_id);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);

      const renameResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/rename`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await renameResponse.json();

      if (result.error) {
        throw new Error(result.error.message);
      }

      return new Response(
        JSON.stringify({
          success: true,
          url: result.secure_url,
          public_id: result.public_id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error: any) {
    console.error("Cloudinary error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
