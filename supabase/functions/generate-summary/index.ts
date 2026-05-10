// supabase/functions/generate-summary/index.ts
// Exam League — AI Summary Generator Edge Function
// Trigger: Admin clicks "Generate AI Summary" on approved full_notes material

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUMMARIZE_NOTES } from "../_prompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { material_id } = await req.json();
    if (!material_id) throw new Error("material_id is required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth header");

    const { data: { user }, error: authErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authErr || !user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

    // 2. Daily limit check (max 50 AI summaries/day)
    const today = new Date().toISOString().split("T")[0];
    const { count } = await supabase
      .from("karma_log")
      .select("id", { count: "exact", head: true })
      .eq("action", "ai_summary_generated")
      .gte("created_at", today);

    if ((count ?? 0) >= 50) {
      return new Response(
        JSON.stringify({ error: "Daily AI limit (50) reached. Try again tomorrow." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Fetch source material
    const { data: material, error: matErr } = await supabase
      .from("materials")
      .select("*")
      .eq("id", material_id)
      .single();

    if (matErr || !material) throw new Error("Material not found");
    if (material.type !== "full_notes") throw new Error("Only full_notes can be summarized");
    if (material.status !== "approved") throw new Error("Material must be approved first");

    // 4. Download PDF and extract text
    const { data: fileData, error: fileErr } = await supabase.storage
      .from("materials")
      .download(material.file_url);

    if (fileErr || !fileData) throw new Error("Could not download file");

    // Simple text extraction (for Deno environment)
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    // Extract readable text from PDF (basic extraction via string scanning)
    const pdfText = extractTextFromPdf(uint8);
    const truncatedText = pdfText.slice(0, 25000); // max 25k chars to Groq

    // 5. Call Groq API
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("GROQ_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SUMMARIZE_NOTES },
          { role: "user", content: truncatedText || "Please create a summary based on the topic: " + material.title },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      throw new Error(`Groq API error: ${errText}`);
    }

    const groqData = await groqResponse.json();
    const summary = groqData.choices?.[0]?.message?.content;
    if (!summary) throw new Error("Empty response from AI");

    // 6. Create new summary material (pending for admin to review)
    const { data: newMaterial, error: insertErr } = await supabase
      .from("materials")
      .insert({
        title: `Summary: ${material.title}`,
        description: `AI-generated exam summary for "${material.title}"`,
        subject_id: material.subject_id,
        type: "summary",
        source_material_id: material.id,
        ai_generated: true,
        ai_summary_text: summary,
        uploaded_by: user.id,
        status: "pending",
      })
      .select()
      .single();

    if (insertErr) throw new Error("Could not save summary: " + insertErr.message);

    // 7. Log the AI generation
    await supabase.from("karma_log").insert({
      user_id: user.id,
      action: "ai_summary_generated",
      points: 0,
      reference_id: newMaterial.id,
    });

    return Response.json(
      { success: true, summary, material_id: newMaterial.id },
      { headers: corsHeaders }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Basic PDF text extractor for Deno
function extractTextFromPdf(data: Uint8Array): string {
  const text: string[] = [];
  let i = 0;
  while (i < data.length - 2) {
    if (data[i] === 40) { // '('
      let chunk = "";
      i++;
      while (i < data.length && data[i] !== 41) { // ')'
        if (data[i] >= 32 && data[i] < 127) {
          chunk += String.fromCharCode(data[i]);
        }
        i++;
      }
      if (chunk.length > 3) text.push(chunk);
    }
    i++;
  }
  return text.join(" ");
}
