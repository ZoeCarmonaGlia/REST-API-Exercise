export async function onInvoke(request, env) {
  const body = await request.json();
  const incomingHeaders = Object.fromEntries(request.headers.entries());
  
  // Safely capture payload object from the Applet UI
  const innerPayload = body.payload || {}; 
  
  // TARGET ENDPOINT: Double-check that this matches Function B's actual invocation URI!
  const analyzerURL = "https://api.glia.com/integrations/1566bb8a-3e75-4fe6-a4a4-cb43789a8db3/endpoint";
  
  const requestPayload = {
    message: innerPayload.message || ""
  };

  const res = await fetch(analyzerURL, { 
    method: "POST", 
    headers: { 
      ...incomingHeaders,
      "Content-Type": "application/json" 
    },
    // Send standard structured object directly
    body: JSON.stringify({ payload: requestPayload }) 
  });
  
  const data = await res.json();
  const level = data.tantrum_level || 0;
  
  // Prioritization Business Logic
  let verdict = "🟢 Standard protocol - Customer is calm.";
  
  if (level >= 8) {
    if (innerPayload.is_vip === true) {
      verdict = "🔴 CRITICAL ALERT: Offer VIP apology and $50 credit immediately!";
    } else {
      verdict = "🔴 CRITICAL ALERT: Max escalation protocol. Deploy the supervisor complaint script.";
    }
  } else if (level >= 5) {
    if (innerPayload.is_vip === true) {
      verdict = "🟡 CAUTION: VIP account showing frustration. Handle with priority empathy.";
    } else {
      verdict = "🟡 CAUTION: Keep calm and use the standard irritation/complaint script.";
    }
  } else if (level >= 1) {
    verdict = "🟢 Notice: Mild issue detected. Proceed with normal helpful protocol.";
  }
  
  return new Response(JSON.stringify({ 
    verdict: verdict, 
    tantrum_level: level 
  }), { 
    headers: { "Content-Type": "application/json" } 
  });
}