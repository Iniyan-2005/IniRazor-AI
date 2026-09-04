const fs = require('fs');
const path = 'C:/Users/iniya/.gemini/antigravity/brain/1d077d7c-baf3-41b5-a050-51762f930291/scratch/benchmark_models.js';
let content = fs.readFileSync(path, 'utf8');

// Replace the execution block
const regex = /const RUNS_PER_SCENARIO = 5;[\s\S]*runBenchmark\(\)\.catch\(console\.error\);/;
const newLogic = \const RUNS_PER_SCENARIO = 5;

async function runBenchmark() {
  console.log("Starting Simplified Output Schema Forensic Benchmark...");
  const model = MODELS[0]; // Always use nvidia/nemotron-3-super-120b-a12b

  console.log('\\n======================================================');
  console.log('Benchmarking Model: ' + model);
  console.log('======================================================');
  
  let totalLatency = 0;
  let latencies = [];
  let rawJsonSuccesses = 0;
  let prodJsonSuccesses = 0;
  let classificationSuccesses = 0;
  let validResponses = 0;
  let totalAttempts = 0;
  
  let httpFailures = 0;
  let overloadFailures = 0;
  let lengthTruncations = 0;
  let malformedJsonFailures = 0;
  let networkErrors = 0;

  for (const scenario of scenarios) {
    for (let run = 1; run <= RUNS_PER_SCENARIO; run++) {
      totalAttempts++;
      console.log('\\n--- [' + scenario.name + '] Run ' + run + '/' + RUNS_PER_SCENARIO + ' ---');

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
      let predictedAction = 'N/A';
      
      try {
        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \\\Bearer \\\\,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0,
            top_p: 1,
            max_tokens: 1500,
            response_format: { type: 'json_object' }
          }),
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
            console.log('? Scenario: ' + scenario.name + ' | Repetition: ' + run + ' | Failure: LENGTH TRUNCATION');
          }

          try {
            JSON.parse(text);
            rawValid = true;
            rawJsonSuccesses++;
          } catch (e) {
            malformedJsonFailures++;
            console.log('? Scenario: ' + scenario.name + ' | Repetition: ' + run + ' | Failure: MALFORMED JSON');
          }
          
          try {
            const parsed = parseAIJson(text, model);
            prodValid = true;
            prodJsonSuccesses++;
            validResponses++;
            predictedClass = parsed.classification || 'MISSING';
            predictedAction = parsed.recommendedAction || 'MISSING';
            
            if (predictedClass === scenario.expectedClassification) {
              classificationCorrect = true;
              classificationSuccesses++;
            }
          } catch (e) {
            console.log('\\n? FORENSIC LOG: Parse Failed');
            console.log('   Exact Error: ' + e.message);
          }
        }
        
        console.log('HTTP Status: ' + httpStatus + ' | Latency: ' + latencyMs + 'ms');
        console.log('Finish Reason: ' + finishReason + ' | Raw Length: ' + textLength);
        console.log('Raw JSON parse: ' + rawValid + ' | Prod parseAIJson: ' + prodValid);
        console.log('Predicted: ' + predictedClass + ' | Expected: ' + scenario.expectedClassification + ' | Correct: ' + classificationCorrect + ' | Action: ' + predictedAction);
        
      } catch (e) {
        latencyMs = Date.now() - start;
        networkErrors++;
        console.log('? NETWORK ERROR: ' + e.message);
      }
    }
  }

  latencies.sort((a, b) => a - b);
  const median = latencies.length > 0 ? latencies[Math.floor(latencies.length / 2)] : 0;
  const max = latencies.length > 0 ? latencies[latencies.length - 1] : 0;
  const avg = latencies.length > 0 ? Math.round(totalLatency / latencies.length) : 0;

  console.log("\\n======================================================");
  console.log("FINAL BENCHMARK AGGREGATES");
  console.log("======================================================");
  console.log('Total Attempts: ' + totalAttempts);
  console.log('Network Errors: ' + networkErrors);
  console.log('HTTP Failures: ' + httpFailures);
  console.log('Overload (503/429): ' + overloadFailures);
  console.log('Length Truncations: ' + lengthTruncations);
  console.log('Malformed JSON: ' + malformedJsonFailures);
  console.log('------------------------------------------------------');
  console.log('Avg Latency: ' + avg + 'ms');
  console.log('Median Latency: ' + median + 'ms');
  console.log('Max Latency: ' + max + 'ms');
  console.log('------------------------------------------------------');
  console.log('Valid Response Accuracy: ' + classificationSuccesses + ' correct / ' + validResponses + ' valid responses = ' + Math.round((classificationSuccesses / (validResponses || 1)) * 100) + '%');
  console.log('End-to-End Success: ' + classificationSuccesses + ' correct / ' + totalAttempts + ' total attempts = ' + Math.round((classificationSuccesses / totalAttempts) * 100) + '%');
  console.log('Raw JSON parse Success: ' + rawJsonSuccesses + '/' + totalAttempts + ' = ' + Math.round((rawJsonSuccesses / totalAttempts) * 100) + '%');
  console.log('Prod JSON parse Success: ' + prodJsonSuccesses + '/' + totalAttempts + ' = ' + Math.round((prodJsonSuccesses / totalAttempts) * 100) + '%');
  console.log("======================================================\\n");
}

runBenchmark().catch(console.error);\;
content = content.replace(regex, newLogic);
fs.writeFileSync(path, content, 'utf8');
