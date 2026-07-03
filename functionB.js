export async function onInvoke(request, env) {
  console.log("=== FUNCTION B START ===");
  
  const body = await request.json();
  console.log("Function B Raw Body received:", JSON.stringify(body));
  
  let incomingPayload = body.payload || body;
  console.log("Initial incomingPayload evaluation:", JSON.stringify(incomingPayload));
  
  // Handle both string and object payloads defensively to prevent crashes
  if (typeof incomingPayload === 'string') {
    console.log("Incoming payload detected as a string. Parsing JSON...");
    try {
      incomingPayload = JSON.parse(incomingPayload);
      console.log("Successfully parsed stringified payload:", JSON.stringify(incomingPayload));
    } catch (e) {
      console.warn("Payload is raw non-JSON text. Wrapping inside fallback object template:", e.message);
      incomingPayload = { message: incomingPayload };
    }
  }
  
  const message = (incomingPayload.message || "").toLowerCase();
  console.log("Sanitized message text to scan (forced lowercase):", `"${message}"`);
  
  const scoring = {
    "cancel": 3, "terrible": 2, "garbage": 2, "lawsuit": 3, "sue": 3,
    "bad": 1, "angry": 2, "refund": 1, "complaint": 1, "issue": 1, "problem": 1
  };

  let level = 0;
  console.log("Beginning regex loop keyword dictionary scanning...");
  
  for (let word in scoring) {
    const regex = new RegExp(word, 'g');
    const matches = message.match(regex);
    if (matches) {
      const addedPoints = matches.length * scoring[word];
      level += addedPoints;
      console.log(`Keyword Match! Word: "${word}" matched ${matches.length} time(s). Adding ${addedPoints} points.`);
    }
  }

  console.log(`Raw calculated metric level before cap: ${level}`);
  level = Math.min(level, 10); // Cap metric scale at 10
  console.log(`Final calculated level output (capped at 10): ${level}`);
  
  const responsePayload = { tantrum_level: level };
  console.log("Function B responding with payload:", JSON.stringify(responsePayload));
  console.log("=== FUNCTION B END ===");

  return new Response(JSON.stringify(responsePayload), { 
    headers: { "Content-Type": "application/json" } 
  });
}