# AI_USAGE.md

## AI Tool Used
**Claude (Anthropic)** — used as primary development collaborator throughout the build.

## How Claude Was Used
- Explaining LangChain concepts (models, tools, agents) from scratch since this was a new framework for me
- Debugging version-mismatch errors (`ERR_PACKAGE_PATH_NOT_EXPORTED`) when LangChain v1.5's module structure didn't match older tutorials
- Writing the initial agent/search/analysis flow in `server.js`
- Writing the React frontend component and CSS
- Helping troubleshoot deployment issues (Render build failures due to peer dependency conflicts)
- Structuring this documentation

## Key Prompts Used
- "How does LangChain work — what's the difference between a normal API call and an agent?"
- "Why is my agent.js throwing ERR_PACKAGE_PATH_NOT_EXPORTED for langchain/agents?"
- "Write a Node.js Express route that searches a company with Tavily and analyzes results with Groq"
- "Why is the Tavily package import failing — show me the actual installed file structure"
- "Help me fix npm ERESOLVE conflict on Render deployment"

## Three Concrete Cases Where AI Produced Something Wrong

### Case 1: Outdated LangChain Agent Pattern
**What Claude initially produced:**
```javascript
const { createReactAgent, AgentExecutor } = require('langchain/agents');
const { TavilySearchResults } = require('@langchain/community/tools/tavily_search');
```
**Problem I caught:**
This is the standard LangChain v0.x agent pattern, widely documented online — but the installed `langchain` version was 1.5.2, where this module path no longer exists. Running it threw `ERR_PACKAGE_PATH_NOT_EXPORTED`.

**What I changed:**
Verified the actual installed package structure using `find node_modules/@langchain/community -iname "*tavily*"` and `cat node_modules/langchain/package.json | grep version` in the terminal myself. Based on that, switched to direct, stable imports (`@langchain/groq`, `@langchain/tavily`) and wrote the search→analyze orchestration manually instead of relying on the (incompatible) pre-built agent abstraction.

### Case 2: Unnecessary Dependency Breaking Deployment
**What Claude initially produced:**
Included `@langchain/community` in the install command even after we'd stopped using anything from it in the final code.

**Problem I caught:**
Render's build failed with a peer dependency conflict (`@browserbasehq/stagehand` requiring a different `dotenv` version than the rest of the project). The package wasn't even imported anywhere in `server.js` anymore.

**What I changed:**
Ran `npm uninstall @langchain/community` since it was dead weight, which resolved the Render build conflict without needing `--legacy-peer-deps` in the build command.

### Case 3: Local-Only API URL in Frontend
**What Claude initially produced:**
Frontend `fetch` call hardcoded to `http://localhost:3001/api/research`.

**Problem I caught:**
After deploying, the live Vercel frontend couldn't reach the backend — it was still pointing at localhost, which doesn't exist outside my own machine.

**What I changed:**
Updated the fetch URL to the deployed Render backend URL (`https://ai-investment-research-agent-17ky.onrender.com/api/research`) before redeploying the frontend.

## My Role vs AI's Role
| Task | Who did it |
|---|---|
| Understanding LangChain concepts | Learned via Claude, but verified by reading actual package source |
| Debugging version conflicts | Me (ran terminal commands to inspect packages), Claude suggested fixes |
| Core search→analyze logic | Claude wrote it, I reviewed and understood every line |
| Deployment troubleshooting | Me + Claude |
| Final testing across multiple companies | Me |
| Documentation | Me, structured with Claude's help |
