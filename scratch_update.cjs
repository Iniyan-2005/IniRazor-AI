const fs = require('fs');
const path = require('path');
const file = 'd:/ALL DOCUMENTS/Sofwares/Java setup/Iniyan/InirazorAI/src/pages/LandingPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add missing lucide-react imports if any
content = content.replace(/import \{ Brain, ArrowRight, [^\}]+\} from 'lucide-react';/, 
  "import { Brain, ArrowRight, ShieldCheck, Zap, Database, TrendingUp, AlertTriangle, Play, Menu, X, CheckCircle2, ChevronRight, LineChart, MessageSquare, ShieldAlert, ScrollText, Lock, Eye } from 'lucide-react';");

// 2. Update insightData to exceptionData
content = content.replace(/const insightData = \[[\s\S]*?\];/, `const exceptionData = [
    {
      id: "PAY_8924",
      headline: "Amount Mismatch",
      expected: "₹12,500.00",
      actual: "₹12,350.00",
      diff: "₹150.00",
      color: "text-red-500",
      aiReasoning: "The ₹150 discrepancy perfectly matches the standard 1.2% cross-border markup fee which was not included in the expected base settlement.",
      confidence: 94,
      action: "AUTO_RESOLVE"
    },
    {
      id: "PAY_9102",
      headline: "Unexplained Deduction",
      expected: "₹45,000.00",
      actual: "₹42,000.00",
      diff: "₹3,000.00",
      color: "text-red-500",
      aiReasoning: "A massive ₹3,000 deduction is present without corresponding tax or fee records. This anomaly cannot be safely explained and requires human approval.",
      confidence: 62,
      action: "NEEDS_REVIEW"
    }
  ];`);

// Update the state variable
content = content.replace(/const \[activeInsight, setActiveInsight\] = useState\(0\);/, 'const [activeInsight, setActiveInsight] = useState(0);');
content = content.replace(/insightData/g, 'exceptionData'); // rename variable usage

// 3. Hero Section Text
content = content.replace(/Your AI Finance <br className="hidden lg:block" \/>\s*<span[^>]*>\s*Controller\s*<\/span> for Every Transaction./, 
  "Your AI-Powered <br className=\"hidden lg:block\" />\n<span className=\"text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400\">Reconciliation</span> Engine.");

content = content.replace(/Connect your payment data and let AI turn thousands of transactions into clear insights, anomalies, trends, and actions./, 
  "Automate payment-to-settlement matching. Let deterministic math handle standard fees, and AI safely investigate complex discrepancies.");

// 4. Hero Floating Cards
content = content.replace(/Revenue Trend<\/p>\s*<p className="text-\[10px\] sm:text-xs font-medium text-\[var\(--success\)\]">\+18\.4% this week<\/p>/,
  "Payment Matched</p>\n<p className=\"text-[10px] sm:text-xs font-medium text-[var(--success)]\">₹1,25,000 settled</p>");

content = content.replace(/Unusual marketing spend<\/p>/, "Amount mismatch (₹120)</p>");
content = content.replace(/Anomaly Detected<\/p>/, "Exception Queued</p>");

content = content.replace(/Cash flow optimized<\/p>/, "Missing tax identified</p>");
content = content.replace(/AI Insight<\/p>/, "AI Analysis</p>");

// 5. Problem Storytelling Section
content = content.replace(/Your transactions are telling a story\. <br \/>\s*<span[^>]*>\s*Are you listening\?\s*<\/span>/, 
  "Thousands of transactions. <br />\n<span className=\"text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400\">Are you matching them all?</span>");

content = content.replace(/\{.*?TXN_8921.*?\}\.map\(\(txn, i\) => \(/s, 
`{[
  { desc: 'PAY_8921 • Settled perfectly', val: 'Matched', color: 'text-emerald-500' },
  { desc: 'PAY_8922 • Missing settlement', val: 'Error', color: 'text-red-500' },
  { desc: 'PAY_8923 • Known fee deduction', val: 'Matched', color: 'text-emerald-500' },
  { desc: 'PAY_8924 • Amount mismatch', val: 'Review', color: 'text-amber-500' },
  { desc: 'PAY_8925 • Tax discrepancy', val: 'Matched', color: 'text-emerald-500' }
].map((item, i) => (`);

content = content.replace(/<span className=\{i === 1 \? "text-emerald-500" : "text-red-500"\}>\{i === 1 \? '\+₹1,25,000' : \(i === 0 \? '-₹42,000' : \(i === 2 \? '-₹18,500' : \(i === 3 \? '-₹899' : '-₹2,400'\)\)\)\}<\/span>/,
  "<span className={item.color}>{item.val}</span>");
  
content = content.replace(/<span className="text-\[var\(--text-muted\)\]">\{txn\}<\/span>/, 
  "<span className=\"text-[var(--text-muted)]\">{item.desc}</span>");

content = content.replace(/<h3 className="text-xl font-bold">AI Finance Controller<\/h3>/, 
  "<h3 className=\"text-xl font-bold\">Intelligent Reconciliation</h3>");

content = content.replace(/\{\[\s*\{ icon: TrendingUp.*?Marketing spend increased.*?\}\.map\(\(item, i\) => \(/s,
`{[
  { icon: Database, color: 'text-blue-500', text: '100 transactions synced & processed.' },
  { icon: CheckCircle2, color: 'text-emerald-500', text: 'Deterministic engine auto-matched 94 records.' },
  { icon: Brain, color: 'text-indigo-500', text: 'AI safely investigated 6 complex exceptions.' }
].map((item, i) => (`);

// 6. How it works
content = content.replace(/From Raw Data to Clear Intelligence<\/h2>\s*<p className="text-lg text-\[var\(--text-secondary\)\]">Three simple steps to unlock the full potential of your financial data\.<\/p>/,
  "From Raw Data to Complete Reconciliation</h2>\n<p className=\"text-lg text-[var(--text-secondary)]\">A fail-safe pipeline combining deterministic mathematics with AI intelligence.</p>");

content = content.replace(/\{\[\s*\{ icon: Database.*?\}\.map\(\(step, i\) => \(/s,
`{[
  { icon: Database, num: '01 — Connect', title: 'Generate & Sync', desc: 'Securely sync Razorpay test data or generate synthetic financial records.', color: 'var(--primary)' },
  { icon: LineChart, num: '02 — Math First', title: 'Deterministic Engine', desc: 'Instantly reconcile standard fee and tax discrepancies using rule-based math.', color: 'var(--success)' },
  { icon: Brain, num: '03 — AI Fallback', title: 'AI Investigation', desc: 'AI analyzes complex anomalies safely, queuing low-confidence items for human review.', color: 'var(--ai)' }
].map((step, i) => (`);

// 7. Features
content = content.replace(/Everything You Need to Understand Your Business<\/h2>\s*<p className="text-lg max-w-2xl text-\[var\(--text-secondary\)\]">Not just another dashboard\. A comprehensive suite of AI tools designed to decode complex financial activity\.<\/p>/,
  "Enterprise-Grade Financial Safety</h2>\n<p className=\"text-lg max-w-2xl text-[var(--text-secondary)]\">Not just a dashboard. A robust reconciliation pipeline built for strict FinOps compliance and accuracy.</p>");

// Feature Card 1 (Top)
content = content.replace(/AI-Powered Insights<\/h3>\s*<p className="mb-8 text-\[var\(--text-secondary\)\]">AI converts complex financial data into understandable business intelligence\. It reads between the lines of your spreadsheet\.<\/p>/,
  "Hybrid Reconciliation Engine</h3>\n<p className=\"mb-8 text-[var(--text-secondary)]\">Math for the expected, AI for the unexpected. Rule-based engines handle standard deductions, while NVIDIA NIM investigates complex amount mismatches.</p>");

content = content.replace(/<div className="flex gap-4">\s*<div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-\[var\(--primary\)\] text-white">AI<\/div>\s*<div>\s*<p className="text-sm font-medium mb-1">Your marketing ROI is up 12%\.<\/p>\s*<p className="text-xs text-\[var\(--text-muted\)\]">This correlates strongly with the recent Google Ads campaign launched on Tuesday\.<\/p>\s*<\/div>\s*<\/div>/s,
  `<div className="flex items-center justify-between w-full">
  <div className="flex-1 border-r border-[var(--border)] px-4 text-center"><p className="text-xl font-bold text-[var(--success)]">94%</p><p className="text-xs text-[var(--text-muted)]">Deterministic Match</p></div>
  <div className="flex-1 px-4 text-center"><p className="text-xl font-bold text-[var(--ai)]">6%</p><p className="text-xs text-[var(--text-muted)]">AI Investigated</p></div>
</div>`);

// Feature Card 2 (Anomaly -> Financial Safety)
content = content.replace(/<ShieldAlert className="w-6 h-6" \/>/, '<Lock className="w-6 h-6" />');
content = content.replace(/Anomaly Detection<\/h3>\s*<p className="mb-8 text-\[var\(--text-secondary\)\]">Identify unusual transactions, duplicate payments, and potential financial risks before they impact your runway\.<\/p>/,
  "Financial Safety First</h3>\n<p className=\"mb-8 text-[var(--text-secondary)]\">Fail-safe architecture. Strict confidence thresholds ensure ambiguous transactions are never auto-resolved without explicit human approval.</p>");
  
content = content.replace(/<span className="text-xs font-bold text-red-500 uppercase flex items-center gap-1">\s*<span className="w-1\.5 h-1\.5 rounded-full bg-red-500 animate-pulse"><\/span> High Risk Detected\s*<\/span>\s*<span className="text-xs text-red-500\/80">Just now<\/span>\s*<\/div>\s*<p className="text-sm font-medium mb-1 text-\[var\(--text-primary\)\]">Duplicate subscription payment<\/p>\s*<p className="text-xs text-red-500\/80 font-mono">₹4,200 charged twice by 'Atlassian' within 24h\.<\/p>/s,
  `<span className="text-xs font-bold text-[var(--warning)] uppercase flex items-center gap-1">
    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Confidence &lt; 90%
  </span>
</div>
<p className="text-sm font-medium mb-1 text-[var(--text-primary)]">AI Auto-Resolve Blocked</p>
<p className="text-xs text-[var(--text-muted)] font-mono">Transaction routed to manual review queue.</p>`);

// Feature Card 3 (Revenue & Spending -> Immutable Audit Trail)
content = content.replace(/<TrendingUp className="w-6 h-6" \/>/, '<ScrollText className="w-6 h-6" />');
content = content.replace(/Revenue & Spending Intelligence<\/h3>\s*<p className="mb-8 text-\[var\(--text-secondary\)\]">Understand exactly where money comes from and where it goes with real-time categorisation\.<\/p>/,
  "Immutable Audit Trail</h3>\n<p className=\"mb-8 text-[var(--text-secondary)]\">100% Traceability. Every deterministic match, AI reasoning, and human intervention is logged chronologically for strict enterprise compliance.</p>");

content = content.replace(/<div className="mt-auto flex items-end gap-2 h-24">.*?<\/div>/s, 
  `<div className="mt-auto bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-3"><p className="text-[10px] font-mono text-[var(--text-muted)] mb-1">[01:22:45] EVENT_TYPE: AI_INVESTIGATION</p><p className="text-xs font-medium">Actor: AI_AGENT • Decision: NEEDS_REVIEW</p></div>`);

// Feature Card 4 (Ask Your Finance Data -> Exceptions Queue)
content = content.replace(/<MessageSquare className="w-6 h-6" \/>/, '<AlertTriangle className="w-6 h-6" />');
content = content.replace(/Ask Your Finance Data<\/h3>\s*<p className="mb-8 text-\[var\(--text-secondary\)\]">Allow users to interact with their financial information using natural language\. No SQL required\.<\/p>/,
  "Exceptions Queue</h3>\n<p className=\"mb-8 text-[var(--text-secondary)]\">A dedicated workspace for FinOps teams to manually investigate, approve, or reject flagged transactions with full AI-generated context.</p>");

content = content.replace(/<div className="ml-auto w-3\/4 p-3 rounded-2xl rounded-tr-sm text-sm text-white bg-\[var\(--primary\)\]\">\s*How much did we spend on software last month\?\s*<\/div>\s*<div className="w-5\/6 p-3 rounded-2xl rounded-tl-sm text-sm border border-\[var\(--border\)\] shadow-sm bg-\[var\(--bg-surface\)\]\">\s*You spent ₹1,42,500 on software last month, up 8% from the previous month\. Top vendor: AWS\.\s*<\/div>/s,
  `<div className="flex gap-2"><button className="flex-1 py-2 rounded-lg bg-[var(--success-subtle)] text-[var(--success)] text-xs font-bold flex items-center justify-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> Approve</button><button className="flex-1 py-2 rounded-lg bg-[var(--danger-subtle)] text-[var(--danger)] text-xs font-bold flex items-center justify-center gap-1"><X className="w-3.5 h-3.5"/> Reject</button></div>`);

// 8. AI Insight Demo -> Exception Analysis Demo
content = content.replace(/Stop digging through spreadsheets\. <br \/>\s*<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">\s*Start asking questions\.\s*<\/span>/,
  "Don't just flag mismatches. <br />\n<span className=\"text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400\">\nUnderstand them.\n</span>");

content = content.replace(/Our AI Finance Controller doesn't just show you charts\. It understands your business context and provides direct answers to complex financial questions\./,
  "When mathematical rules fail, our AI steps in to analyze the raw transaction evidence, providing your FinOps team with a likely cause, explanation, and a safe recommendation.");

content = content.replace(/Ask Your Data/, "Investigate Exceptions");

content = content.replace(/<h4 className="font-semibold text-sm">IniRazor Analyst<\/h4>/,
  "<h4 className=\"font-semibold text-sm\">Exception Investigation</h4>");

// Update the Chatbot UI to Exception UI
const oldChatbotUI = `<div className="flex justify-end">
                            <div className="max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm text-sm bg-[var(--bg-surface-2)]">
                              {exceptionData[activeInsight].q}
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 shadow-sm" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--ai) 100%)' }}>
                              <Brain className="w-4 h-4 text-white" />
                            </div>
                            <div className="space-y-3 w-full">
                              <div className="rounded-2xl rounded-tl-sm p-4 shadow-sm border bg-[var(--bg-surface)] border-[var(--border-subtle)]">
                                <p className="text-sm font-medium mb-3">
                                  {exceptionData[activeInsight].headline} <span className={exceptionData[activeInsight].color}>{exceptionData[activeInsight].highlight}</span> {exceptionData[activeInsight].amount}.
                                </p>
                                <p className="text-sm mb-3 text-[var(--text-secondary)]">{exceptionData[activeInsight].subtext}</p>
                                <div className="space-y-2 mb-3">
                                  {exceptionData[activeInsight].breakdown.map((it, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm p-2 rounded bg-[var(--bg-surface-2)]">
                                      <span className="font-medium flex items-center gap-2"><it.icon className={\`w-3.5 h-3.5 \${exceptionData[activeInsight].color}\`} /> {it.name}</span>
                                      <span className={\`font-mono \${exceptionData[activeInsight].color}\`}>{it.val}</span>
                                    </div>
                                  ))}
                                </div>
                                <p className="text-sm font-medium pt-2 border-t border-[var(--border-subtle)]">
                                  {exceptionData[activeInsight].summary}
                                </p>
                              </div>
                            </div>
                          </div>`;

const newExceptionUI = `<div className="space-y-4">
  <div className="flex justify-between items-center p-3 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border)]">
    <span className="text-sm font-semibold text-[var(--text-secondary)]">Transaction ID</span>
    <span className="text-sm font-mono font-bold">{exceptionData[activeInsight].id}</span>
  </div>
  <div className="grid grid-cols-3 gap-2">
    <div className="p-3 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border)] text-center">
      <p className="text-xs text-[var(--text-muted)] mb-1">Expected</p>
      <p className="text-sm font-bold">{exceptionData[activeInsight].expected}</p>
    </div>
    <div className="p-3 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border)] text-center">
      <p className="text-xs text-[var(--text-muted)] mb-1">Actual</p>
      <p className="text-sm font-bold">{exceptionData[activeInsight].actual}</p>
    </div>
    <div className="p-3 rounded-lg bg-[var(--danger-subtle)] border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] text-center">
      <p className="text-xs text-[var(--danger)] mb-1">Difference</p>
      <p className="text-sm font-bold text-[var(--danger)]">{exceptionData[activeInsight].diff}</p>
    </div>
  </div>
  
  <div className="rounded-xl p-4 border border-[color-mix(in_srgb,var(--ai)_30%,transparent)] bg-[var(--ai-subtle)]">
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center gap-2 text-[var(--ai)]">
        <Brain className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">AI Analysis</span>
      </div>
      <div className="flex items-center gap-1 text-[var(--success)] bg-[var(--success-subtle)] px-2 py-1 rounded text-xs font-bold">
        Confidence: {exceptionData[activeInsight].confidence}%
      </div>
    </div>
    <p className="text-sm text-[var(--text-primary)] font-medium leading-relaxed">
      {exceptionData[activeInsight].aiReasoning}
    </p>
  </div>
</div>`;

content = content.replace(oldChatbotUI, newExceptionUI);

content = content.replace(/<span className="text-xs text-\[var\(--text-muted\)\] self-center mr-auto">Suggested queries:<\/span>/, 
  '<span className="text-xs text-[var(--text-muted)] self-center mr-auto">View Exception Cases:</span>');

content = content.replace(/Expenses<\/button>/, "Amount Mismatch</button>");
content = content.replace(/Runway<\/button>/, "Unexplained Discrepancy</button>");

content = content.replace(/<div className="flex-1 bg-\[var\(--bg-surface\)\] border border-\[var\(--border\)\] rounded-full px-4 py-2 text-sm text-\[var\(--text-muted\)\] flex items-center">\s*Ask a follow-up question\.\.\.\s*<\/div>\s*<div className="w-8 h-8 rounded-full flex items-center justify-center bg-\[var\(--primary\)\] text-white opacity-50">\s*<ArrowRight className="w-4 h-4" \/>\s*<\/div>/,
  `<button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)] transition-colors">
  <CheckCircle2 className="w-4 h-4" /> Approve & Resolve
</button>`);

fs.writeFileSync(file, content, 'utf8');
console.log('Update applied successfully.');
