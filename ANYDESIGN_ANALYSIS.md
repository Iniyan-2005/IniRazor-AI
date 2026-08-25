# Current Architecture
AnyDesign is primarily constructed as a prompt-based "Skill" for AI agents (originally Claude), augmented by standalone Python CLI scripts. 
- **Prompt/Knowledge Layer:** Markdown files (`SKILL.md` and the `references/` directory) provide highly structured instructions, heuristics, and output templates for the LLM. It guides the LLM to analyze design systematically across 5 layers.
- **Execution Layer:** A set of Python scripts (`scripts/`) handle the deterministic tasks that LLMs are bad at: web scraping, CSS variable extraction, accurate screenshotting (via Playwright), and color sampling (via Pillow).
- **Integration/Platform Layer:** It relies on the host agent's environment (e.g., Claude's `WebFetch` or Figma MCP) for basic data fetching before falling back to its own scripts.

# File-by-File Analysis
- **`SKILL.md`**: The master instruction file. Defines the AI's persona ("Design Systems Analyst"), the core workflow, and the execution rules.
- **`references/capture-flows.md`**: Instructions for the AI on how to acquire data (Image, URL, Figma).
- **`references/analysis-framework.md`**: The core methodology. Breaks down design analysis into 5 layers (Identity, System, Components, Layout, Reconstruction).
- **`references/token-extraction.md`**: Heuristics for the LLM to identify and group colors, typography, and spacing into semantic tokens.
- **`references/output-template.md`**: The mandatory markdown structure for the final output (`design.md`).
- **`references/element-copy.md`**: Instructions for "Element Mode", allowing the system to focus on a single UI component rather than a full page.
- **`scripts/capture_site.py`**: A Playwright script that renders a page, dismisses cookie banners, scrolls, and takes responsive or element-specific screenshots.
- **`scripts/extract_css_vars.py`**: Fetches HTML/CSS and extracts `--var` definitions, categorizing them into tokens (colors, spacing, etc.).
- **`scripts/extract_colors.py`**: Uses Pillow to sample pixel-perfect dominant colors from images.
- **`scripts/export_for_claude_design.py`**: Formats the extracted tokens specifically for Claude's "Claude Design" platform.
- **`scripts/check_contrast.py`**: Validates WCAG contrast ratios for extracted color pairs.
- **`scripts/verify_design.py` & `scripts/lint_design_md.py`**: QA tools to audit token drift and validate the output markdown format.

# Input to Output Pipeline
1. **Input Identification:** Determines if the target is an Image, URL, or Figma link, and if the scope is "Full" or "Element".
2. **Material Capture:** 
   - URLs: Fetches raw HTML + CSS variables (`extract_css_vars.py`). If HTML is empty (SPA), captures screenshots via Playwright (`capture_site.py`).
   - Images: Direct multimodal vision (optionally refined by `extract_colors.py`).
3. **Layered Analysis:** The LLM processes the captured data through 5 layers: Visual Identity -> Token System -> Components -> Layout -> Reconstruction / Brand Rules.
4. **Token Generation:** Produces deterministic design tokens (W3C DTCG JSON format).
5. **Output Delivery:** Emits a final `design.md` and `design-tokens.json` to be consumed by AI builders (like v0, Lovable) or human designers.

# Dependencies
The Python scripts require:
- **Playwright** (`playwright` + chromium browser): For taking accurate screenshots of SPAs and JS-heavy sites.
- **Pillow** (`Pillow`): For color extraction from images.
- **Python-PPTX / Python-DOCX / PyYAML**: For exporting to Claude Design formats.

# Reusable Components
- **The Core Prompts (`references/` and `SKILL.md`)**: The logic, heuristics, and 5-layer framework are platform-agnostic and represent the highest value of the repo.
- **CSS Extraction Logic (`extract_css_vars.py`)**: The regex and categorization logic for CSS variables is universally useful and can be directly ported to JS/TS.
- **W3C DTCG Format**: Emitting standard design tokens makes the output highly interoperable.

# Components That Need Adaptation
- **Execution Environment:** InirazorAI is a React/Vite/Tailwind frontend. The Python scripts cannot run in the browser. They must be ported to a Node.js backend (e.g., using `puppeteer` or Node `playwright`), or hosted in a Python microservice/serverless function.
- **LLM Orchestration:** The workflow relies on Claude's autonomous tool-calling (like `WebFetch`). InirazorAI will need a backend orchestrator (e.g., LangChain, AI SDK, or custom logic) to chain the data extraction with the LLM API calls.
- **Figma Integration:** AnyDesign uses Claude's Figma MCP. To support Figma, InirazorAI will need its own integration with the Figma API.

# Components to Avoid
- **`scripts/export_for_claude_design.py`**: Highly coupled to Anthropic's proprietary Claude Design platform. Unnecessary for InirazorAI.
- **`scripts/lint_design_md.py`**: Mostly useful for testing the prompt itself. Unless you plan to have a rigid pipeline that auto-rejects LLM outputs, this can be skipped.
- **Direct CLI usage**: The CLI args parsing in the Python scripts should be stripped if converting to backend API endpoints.

# Recommended Integration Architecture
Given InirazorAI is a React/Vite application (paired with Supabase), the architecture should decouple the Heavy Data Extraction from the LLM Processing.

1. **Frontend (React)**: 
   - Accepts URLs, Images, or Element selectors from the user.
   - Displays the extracted design system and tokens visually.
2. **Backend Services (Node.js Edge Functions or Python Microservice)**:
   - **Extraction Service**: Port `extract_css_vars.py` and `capture_site.py` to Node.js using `Playwright/Puppeteer` (or host the Python scripts on a lightweight FastAPI server if preferred).
   - **LLM Orchestration Service**: A service that receives the extracted HTML/CSS and screenshots, builds the prompt using the AnyDesign markdown files as context, and calls a multimodal LLM API (OpenAI, Gemini, or Claude).
3. **Database (Supabase)**: Stores the extracted `design-tokens.json` and generated `design.md` for user projects.

# Minimum Viable Integration Plan
1. **Port Prompts to System Instructions**: Copy the conceptual logic from `SKILL.md` and `references/` into a unified System Prompt for your LLM of choice in your backend.
2. **Build the Extraction Endpoint**: Create a serverless function (Node.js Playwright or Python) that takes a URL, fetches the CSS variables, and captures a full-page screenshot.
3. **Connect Frontend to LLM**: Build a React UI where users input a URL. The frontend calls the Extraction Endpoint, then sends the screenshot and CSS data to the LLM via your backend (using the unified System Prompt).
4. **Parse and Render Output**: Have the LLM output structured JSON (design tokens) and Markdown (analysis), and render them in the InirazorAI dashboard.
