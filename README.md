# IniRazorAI — AI-Powered Reconciliation Intelligence

![IniRazorAI Dashboard](public/assets/welcome-bg.png) 

**IniRazorAI** is a payment reconciliation platform built for the **Razorpay Buildathon**. It automates financial discrepancy detection by combining a high-speed deterministic math engine with advanced AI investigation powered exclusively by **NVIDIA NIM (Nemotron 120B)**.

Every day, merchants on Razorpay receive thousands of settlements. The settlement amount rarely equals what was charged. Standard fees and taxes are easy to calculate, but when a discrepancy remains after accounting for every known deduction, human analysts must investigate. At scale, this is the biggest bottleneck in financial operations.

IniRazorAI transforms this manual spreadsheet exercise into a safe, auditable, AI-assisted workflow.

---

## 🚀 Key Features

### 1. Hybrid Two-Phase Architecture
- **Phase 1 (Deterministic Math):** Instantly resolves ~70% of discrepancies by testing differences against known gateway fees, GST/taxes, refunds, and manual adjustments within a configurable rounding tolerance.
- **Phase 2 (AI Investigation):** Only the mathematically unexplainable anomalies are sent to NVIDIA NIM for investigation.

### 2. Fail-Safe Financial Safety
Built on the principle: **When in doubt, send it to a human.**
- **Confidence Gate:** AI decisions must meet a strict, configurable confidence threshold (default 90%) to be auto-resolved. This threshold is enforced both in the frontend and injected directly into the AI's system prompt.
- **Fail-Safe Fallbacks:** API timeouts, rate limits (HTTP 429), authentication errors, or invalid JSON responses never result in incorrect financial resolutions. Every failure mode safely routes the transaction to the human-managed Exceptions Queue.

### 3. Self-Healing AI Pipeline
- **Parse-Retry Generation:** If the AI model returns markdown prose instead of the strict JSON format required, the Supabase Edge Function attempts to extract it. If it fails, it automatically triggers a second AI generation with a stricter "CORRECTION REQUIRED" prompt.
- **HTTP Resilience:** Built-in automatic retries with exponential backoff for NVIDIA API 503 (Service Overloaded) responses.

### 4. Human-in-the-Loop & Immutable Audit Trail
- Ambiguous transactions require active human sign-off (Approve/Reject).
- Every single system action, AI reasoning block, and human decision is recorded in a chronological, append-only **Audit Trail** alongside a full snapshot of the financial evidence used to make the decision.

### 5. Real-Time Reactive UI
- Dashboard KPIs, Exception Queues, and the Audit Trail update in real-time as AI background workers complete tasks, powered by a custom lightweight pub/sub React architecture (`useStore`).

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Framer Motion, Recharts
- **Backend:** Supabase Edge Functions (Deno / TypeScript)
- **AI Provider:** NVIDIA NIM (`nvidia/nemotron-3-super-120b-a12b`) exclusively (0 temperature for maximum determinism).
- **Payment Integration:** Razorpay Test API

---

## ⚙️ How It Works (The AI Flow)

1. When a transaction is mathematically unexplained, a structured evidence JSON is built (Gross amount, Fee, GST, Difference, etc.).
2. Evidence is POSTed to the Supabase Edge Function `investigate-exception`.
3. The Edge Function calls NVIDIA NIM with a strict zero-shot system prompt demanding a JSON response with:
   - `classification` (e.g., AMOUNT_MISMATCH, UNEXPLAINED_DISCREPANCY)
   - `confidence` (0.0 to 1.0)
   - `likelyCause` (Plain English explanation)
   - `recommendedAction` (AUTO_RESOLVE or NEEDS_REVIEW)
4. The frontend receives the payload and checks if `confidence >= threshold` AND `recommendedAction === 'AUTO_RESOLVE'`. If yes, it is marked **AI Resolved**. If no, it is marked **Needs Review**.

---

## 🏃‍♂️ Running the Project Locally

### Prerequisites
- Node.js (v18+)
- A Supabase project (for Edge Functions)
- NVIDIA NIM API Key

### Setup Steps
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Set up your `.env` file based on `.env.example`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Set your Edge Function secrets in Supabase:
   ```bash
   supabase secrets set AI_PROVIDER=NVIDIA
   supabase secrets set AI_API_KEY=your_nvidia_nim_api_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📊 Evaluation & Benchmarking
The system features a built-in Evaluation Page that benchmarks AI decisions against known ground-truth datasets to compute Accuracy, Precision, Recall, and F1 Scores using a Confusion Matrix. 

> *Note: By default, the system runs in a Synthetic Data Demo mode with a seeded random number generator to demonstrate the edge cases without requiring live payment credentials.*

---

*Built with ❤️ for the Razorpay Buildathon.*
