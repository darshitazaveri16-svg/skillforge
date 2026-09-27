/**
 * AI Resume Service
 * Integrates optional OpenAI API for qualitative resume suggestions,
 * bullet enhancements, and career-specific guidance.
 *
 * CRITICAL RULE:
 * This service does NOT compute or modify the official matchScore,
 * readinessScore, skill gaps, or assessment levels.
 * The deterministic backend remains the single source of truth.
 */

const FALLBACK_NOTICE = 'AI suggestions are currently unavailable. Basic resume analysis is still available.';

// In-memory mock response hook for tests
let testAiMockHandler = null;

export function setTestAiMock(mockFn) {
  testAiMockHandler = mockFn;
}

export function resetTestAiMock() {
  testAiMockHandler = null;
}

/**
 * Builds deterministic fallback suggestions when AI is unavailable or unconfigured.
 */
export function generateDeterministicSuggestions({
  targetCareer,
  matchedSkills = [],
  missingSkills = [],
  matchScore = 0,
}) {
  const primaryMatched = matchedSkills.slice(0, 3).join(', ') || 'demonstrated proficiencies';
  const primaryMissing = missingSkills.slice(0, 3).join(', ') || 'advanced tools';

  const summary = missingSkills.length === 0
    ? `Exceptional alignment! Your resume demonstrates 100% of the core competencies tracked for ${targetCareer}. Focus on highlighting high-impact deliverables and team leadership.`
    : `Your resume matches ${matchScore}% of the core technical requirements for ${targetCareer}. You have solid foundations in ${primaryMatched}, and adding verified experience in ${primaryMissing} will significantly increase your interview conversion rate.`;

  const overallFeedback = [
    `Tailor your professional summary to explicitly state your focus on ${targetCareer} roles and key technologies.`,
    `Feature a dedicated 'Technical Skills' section near the top of your resume, categorizing tools into Frontend, Backend, Data, and DevOps.`,
    `Ensure every bullet point follows the Action Verb + Context + Quantifiable Metric structure (e.g., 'Engineered X using Y, resulting in Z% efficiency gain').`,
  ];

  const bulletSuggestions = [
    `Stronger Action Verb: Replace passive phrasing like "Worked on ${matchedSkills[0] || 'projects'}" with "Architected and deployed scalable solutions using ${matchedSkills[0] || 'core technologies'}, improving system throughput by 25%."`,
    `Quantify Business Impact: "Collaborated in an agile team to deliver high-quality features, decreasing sprint release cycle time by 20%."`,
    `Demonstrate Problem Solving: "Investigated and resolved performance bottlenecks in database queries, reducing average API response latency by 40%."`,
  ];

  const missingSkillsAdvice = missingSkills.map((skill) => {
    return `For ${skill}: Build a standalone open-source project or complete a hands-on technical tutorial showcasing real-world implementation of ${skill}.`;
  });

  if (missingSkillsAdvice.length === 0) {
    missingSkillsAdvice.push(`Continue refining your expertise in advanced design patterns, cloud architectures, and system design related to ${targetCareer}.`);
  }

  const careerRecommendations = [
    `Align your GitHub repositories and live demos with standard ${targetCareer} production standards (clean README, CI/CD, unit tests).`,
    `Incorporate industry-standard keywords from active ${targetCareer} job postings to pass Applicant Tracking Systems (ATS).`,
    `Prepare for technical interviews by explaining the architectural trade-offs of using ${primaryMatched}.`,
  ];

  return {
    summary,
    overallFeedback,
    bulletSuggestions,
    missingSkillsAdvice,
    careerRecommendations,
    isAiGenerated: false,
    aiNotice: FALLBACK_NOTICE,
  };
}

/**
 * Generates resume improvement suggestions via OpenAI API or deterministic fallback.
 *
 * @param {Object} params
 * @param {string} params.resumeText - Extracted resume text
 * @param {string} params.targetCareer - Name of target career
 * @param {string[]} params.detectedSkills - All skills detected
 * @param {string[]} params.matchedSkills - Skills matching career requirements
 * @param {string[]} params.missingSkills - Career required skills missing from resume
 * @param {number} params.matchScore - Deterministic match score
 * @returns {Promise<Object>} Suggestions object
 */
export async function getAiResumeSuggestions({
  resumeText,
  targetCareer,
  detectedSkills = [],
  matchedSkills = [],
  missingSkills = [],
  matchScore = 0,
}) {
  // 1. Check if an automated test mock is registered
  if (typeof testAiMockHandler === 'function') {
    try {
      const mockResult = await testAiMockHandler({
        resumeText,
        targetCareer,
        detectedSkills,
        matchedSkills,
        missingSkills,
        matchScore,
      });
      if (mockResult) return mockResult;
    } catch (mockErr) {
      console.warn('[AI Mock Error]:', mockErr.message);
    }
  }

  // 2. Check for OpenAI API key
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    return generateDeterministicSuggestions({
      targetCareer,
      matchedSkills,
      missingSkills,
      matchScore,
    });
  }

  // 3. Attempt OpenAI Chat Completion call
  try {
    const prompt = `
You are an expert technical career coach and resume reviewer specializing in software and technology careers.
Review the following resume details for a candidate aiming to become a "${targetCareer}".

Candidate Details:
- Target Career: ${targetCareer}
- Deterministic Match Score: ${matchScore}%
- Matched Skills: ${matchedSkills.join(', ') || 'None'}
- Missing Skills: ${missingSkills.join(', ') || 'None'}
- Detected Skills: ${detectedSkills.join(', ') || 'None'}

Resume Excerpt:
"${resumeText.slice(0, 3000)}"

Return a valid JSON object ONLY, adhering to this EXACT schema:
{
  "summary": "2-3 sentences assessing current resume strength for ${targetCareer}",
  "overallFeedback": ["Advice 1", "Advice 2", "Advice 3"],
  "bulletSuggestions": ["Example rewritten bullet 1", "Example rewritten bullet 2", "Example rewritten bullet 3"],
  "missingSkillsAdvice": ["Advice for missing skills"],
  "careerRecommendations": ["Next step 1", "Next step 2", "Next step 3"]
}
Do NOT include markdown formatting (like \`\`\`json) outside the JSON. Return raw JSON only.
`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional technical resume analyzer. You respond only with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[AI Service Notice] OpenAI responded with HTTP ${response.status}. Using deterministic fallback.`);
      return generateDeterministicSuggestions({
        targetCareer,
        matchedSkills,
        missingSkills,
        matchScore,
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return generateDeterministicSuggestions({
        targetCareer,
        matchedSkills,
        missingSkills,
        matchScore,
      });
    }

    // Strip any markdown code fences if model returned them
    const cleanJson = content.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      summary: parsed.summary || `Resume evaluated for ${targetCareer}.`,
      overallFeedback: Array.isArray(parsed.overallFeedback) ? parsed.overallFeedback : [],
      bulletSuggestions: Array.isArray(parsed.bulletSuggestions) ? parsed.bulletSuggestions : [],
      missingSkillsAdvice: Array.isArray(parsed.missingSkillsAdvice) ? parsed.missingSkillsAdvice : [],
      careerRecommendations: Array.isArray(parsed.careerRecommendations) ? parsed.careerRecommendations : [],
      isAiGenerated: true,
      aiNotice: null,
    };
  } catch (error) {
    console.warn(`[AI Service Notice] OpenAI request failed (${error.message}). Using deterministic fallback.`);
    return generateDeterministicSuggestions({
      targetCareer,
      matchedSkills,
      missingSkills,
      matchScore,
    });
  }
}
