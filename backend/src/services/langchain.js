const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { RunnableSequence } = require("@langchain/core/runnables");
const { StringOutputParser } = require("@langchain/core/output_parsers");

/**
 * Helper to initialize the Gemini model
 * @param {boolean} jsonMode - whether to enforce JSON output format
 */
const getModel = (jsonMode = false) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
  }

  const config = {
    apiKey: process.env.GEMINI_API_KEY,
    modelName: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    maxOutputTokens: 4096,
    temperature: 0.1, // Low temperature for consistent factual analysis
  };

  if (jsonMode) {
    config.responseMimeType = "application/json";
  }

  return new ChatGoogleGenerativeAI(config);
};

/**
 * Researches and analyzes a company using LangChain and Gemini
 * @param {string} companyName 
 * @returns {Promise<object>}
 */
const researchAndAnalyzeCompany = async (companyName) => {
  try {
    const model = getModel(false);
    const jsonModel = getModel(true);

    // 1. Research Phase
    const researchPrompt = ChatPromptTemplate.fromTemplate(`
      You are a professional financial research assistant.
      Perform detailed research on the company: {companyName}.
      
      You MUST gather and structure the information into these five key areas, using EXACTLY these section headers (including the hash signs).
      Keep each section highly informative but concise (approx. 100-200 words per section) to ensure all sections fit in the output.
      
      ### 1. COMPANY OVERVIEW
      Describe core business model, products, and market position.
      
      ### 2. LATEST NEWS
      List 3-5 key recent events, news announcements, earnings releases or controversies from the past 6-12 months. Format news items as clear bullet points starting with a dash (-).
      
      ### 3. FINANCIAL PERFORMANCE
      Detail key financial performance indicators (revenue growth, profitability, margins, balance sheet details).
      
      ### 4. MARKET SENTIMENT
      Summarize analyst ratings, target consensus, public sentiment, and trends.
      
      ### 5. STRENGTHS & RISKS
      Outline major competitive advantages (moats) vs. strategic risk factors and operational vulnerabilities.
      
      Provide detailed, objective, and realistic analysis for each category. Be highly factual. Do not omit any headers.
    `);

    const researchChain = RunnableSequence.from([
      researchPrompt,
      model,
      new StringOutputParser()
    ]);

    console.log(`[LangChain] Starting research phase for: ${companyName}...`);
    const rawResearch = await researchChain.invoke({ companyName });
    console.log(`[LangChain] Research phase completed. Starting analysis phase...`);

    // 2. Analysis Phase
    const analysisPrompt = ChatPromptTemplate.fromTemplate(`
      You are a Senior Wall Street Investment Analyst.
      Your task is to analyze the following raw financial research and produce an investment recommendation report.
      
      Company under analysis: {companyName}

      Research Data:
      {rawResearch}

      You must evaluate the strengths, risks, financials, and news, and outputs a JSON object matching this EXACT schema:
      {{
        "companyName": "Official name of the company",
        "summary": "A concise 3-4 sentence overview of the company, its current position, and value proposition.",
        "pros": ["Pro 1", "Pro 2", "Pro 3"], // List 3 to 5 key positives or growth drivers
        "cons": ["Con 1", "Con 2", "Con 3"], // List 3 to 5 key negatives or risk factors
        "riskLevel": "Low" | "Medium" | "High", // Categorical risk level
        "investmentScore": 75, // Integer score between 0 and 100 based on financials, competitive position, and risks.
        "recommendation": "Invest" | "Pass", // "Invest" if investmentScore is 70 or higher, otherwise "Pass"
        "reasoning": "A comprehensive 2-3 paragraph explanation justifying your investment score and recommendation, mentioning financials, moat, and sentiment."
      }}

      Ensure the JSON is valid and contains exactly these fields. Do not wrap the JSON output in markdown formatting (like \`\`\`json). Return ONLY the raw JSON string.
    `);

    const analysisChain = RunnableSequence.from([
      analysisPrompt,
      jsonModel,
      new StringOutputParser()
    ]);

    const resultString = await analysisChain.invoke({
      companyName,
      rawResearch
    });

    console.log(`[LangChain] Analysis completed successfully.`);

    // Parse output using a robust cleaning strategy to handle minor LLM formatting issues
    let parsedData;
    const cleanJsonString = (str) => {
      let cleaned = str.trim();
      // Remove markdown block tags if present
      cleaned = cleaned.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
      return cleaned;
    };

    try {
      const cleaned = cleanJsonString(resultString);
      parsedData = JSON.parse(cleaned);
    } catch (e) {
      console.warn("[LangChain Warning] Standard JSON.parse failed. Attempting to repair string escapes...", e.message);
      try {
        // Fix unescaped newlines inside string values (a common LLM JSON syntax error)
        let fixed = resultString.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match, p1) => {
          return '"' + p1.replace(/\n/g, '\\n').replace(/\r/g, '\\r') + '"';
        });
        fixed = cleanJsonString(fixed);
        parsedData = JSON.parse(fixed);
      } catch (e2) {
        console.error("[LangChain Error] Secondary JSON repair failed:", e2.message);
        throw new Error(`Invalid JSON format returned by LLM: ${e.message}`);
      }
    }
    
    // Store the raw research details inside the final object so we can save it in Mongo
    parsedData.rawResearch = parseRawResearch(rawResearch);

    return parsedData;
  } catch (error) {
    console.error(`[LangChain Error]:`, error);
    throw new Error(`Failed to research and analyze company: ${error.message}`);
  }
};

/**
 * Simple helper to parse the raw research text into structured blocks for MongoDB storage
 * @param {string} rawText 
 * @returns {object}
 */
function parseRawResearch(rawText) {
  const sections = {
    overview: "",
    news: [],
    financials: "",
    sentiment: "",
    strengthsRisks: ""
  };

  try {
    // Basic heuristics to split sections if they exist, or put everything in overview
    const lines = rawText.split('\n');
    let currentSection = 'overview';
    let sectionBuffer = [];

    for (const line of lines) {
      const upperLine = line.toUpperCase();
      if (upperLine.includes('COMPANY OVERVIEW') || upperLine.includes('1. COMPANY')) {
        sections[currentSection] = sectionBuffer.join('\n').trim();
        currentSection = 'overview';
        sectionBuffer = [];
      } else if (upperLine.includes('LATEST NEWS') || upperLine.includes('2. LATEST') || upperLine.includes('2. NEWS')) {
        sections[currentSection] = sectionBuffer.join('\n').trim();
        currentSection = 'news';
        sectionBuffer = [];
      } else if (upperLine.includes('FINANCIAL PERFORMANCE') || upperLine.includes('FINANCIAL INFORMATION') || upperLine.includes('3. FINANCIAL')) {
        if (currentSection === 'news') {
          // parse collected lines into news items
          sections.news = sectionBuffer.filter(l => l.trim().startsWith('-') || l.trim().startsWith('*') || l.trim().length > 15).map(l => l.replace(/^[-*\s\d.]+/g, '').trim());
        } else {
          sections[currentSection] = sectionBuffer.join('\n').trim();
        }
        currentSection = 'financials';
        sectionBuffer = [];
      } else if (upperLine.includes('MARKET SENTIMENT') || upperLine.includes('4. MARKET') || upperLine.includes('4. SENTIMENT')) {
        sections[currentSection] = sectionBuffer.join('\n').trim();
        currentSection = 'sentiment';
        sectionBuffer = [];
      } else if (upperLine.includes('STRENGTHS & RISKS') || upperLine.includes('STRENGTHS AND RISKS') || upperLine.includes('5. STRENGTHS')) {
        sections[currentSection] = sectionBuffer.join('\n').trim();
        currentSection = 'strengthsRisks';
        sectionBuffer = [];
      } else {
        sectionBuffer.push(line);
      }
    }

    // Save final buffer
    if (currentSection === 'news') {
      sections.news = sectionBuffer.filter(l => l.trim().startsWith('-') || l.trim().startsWith('*') || l.trim().length > 15).map(l => l.replace(/^[-*\s\d.]+/g, '').trim());
    } else {
      sections[currentSection] = sectionBuffer.join('\n').trim();
    }

    // fallback if sections were not split cleanly
    if (!sections.overview) {
      sections.overview = rawText;
    }
  } catch (e) {
    sections.overview = rawText;
  }

  return sections;
}

module.exports = {
  researchAndAnalyzeCompany
};
