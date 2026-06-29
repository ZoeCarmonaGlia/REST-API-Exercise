export default {
    async onInvoke(request, env) {
        try {
            // 1. Parse JSON body safely
            let payload;

            try {
            payload = await request.json();
            } catch (error) {
            return jsonResponse(
        {
            error: "Invalid JSON",
            message: "The request body must be valid JSON"
            },
            400
        );
    }

        // 2. Validate Applet payload
        const message = payload.message;
        const isVip = payload.is_vip === true;

        if (typeof message !== "string" || message.trim() === "") {
        return jsonResponse(
        {
        error: "Invalid payload",
        message: "Expected a non-empty string field called 'message'"
        },
        400
        );
        }

        // 3. Validate required environment variables
        if (!env.FUNCTION_B_URI) {
        return jsonResponse(
        {
        error: "Configuration error",
        message: "FUNCTION_B_URI is not configured"
        },
        500
        );
        }

        if (!env.BEARER_TOKEN) {
        return jsonResponse(
        {
        error: "Configuration error",
        message: "BEARER_TOKEN is not configured"
        },
        500
        );
        }

        // 4. Invoke Function B through HTTP POST
        const responseB = await fetch(env.FUNCTION_B_URI, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.BEARER_TOKEN}`
        },
        body: JSON.stringify({
        text: message
        })
        });

        // 5. Parse Function B response safely
        let resultB;

        try {
        resultB = await responseB.json();
        } catch (error) {
        return jsonResponse(
        {
        error: "Invalid response from Function B",
        message: "Function B did not return valid JSON"
        },
        502
        );
        }

        // 6. Handle Function B errors
        if (!responseB.ok) {
        return jsonResponse(
        {
        error: "Analyzer function failed",
        analyzer_status: responseB.status,
        details: resultB
        },
        responseB.status
        );
        }

        // 7. Validate analyzer response
        if (typeof resultB.score !== "number") {
        return jsonResponse(
        {
        error: "Invalid analyzer response",
        message: "Function B response must include a numeric 'score'",
        details: resultB
        },
        502
        );
        }

        // 8. Build final verdict
        const score = resultB.score;

        let finalVerdict = "normal";
        let priority = "low";

        if (score >= 8 && isVip) {
        finalVerdict = "urgent_escalation";
        priority = "critical";
        } else if (score >= 8) {
        finalVerdict = "escalate";
        priority = "high";
        } else if (score >= 5 && isVip) {
        finalVerdict = "vip_review";
        priority = "medium";
        }

        // 9. Return final verdict to the Applet
        return jsonResponse(
        {
        original_message: message,
        is_vip: isVip,
        analyzer_score: score,
        analyzer_severity: resultB.severity || "unknown",
        detected_keywords: resultB.detected_keywords || [],
        final_verdict: finalVerdict,
        priority,
        explanation: buildExplanation(score, isVip, finalVerdict)
        },
        200
        );
        } catch (error) {
        return jsonResponse(
        {
        error: "Gateway internal error",
        message: error.message
        },
        500
        );
        }
    }
    };

    function buildExplanation(score, isVip, finalVerdict) {
    if (finalVerdict === "urgent_escalation") {
    return "The message has a high-risk score and the customer is VIP, so it requires urgent escalation.";
    }

    if (finalVerdict === "escalate") {
    return "The message has a high-risk score, so it should be escalated.";
    }

    if (finalVerdict === "vip_review") {
    return "The message has a medium-risk score and the customer is VIP, so it should be reviewed.";
    }

    return "The message does not require escalation.";
    }

    function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
    status,
    headers: {
    "Content-Type": "application/json"
    }
    });
}