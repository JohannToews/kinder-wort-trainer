import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch stories with base64 cover images (batch of 10 to avoid timeouts)
    const { data: stories, error: fetchError } = await supabase
      .from("stories")
      .select("id, cover_image_url")
      .like("cover_image_url", "data:%")
      .limit(10);

    if (fetchError) {
      throw new Error(`Fetch error: ${fetchError.message}`);
    }

    if (!stories || stories.length === 0) {
      return new Response(JSON.stringify({
        migrated: 0,
        errors: 0,
        remaining: 0,
        message: "No base64 covers remaining"
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Count total remaining
    const { count: totalRemaining } = await supabase
      .from("stories")
      .select("id", { count: "exact", head: true })
      .like("cover_image_url", "data:%");

    let migrated = 0;
    let errors = 0;
    const errorDetails: string[] = [];

    for (const story of stories) {
      try {
        const base64Url = story.cover_image_url as string;
        
        // Extract mime type and base64 data
        const matches = base64Url.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
          errorDetails.push(`${story.id}: Invalid base64 format`);
          errors++;
          continue;
        }

        const mimeType = matches[1];
        const b64Data = matches[2];
        
        // Decode base64 to binary
        const binaryStr = atob(b64Data);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }

        // Determine file extension
        const ext = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpg";
        const storagePath = `covers/${story.id}.${ext}`;

        // Upload to storage (upsert)
        const { error: uploadError } = await supabase.storage
          .from("story-images")
          .upload(storagePath, bytes, {
            contentType: mimeType,
            upsert: true,
          });

        if (uploadError) {
          errorDetails.push(`${story.id}: Upload failed - ${uploadError.message}`);
          errors++;
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("story-images")
          .getPublicUrl(storagePath);

        // Update the story record
        const { error: updateError } = await supabase
          .from("stories")
          .update({ cover_image_url: urlData.publicUrl })
          .eq("id", story.id);

        if (updateError) {
          errorDetails.push(`${story.id}: DB update failed - ${updateError.message}`);
          errors++;
          continue;
        }

        migrated++;
        console.log(`Migrated cover for story ${story.id}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errorDetails.push(`${story.id}: ${msg}`);
        errors++;
      }
    }

    const remaining = (totalRemaining || 0) - migrated;

    return new Response(JSON.stringify({
      migrated,
      errors,
      remaining,
      errorDetails: errorDetails.length > 0 ? errorDetails : undefined,
      message: remaining > 0 
        ? `Migrated ${migrated}/${stories.length}. Call again to process remaining ${remaining}.` 
        : `Migration complete! All covers migrated.`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Migration error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
