async function onInvoke(request, env) {
  console.log("=== SCORING ENGINE START ===");
  
  const scoring = {
    "lawsuit": 10, "sue": 10, "cancel": 10,
    "garbage": 9, "terrible": 9, "disgusting": 9,
    "unacceptable": 8, "angry": 8, "hate": 8,
    "frustrated": 7, "ridiculous": 7, "annoying": 7,
    "slow": 6, "waiting": 6,
    "confused": 5, "issue": 5, "problem": 5,
    "help": 3, "please": 3,
    "good": 1, "great": 1, "thanks": 1
  };

  try {
    const parsedBody = await request.json();
    console.log("Scoring Engine received raw object:", JSON.stringify(parsedBody));
    
    let targetPayload = parsedBody.payload || parsedBody;
    
    // If the payload is stringified JSON, parse it safely
    if (typeof targetPayload === 'string') {
      try {
        targetPayload = JSON.parse(targetPayload);
      } catch (e) {
        console.error("Failed to parse inner payload string:", e.message);
      }
    }

    // Extract the snake_case message text property
    const finalMessage = targetPayload.message_text || targetPayload.message || "";
    const lowerCaseMessage = finalMessage.toLowerCase();
    
    console.log(`Scanning text: "${lowerCaseMessage}"`);

    let level = 0;

    // Run your standard keyword point counting logic
    for (let word in scoring) {
      const regex = new RegExp(word, 'g');
      const matches = lowerCaseMessage.match(regex);
      if (matches) {
        level += matches.length * scoring[word];
      }
    }

    level = Math.min(level, 10); // Cap output scale at 10
    console.log(`Returning level: ${level}`);

    return new Response(JSON.stringify({ tantrum_level: level }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ tantrum_level: 0, error: err.message }), { status: 500 });
  }
}

export { onInvoke };