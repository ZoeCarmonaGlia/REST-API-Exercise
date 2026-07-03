export async function onInvoke(request, env) {
  console.log("=== FUNCTION A START ===");
  
  const rawBodyText = await request.text();
  console.log("Function A Raw Body received:", rawBodyText);

  let body = JSON.parse(rawBodyText);
  let messageText = "";
  let isVipUser = false;

  // Unwrapping the stringified JSON payload escaping sent by Glia
  if (body.payload) {
    let internalPayload = body.payload;
    if (typeof internalPayload === 'string') {
      try {
        internalPayload = JSON.parse(internalPayload);
      } catch (e) {
        console.error("Failed to parse stringified inner payload:", e.message);
      }
    }
    
    const targetData = internalPayload.payload || internalPayload;
    messageText = targetData.message || "";
    isVipUser = targetData.is_vip === true;
  } else {
    messageText = body.message || "";
    isVipUser = body.is_vip === true;
  }

  console.log(`Extracted text string: "${messageText}" | VIP Status: ${isVipUser}`);
  
  const analyzerURL = "https://api.glia.com/integrations/1566bb8a-3e75-4fe6-a4a4-cb43789a8db3/endpoint";
  const requestPayload = { message: messageText };

  // Safely grab the incoming token from the applet to pass platform gateway clearance
  const incomingHeaders = Object.fromEntries(request.headers.entries());
  const token = incomingHeaders['authorization'] || incomingHeaders['Authorization'] || "";

  // Fetch Function B with BOTH the right token AND the right layout
  const res = await fetch(analyzerURL, { 
    method: "POST", 
    headers: { 
      "Content-Type": "application/json",
      "Authorization": token // <--- Put this back to clear the gateway block!
    },
    body: JSON.stringify({ payload: JSON.stringify(requestPayload) }) 
  });
  
  const data = await res.json();
  const level = data.tantrum_level || 0;
  
  // Prioritization Business Logic
  let verdict = "🟢 Standard protocol - Customer is calm.";
  if (level >= 8) {
    verdict = isVipUser ? "🔴 CRITICAL ALERT: Offer VIP apology and $50 credit immediately!" : "🔴 CRITICAL ALERT: Max escalation protocol. Deploy the supervisor complaint script.";
  } else if (level >= 5) {
    verdict = isVipUser ? "🟡 CAUTION: VIP account showing frustration. Handle with priority empathy." : "🟡 CAUTION: Keep calm and use the standard irritation/complaint script.";
  } else if (level >= 1) {
    verdict = "🟢 Notice: Mild issue detected. Proceed with normal helpful protocol.";
  }
  
  const finalPayload = { verdict, tantrum_level: level };
  return new Response(JSON.stringify(finalPayload), { headers: { "Content-Type": "application/json" } });
}