const fs = require('fs');
const path = 'C:/Users/iniya/.gemini/antigravity/brain/1d077d7c-baf3-41b5-a050-51762f930291/scratch/benchmark_models.js';
let content = fs.readFileSync(path, 'utf8');

// Replace the loop
const newLogic = \const RUNS_PER_SCENARIO = 5;

const CONFIGURATIONS = [
  { name: 'JSON_MODE_ENABLED', useResponseFormat: true },
  { name: 'JSON_MODE_DISABLED', useResponseFormat: false }
];

async function runBenchmark() {
  console.log("Starting Controlled A/B Forensic Benchmark...");
  const configAggregates = {};
  const model = MODELS[0];

  for (const config of CONFIGURATIONS) {
    console.log('\\n======================================================');
    console.log('\Benchmarking Configuration: \\');
    console.log('======================================================');
    
    let totalLatency = 0;
    let latencies = [];
    let rawJsonSuccesses = 0;
    let prodJsonSuccesses = 0;
    let classificationSuccesses = 0;
    let totalAttempts = 0;
    let httpFailures = 0;
    let overloadFailures = 0;
    let lengthTruncations = 0;
    let malformedJsonFailures = 0;
    let doubleCurlyBraceFailures = 0;

    for (const scenario of scenarios) {
      for (let run = 1; run <= RUNS_PER_SCENARIO; run++) {
        totalAttempts++;
        console.log('\\n--- [\] Run \/\ ---');

        const userPrompt = \\\EVIDENCE:
- Payment Amount: ?\
- Settlement Gross Amount: ?\
- Payment Status: \
- Expected Net Settlement: ?\
- Actual Net Settlement: ?\
- Difference: ?\
- Known Fees: ?\
- Known Tax: ?\
- Known Refund: ?\
- Known Adjustment: ?\

Analyze this discrepancy and provide the JSON output.\\\;

        const start = Date.now();
        let httpStatus = 'N/A';
        let rawValid = false;
        let prodValid = false;
        let classificationCorrect = false;
        let latencyMs = 0;
        let finishReason = 'unknown';
        let textLength = 0;
        let predictedClass = 'N/A';
        
        try {
          const bodyPayload = {
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0,
            top_p: 1,
            max_tokens: 1500,
          };
          if (config.useResponseFormat) {
            bodyPayload.response_format = { type: 'json_object' };
          }

          const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': \\\Bearer \\\\,
            },
            body: JSON.stringify(bodyPayload),
          });

          httpStatus = response.status;
          latencyMs = Date.now() - start;
          latencies.push(latencyMs);
          totalLatency += latencyMs;

          if (!response.ok) {
            httpFailures++;
            if (httpStatus === 503 || httpStatus === 429) overloadFailures++;
            const errText = await response.text();
            console.log('? HTTP ' + httpStatus + ' (' + latencyMs + 'ms) - ' + errText.slice(0, 100));
          } else {
            const data = await response.json();
            const text = data.choices?.[0]?.message?.content || "";
            textLength = text.length;
            finishReason = data.choices?.[0]?.finish_reason || 'unknown';
            
            if (finishReason === 'length') {
              lengthTruncations++;
              console.log('? [' + config.name + '] Scenario: ' + scenario.name + ' | Repetition: ' + run + ' | Failure: LENGTH TRUNCATION');
            }

            const isDoubleCurly = /^\\s*\\{\\s*\\{/.test(text) || /^\\s*\\{\\r?\\n\\{/.test(text);
            if (isDoubleCurly) {
              doubleCurlyBraceFailures++;
              console.log('? [' + config.name + '] Scenario: ' + scenario.name + ' | Repetition: ' + run + ' | Failure: DOUBLE CURLY BRACE {{');
            }
            
            try {
              JSON.parse(text);
              rawValid = true;
              rawJsonSuccesses++;
            } catch (e) {
              malformedJsonFailures++;
              console.log('? [' + config.name + '] Scenario: ' + scenario.name + ' | Repetition: ' + run + ' | Failure: MALFORMED JSON');
            }
            
            try {
              const parsed = parseAIJson(text, model);
              prodValid = true;
              prodJsonSuccesses++;
              predictedClass = parsed.classification || 'MISSING';
              
              if (predictedClass === scenario.expectedClassification) {
                classificationCorrect = true;
                classificationSuccesses++;
              }
            } catch (e) {
              console.log('\\n? FORENSIC LOG: Parse Failed');
              console.log('   Exact Error: ' + e.message);
              console.log('   Raw Content (first 500 chars):\\n' + text.slice(0, 500) + '...\\n');
            }
          }
          
          console.log('HTTP Status: ' + httpStatus + ' | Latency: ' + latencyMs + 'ms');
          console.log('Finish Reason: ' + finishReason + ' | Raw Length: ' + textLength);
          console.log('Raw JSON parse: ' + rawValid + ' | Prod parseAIJson: ' + prodValid);
          console.log('Predicted: ' + predictedClass + ' | Expected: ' + scenario.expectedClassification + ' | Correct: ' + classificationCorrect);
          
        } catch (e) {
          latencyMs = Date.now() - start;
          httpFailures++;
          console.log('? NETWORK ERROR: ' + e.message);
        }
      }
    }

    latencies.sort((a, b) => a - b);
    const median = latencies.length > 0 ? latencies[Math.floor(latencies.length / 2)] : 0;
    const max = latencies.length > 0 ? latencies[latencies.length - 1] : 0;
    const avg = latencies.length > 0 ? Math.round(totalLatency / latencies.length) : 0;

    configAggregates[config.name] = {
      totalRequests: totalAttempts,
      rawJsonSuccess: Math.round((rawJsonSuccesses / totalAttempts) * 100) + '%',
      prodJsonSuccess: Math.round((prodJsonSuccesses / totalAttempts) * 100) + '%',
      classificationAccuracy: Math.round((classificationSuccesses / totalAttempts) * 100) + '%',
      avgLatency: avg,
      medianLatency: median,
      maxLatency: max,
      httpFailures,
      overloadFailures,
      lengthTruncations,
      malformedJsonFailures,
      doubleCurlyBraceFailures
    };
  }

  console.log("\\n======================================================");
  console.log("FINAL BENCHMARK AGGREGATES");
  console.log("======================================================");
  console.table(configAggregates);
}

runBenchmark().catch(console.error);\;

content = content.replace(/const RUNS_PER_SCENARIO = 1;[\\s\\S]*runBenchmark\(\)\.catch\(console\.error\);/, newLogic);
fs.writeFileSync(path, content, 'utf8');
