import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Evaluate the candidate's answers from the voice screening transcript using Gemini.
 */
export const evaluateVoiceTranscript = async (jobDescription, questions, transcript) => {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not configured in the environment.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using flash for faster inference, especially for simple text classification
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You are an expert technical recruiter and HR specialist.
You need to evaluate a candidate's responses during an automated AI phone screening.

### JOB DESCRIPTION ###
${jobDescription}

### QUESTIONS ASKED & WEIGHTS ###
${JSON.stringify(questions, null, 2)}

### INTERVIEW TRANSCRIPT ###
${transcript}

### INSTRUCTIONS ###
Evaluate the candidate's answers based on the transcript. Be strict but fair.
Return a JSON object matching this exact schema (NO markdown formatting, just raw JSON):
{
  "score": <number 0-100>,
  "communicationScore": <number 0-100>,
  "technicalScore": <number 0-100>,
  "strengths": [<array of strings>],
  "weaknesses": [<array of strings>],
  "recommendation": <"SHORTLIST" or "REJECT">,
  "summary": "<string explaining your reasoning>"
}
`;

  try {
    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    
    // Strip markdown formatting if the model still included it despite instructions
    if (responseText.startsWith("```json")) {
      responseText = responseText.replace(/```json\n?/, "").replace(/```$/, "");
    } else if (responseText.startsWith("```")) {
      responseText = responseText.replace(/```\n?/, "").replace(/```$/, "");
    }

    const evaluation = JSON.parse(responseText);
    return evaluation;
  } catch (error) {
    console.error("[Gemini] Failed to evaluate voice transcript:", error.message);
    throw error;
  }
};
