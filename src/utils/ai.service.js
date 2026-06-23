import { GoogleGenerativeAI } from "@google/generative-ai";

export const evaluateResume = async (resumeText, jobTitle, jobDescription, jobSkills, jobExperience) => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is not configured.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert ATS (Applicant Tracking System) and Senior Technical Recruiter.
      I will provide you with a Job Requisition and a Candidate's Resume.
      Your task is to analyze the resume against the job requirements and provide an ATS Match Score.

      ### JOB REQUISITION
      Title: ${jobTitle}
      Experience Required: ${jobExperience || 'Not specified'}
      Skills: ${jobSkills && jobSkills.length > 0 ? jobSkills.join(", ") : 'Not specified'}
      Description:
      ${jobDescription}

      ### CANDIDATE RESUME
      ${resumeText}

      ### YOUR INSTRUCTIONS
      1. Carefully evaluate if the candidate has the required skills, experience level, and qualifications.
      2. Provide a match score from 0 to 100.
      3. Provide a brief 1-2 sentence reason for your score.
      4. Extract the candidate's phone number exactly as written (with country code if present, ensuring it starts with + if they provided it. If no country code, prepend +91 for India as default).
      5. Extract a list of their core technical skills.
      6. Extract a list of their past work experience, formatted as objects with 'jobTitle' and 'companyName'.
      7. RETURN ONLY STRICT JSON. Do not include markdown formatting like \`\`\`json or \`\`\`.

      The JSON must exactly follow this schema:
      {
        "score": 85,
        "reason": "Reason goes here",
        "phone": "+919876543210",
        "skills": ["React", "Node.js"],
        "experience": [
          { "jobTitle": "Frontend Developer", "companyName": "Tech Corp" }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    // Remove markdown code blocks if the model accidentally includes them
    if (text.startsWith('```json')) text = text.substring(7);
    if (text.startsWith('```')) text = text.substring(3);
    if (text.endsWith('```')) text = text.substring(0, text.length - 3);
    
    const parsed = JSON.parse(text.trim());
    return {
      score: parsed.score || 0,
      reason: parsed.reason || "Unable to generate reason.",
      phone: parsed.phone || null,
      skills: parsed.skills || [],
      experience: parsed.experience || []
    };
  } catch (error) {
    console.error("AI Evaluation failed:", error);
    throw new Error("Failed to process AI resume matching.");
  }
};
