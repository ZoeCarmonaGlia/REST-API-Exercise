export async function onInvoke(request, env) {
  console.log("=== GATEWAY ROUTER START ===");
  
  try {
    const rawBodyText = await request.text();
    console.log("Function A Raw Body received:", rawBodyText);

    let body = JSON.parse(rawBodyText);
    let messageText = "";
    let isVipUser = false;
    let operatorToken = ""; // Variable to hold our authentic token

    // Unwrapping the stringified JSON payload escaping cleanly
    if (body.payload) {
      let internalPayload = body.payload;
      if (typeof internalPayload === 'string') {
        try {
          internalPayload = JSON.parse(internalPayload);
        } catch (e) {
          console.error("Failed to parse inner payload:", e.message);
        }
      }
      
      const targetData = internalPayload.payload || internalPayload;
      messageText = targetData.message || "";
      isVipUser = targetData.is_vip === true;
      operatorToken = targetData.token || ""; // <-- FIX: Capture the authentic token passed from the Applet body!
    } else {
      messageText = body.message || "";
      isVipUser = body.is_vip === true;
      operatorToken = body.token || ""; 
    }

    console.log(`Successfully extracted string: "${messageText}" | VIP: ${isVipUser}`);
    
    const analyzerURL = "https://api.glia.com/integrations/1566bb8a-3e75-4fe6-a4a4-cb43789a8db3/endpoint";

    // Forward the clean flat message structure to Function B using the real token
    const res = await fetch(analyzerURL, { 
      method: "POST", 
      headers: { 
        "Content-Type": "application/json",
        "Authorization": operatorToken // <-- Pass the correct token captured from the body text
      },
      body: JSON.stringify({ message_text: messageText }) 
    });
    
    if (!res.ok) {
      return new Response(JSON.stringify({ verdict: `Error: Analyzer returned status ${res.status}`, tantrum_level: 0 }));
    }

    const data = await res.json();
    const level = data.tantrum_level || 0;
    
    // Prioritization Logic
    let verdict = "Standard protocol - Customer is calm.";
    if (level >= 8) {
      verdict = isVipUser ? "CRITICAL ALERT: Offer VIP apology and $50 credit immediately!" : "CRITICAL ALERT: Max escalation protocol. Deploy the supervisor complaint script.";
    } else if (level >= 5) {
      verdict = isVipUser ? "CAUTION: VIP account showing frustration. Handle with priority empathy." : "CAUTION: Keep calm and use the standard irritation/complaint script.";
    } else if (level >= 1) {
      verdict = "Notice: Mild issue detected. Proceed with normal helpful protocol.";
    }
    
    return new Response(JSON.stringify({ verdict, tantrum_level: level }), { 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (error) {
    return new Response(JSON.stringify({ verdict: `Router Crash: ${error.message}`, tantrum_level: 0 }));
  }
}