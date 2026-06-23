import axios from "axios";
import AppError from "./AppError.js";

const OMNIDIMENSION_BASE_URL = "https://backend.omnidim.io/api/v1";

/**
 * Trigger an outbound call to the candidate using OmniDimension.
 * Automatically creates an agent for the job if it doesn't exist, and dispatches the call.
 */
export const createVoiceInterview = async ({ candidateName, candidatePhone, jobTitle, questions, applicationId, candidateExperience, candidateSkills, aiMatchScore }) => {
  const apiKey = process.env.OMNIDIMENSION_API_KEY;
  if (!apiKey) {
    throw new AppError("OMNIDIMENSION_API_KEY is missing", 500);
  }

  try {
    // 1. Create a dynamic Agent for this specific job screening
    const experienceText = Array.isArray(candidateExperience) 
      ? (candidateExperience.length > 0 ? candidateExperience.map(e => `${e.jobTitle || 'Role'} at ${e.companyName || 'Company'}`).join(', ') : 'No formal experience provided')
      : (candidateExperience || 'No formal experience provided');
      
    const skillsText = candidateSkills && candidateSkills.length > 0
      ? candidateSkills.join(', ')
      : 'Not explicitly listed';

    const questionsText = questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n');

    const agentRes = await axios.post(
      `${OMNIDIMENSION_BASE_URL}/agents/create`,
      {
        name: `Screening for ${jobTitle} - ${applicationId}`,
        welcome_message: `Hello, am I speaking with ${candidateName}? I'm calling from Fastigo HR regarding your recent application for the ${jobTitle} position.`,
        context_breakdown: [
          {
            title: "Quickly Establish Context",
            body: `Sir/Madam, we are calling to conduct a quick initial screening based on your recent application. We see you have an ATS Match Score of ${aiMatchScore || 'Unknown'}%, with skills in ${skillsText}, and past experience including ${experienceText}.`,
            is_enabled: true
          },
          {
            title: "Agent Identity & Purpose",
            body: `# AGENT GLOBAL INSTRUCTIONS
## PERSONA
- The agent is a friendly and professional HR screening specialist for Fastigo.
- Speaks directly to the candidate in a respectful and conversational tone.
- Purpose is to ask the specific screening questions defined by the HR team.
- Overall tone is human, calm, professional, and never robotic.

# RESPONSE GENERATION GUIDES
- Your responses will be read aloud by a text-to-speech system.
- Always use short, simple, conversational sentences.
- End responses naturally.
- Speak politely as if talking to a real person.`,
            is_enabled: true
          },
          {
            title: "Screening Questions",
            body: `# INTERVIEW QUESTIONS
You must ask the following questions to the candidate, one by one. Listen to their answer completely before moving to the next.
${questionsText}

Once all questions have been answered, thank them for their time and conclude the call naturally.`,
            is_enabled: true
          },
          {
            title: "Guardrails",
            body: `# GUARDRAILS
- Never pressure or rush the candidate.
- Never guarantee approvals, outcomes, or whether they passed the screening.
- Never ask for sensitive information like bank details.
- Always pause and allow the candidate to respond.`,
            is_enabled: true
          }
        ],
        call_type: "Outgoing",
        transcriber: {
          provider: "Azure",
          silence_timeout_ms: 400
        },
        model: {
          model: "gemini-2.5-flash",
          temperature: 0.7
        },
        voice: {
          provider: "cartesia",
          voice_id: "40a578ac-de3b-4903-823a-ff58143edeb0"
        },
        languages: ["English", "Hindi"],
        interruption: {
          enabled: true,
          min_words: 2
        },
        noise_reduction: true,
        call_transfer: {
          enabled: false,
          custom_api_transfer: false,
          options: []
        },
        call_ending: {
          max_duration_sec: 600,
          enabled: true,
          condition: "End the call when all interview questions have been asked and answered, and the user says goodbye or thank you.",
          message: "Thank you for your time. Have a great day! Goodbye."
        },
        user_idle: {
          threshold_sec: 10,
          first_message: null,
          second_message: null,
          last_message: "I'll leave you for now. Have a nice day!"
        }
      },
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    
    const agentId = agentRes.data.agent_id || agentRes.data.id;
    if (!agentId) throw new Error("Failed to create OmniDimension agent");

    console.log(`[OmniDimension] Created agent ${agentId} for application ${applicationId}`);

    // 2. Format phone number to E.164 format (e.g. +919876543210)
    let formattedPhone = String(candidatePhone).replace(/[^\d+]/g, '');
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone;
    }

    // 3. Dispatch the call
    const dispatchRes = await axios.post(
      `${OMNIDIMENSION_BASE_URL}/calls/dispatch`,
      {
        agent_id: agentId,
        to_number: formattedPhone,
        metadata: {
          application_id: applicationId,
          candidate_name: candidateName
        }
      },
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    const callId = dispatchRes.data.requestId || dispatchRes.data.call_id || dispatchRes.data.id;
    console.log(`[OmniDimension] Call initiated successfully. Call ID: ${callId}`);

    return callId;
  } catch (error) {
    console.error("[OmniDimension] Error creating voice interview:", error?.response?.data || error.message);
    throw new AppError("Failed to dispatch AI Voice Call via OmniDimension", 500);
  }
};

/**
 * Fetch call log details from OmniDimension API.
 */
export const getCallLog = async (callId) => {
  try {
    const apiKey = process.env.OMNIDIMENSION_API_KEY;
    if (!apiKey) throw new Error("OMNIDIMENSION_API_KEY is not configured.");

    const res = await axios.get(`${OMNIDIMENSION_BASE_URL}/calls/logs/${callId}`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });

    return res.data;
  } catch (error) {
    console.error(`[OmniDimension] Error fetching call log ${callId}:`, error?.response?.data || error.message);
    throw new AppError("Failed to fetch call log from OmniDimension", 500);
  }
};
