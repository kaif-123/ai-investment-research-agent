const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const { ChatGroq } = require('@langchain/groq');
const { TavilySearch } = require('@langchain/tavily');

const app = express();
app.use(cors());
app.use(express.json());

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0
});

const searchTool = new TavilySearch({
  apiKey: process.env.TAVILY_API_KEY,
  maxResults: 5
});

app.post('/api/research', async (req, res) => {
  try {
    const { companyName } = req.body;

    // Step 1: Agent decides what to search
    console.log(`Researching: ${companyName}`);
    
    // Step 2: Search for recent news
    const newsResults = await searchTool.invoke({
      query: `${companyName} stock latest news financial performance 2026`
    });

    // Step 3: Search for financial fundamentals
    const financialResults = await searchTool.invoke({
      query: `${companyName} revenue profit earnings quarterly results`
    });

    // Step 4: Give all this data to LLM to analyze and decide
    const analysisPrompt = `You are an investment research analyst. 
Based on the following research data about ${companyName}, decide whether to INVEST or PASS.

NEWS DATA:
${JSON.stringify(newsResults).slice(0, 3000)}

FINANCIAL DATA:
${JSON.stringify(financialResults).slice(0, 3000)}

Provide your response in this exact format:
DECISION: [INVEST or PASS]
REASONING: [detailed explanation covering financial health, recent news sentiment, market position, and risks]
KEY_FACTORS: [bullet points of the top 3-4 factors that influenced this decision]`;

    const response = await model.invoke(analysisPrompt);

    res.json({
      company: companyName,
      analysis: response.content,
      sources: {
        news: newsResults,
        financial: financialResults
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server running on port ${process.env.PORT || 3001}`);
});