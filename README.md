# AI Investment Research Agent

An AI-powered agent that researches a company and decides whether to **INVEST** or **PASS**, with detailed reasoning — built for the InsideIIM × Altuni AI Labs assignment.

## Live Demo
- Frontend: https://ai-investment-research-agent-nu.vercel.app
- Backend API: https://ai-investment-research-agent-17ky.onrender.com

## Overview

This agent takes a company name as input, searches the web for recent news and financial performance using the Tavily Search API, and feeds that real-time data to an LLM (Groq's LLaMA 3.3 70B) for analysis. The LLM returns a structured decision — INVEST or PASS — along with reasoning and key factors.

The core idea: an LLM alone only knows what it was trained on (stale data). By combining it with a live web search tool, the agent can reason over current, real-world information — similar to how tool-calling agents (like ChatGPT with browsing) work.

## How to Run It

### Backend
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
GROQ_API_KEY=your_groq_key

TAVILY_API_KEY=your_tavily_key

PORT=3001

Run:
```bash
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Update the API URL in `src/App.jsx` to point to your backend if running locally (`http://localhost:3001`).

## How It Works

1. User enters a company name on the React frontend.
2. Frontend sends a POST request to `/api/research` on the Node.js/Express backend.
3. Backend runs **two targeted Tavily searches**:
   - Recent news + stock performance
   - Financial fundamentals (revenue, earnings, profit)
4. Both search results are passed into a single prompt to the Groq LLM (LLaMA 3.3 70B).
5. The LLM analyzes the combined data and returns:
   - `DECISION`: INVEST or PASS
   - `REASONING`: detailed explanation
   - `KEY_FACTORS`: bullet points of what drove the decision
6. The response is displayed on the frontend.

### Why two separate searches instead of one?
A single broad search often returns either too much news or too little financial data. Splitting the search into "news/sentiment" and "financial fundamentals" ensures the LLM gets both qualitative and quantitative signals before deciding.

## Key Decisions & Trade-offs

**1. Manual orchestration instead of LangChain's `AgentExecutor`**
Initially attempted `createReactAgent` + `AgentExecutor` from `langchain/agents`, following the standard LangChain tool-calling pattern. However, LangChain v1.5 (the version installed) restructured these modules — `langchain/agents` and `@langchain/community/tools/tavily_search` no longer exist at those paths, breaking compatibility with most existing tutorials/docs.

Rather than fighting version mismatches with an abstraction I'd have to half-understand, I used `@langchain/groq` (ChatGroq) and `@langchain/tavily` (TavilySearch) directly — both official LangChain ecosystem packages — and wrote the search → analyze flow myself. This is less "automatic" than a ReAct agent deciding tool use dynamically, but it's fully transparent, stable, and I can explain every line of it.

**2. Two fixed searches instead of a dynamic agent loop**
A true agentic loop would let the LLM decide *what* to search and *how many times*. I chose a simpler fixed two-search pattern (news + financials) for reliability within the time available, at the cost of flexibility — the agent always does the same two searches regardless of company type.

**3. Groq (LLaMA 3.3 70B) over OpenAI/Anthropic**
Already had production experience with Groq's API from a prior chatbot project (Mira). Groq's inference speed is very fast, and the free tier was sufficient for this assignment.

**4. No database**
The assignment doesn't require persisting past research. Each request is stateless — input in, decision out. Left out as out-of-scope to keep focus on the core research/reasoning loop.

**5. Plain CSS over a UI library**
Kept the frontend intentionally minimal — one input, one button, one result card — since the assignment explicitly says UI presentation is up to the builder and the focus is the agent logic.

## Example Runs

### Tesla → INVEST
> Based on the provided research data, Tesla's financial health appears to be stable, with a significant increase in revenue and a beat on profit expectations. The company's Q1 2026 earnings report showed a 15.78% year-over-year increase in revenue, reaching $22.387B, and a positive free cash flow of $1.4 billion, which was a surprise to analysts. Additionally, Tesla's gross profit grew 50% year-over-year in Q1 2026, and the company's earnings are expected to grow 41.18% next year. The recent news sentiment is generally positive, with the company's profitability and cash flow being highlighted as strengths. However, there are some risks to consider, such as the decline in annual revenue in 2025 and the high research and development expenses. Overall, the company's market position and financial performance suggest that it is a good investment opportunity.

### Reliance Industries → INVEST
> Based on the provided research data, Reliance Industries appears to be a strong and stable company with a solid financial foundation. The company has reported record annual profit and revenue, with growth in its consumer-facing businesses and oil-to-chemicals operations. Although quarterly net profit fell 8.9% from a year earlier, revenue rose 12.9% to Rs 3,25,290 crore, reflecting broad-based growth across oil-to-chemicals, digital services, and retail. The company's consumer-facing businesses have helped cushion the impact of global energy market volatility, demonstrating its ability to adapt to changing market conditions. Additionally, the company's share price has been steadily increasing, with a 0.35% rise as compared to its previous closing price. Overall, the company's financial health, recent news sentiment, and market position suggest a positive outlook, making it an attractive investment opportunity. However, it's essential to consider the risks associated with energy market volatility and the potential impact on the company's oil-to-chemicals business.

### Paytm → INVEST
> Based on the provided research data, Paytm's financial health has shown significant improvement, with the company turning profitable in Q1FY26 and reporting a net profit of ₹122.5 Cr, compared to a loss of ₹839 Cr in the same quarter last year. The revenue has also surged, with a 21% increase in the payments business and a 38% growth in financial services distribution. The recent news sentiment is positive, with the stock price moving up by 3.18% in the last week and a 22% surge from the day's lows. The market position of Paytm is strong, with a significant presence in the Indian digital payments market. However, there are risks associated with the company's ability to maintain profitability and compete with other players in the market. Overall, the positive financial trends, improving profitability, and strong market position make Paytm an attractive investment opportunity.

### Byju's → PASS
> Based on the provided research data, Byju's financial health is a significant concern. The company reported an operating revenue of Rs 5,014 crore in FY22, but it also witnessed a substantial increase in losses, reaching Rs 8,245 crore. This indicates that the company's expenses are outpacing its revenue, which is a red flag for investors. Additionally, the recent news sentiment is negative, with BlackRock slashing Byju's valuation to $1 billion, down 95% from $22 billion. This drastic reduction in valuation suggests that the company's growth prospects and financials are not as strong as previously thought. Furthermore, the ed-tech market is highly competitive, and Byju's may face challenges in maintaining its market position. Considering these factors, investing in Byju's seems risky, and it's better to pass on this opportunity.

(Full raw outputs available in `examples/sample_runs.md`)

## What I Would Improve With More Time

1. **True dynamic agent loop** — let the LLM decide which queries to run and how many, instead of two fixed searches every time.
2. **Source citations in the UI** — currently the raw search results are returned in the API response but not rendered; showing clickable sources would improve trust/transparency.
3. **Caching** — repeated searches for the same company within a short window could be cached to reduce API calls and speed up response time.
4. **Structured output parsing** — currently parsing the LLM's text response loosely; using a structured output schema (JSON mode) would make the frontend rendering more robust.
5. **Handling Render free-tier cold starts** — first request after inactivity is slow; would add a keep-alive ping or move to a paid tier in production.
6. **More nuanced financial analysis** — could add a dedicated tool for fetching actual stock price/ratio data (P/E, debt-to-equity) instead of relying purely on search snippets.

## AI Usage

Built primarily using Claude (Anthropic) as a development collaborator — for debugging LangChain version conflicts, writing the search/analysis prompt, and structuring the Express routes. See `AI_USAGE.md` for prompts used and specific cases where AI output was wrong and had to be corrected.

## Tech Stack
- Frontend: React (Vite)
- Backend: Node.js + Express
- AI: Groq (LLaMA 3.3 70B) via `@langchain/groq`
- Search: Tavily Search API via `@langchain/tavily`
- Deployment: Render (backend) + Vercel (frontend)
