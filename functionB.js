export async function onInvoke(request, env) {
  const body = await request.json();
  
  let incomingPayload = body.payload || body;
  
  // Handle both string and object payloads defensively to prevent crashes
  if (typeof incomingPayload === 'string') {
    try {
      incomingPayload = JSON.parse(incomingPayload);
    } catch (e) {
      incomingPayload = { message: incomingPayload };
    }
  }
  
  const message = (incomingPayload.message || "").toLowerCase();
  
  const scoring = {
    "cancel": 3, "terrible": 2, "garbage": 2, "lawsuit": 3, "sue": 3,
    "bad": 1, "angry": 2, "refund": 1, "complaint": 1, "issue": 1, "problem": 1
  };

  let level = 0;
  for (let word in scoring) {
    const regex = new RegExp(word, 'g');
    const matches = message.match(regex);
    if (matches) {
      level += matches.length * scoring[word];
    }
  }

  level = Math.min(level, 10); // Cap metric scale at 10

  return new Response(JSON.stringify({ tantrum_level: level }), { 
    headers: { "Content-Type": "application/json" } 
  });
}