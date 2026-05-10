// supabase/functions/generate-quiz/index.ts
// Exam League — AI Quiz Generator Edge Function

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GENERATE_QUIZ } from "../_prompts.ts";

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

    // 2. Fetch source material
    const { data: material, error: matErr } = await supabase
      .from("materials")
      .select("*")
      .eq("id", material_id)
      .single();

    if (matErr || !material) throw new Error("Material not found");
    if (material.type !== "full_notes") throw new Error("Only full_notes can generate a quiz");
    if (material.status !== "approved") throw new Error("Material must be approved first");

    // 3. Download PDF and extract text
    const { data: fileData, error: fileErr } = await supabase.storage
      .from("materials")
      .download(material.file_url);

    if (fileErr || !fileData) throw new Error("Could not download file");

    const arrayBuffer = await fileData.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    const pdfText = extractTextFromPdf(uint8);
    const truncatedText = pdfText.slice(0, 25000); // max 25k chars to Groq

    // 4. Call Groq API
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("GROQ_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: GENERATE_QUIZ },
          { role: "user", content: truncatedText || "Please create a quiz based on the topic: " + material.title },
        ],
        temperature: 0.2, // Low temperature for consistent JSON
        max_tokens: 1500,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      throw new Error(`Groq API error: ${errText}`);
    }

    const groqData = await groqResponse.json();
    const quizResponseString = groqData.choices?.[0]?.message?.content;
    if (!quizResponseString) throw new Error("Empty response from AI");

    // Clean up potential markdown formatting around JSON
    const cleanJsonString = quizResponseString.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    
    let questions = [];
    try {
      questions = JSON.parse(cleanJsonString);
    } catch (e) {
      console.error("Failed to parse JSON:", cleanJsonString);
      throw new Error("AI returned invalid JSON format.");
    }

    if (!Array.isArray(questions) || questions.length !== 5) {
      throw new Error("AI did not return exactly 5 questions.");
    }

    // 5. Insert Quiz
    const { data: newQuiz, error: quizInsertErr } = await supabase
      .from("quizzes")
      .insert({
        title: `Quiz: ${material.title}`,
        subject_id: material.subject_id,
        created_by: user.id, // Admin who triggered it
      })
      .select()
      .single();

    if (quizInsertErr) throw new Error("Could not save quiz: " + quizInsertErr.message);

    // 6. Insert Questions
    const questionsToInsert = questions.map((q: any) => ({
      quiz_id: newQuiz.id,
      question: q.question,
      options: q.options,
      correct_index: q.correct_index,
      explanation: q.explanation
    }));

    const { error: questionsErr } = await supabase
      .from("quiz_questions")
      .insert(questionsToInsert);

    if (questionsErr) {
      // Rollback quiz if questions fail
      await supabase.from("quizzes").delete().eq("id", newQuiz.id);
      throw new Error("Could not save questions: " + questionsErr.message);
    }

    // 7. Log the AI generation
    await supabase.from("karma_log").insert({
      user_id: user.id,
      action: "ai_summary_generated", // Re-using this or creating a new action type
      points: 0,
      reference_id: newQuiz.id,
    });

    return Response.json(
      { success: true, quiz_id: newQuiz.id },
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
