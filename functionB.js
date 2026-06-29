export default {
    async onInvoke(request, env) {
        try {
            // 1. Validate Authorization header
            const authHeader = request.headers.get("Authorization");

            if (!authHeader || authHeader !== `Bearer ${env.BEARER_TOKEN}`) {
                return jsonResponse(
            {
            error: "Unauthorized",
            message: "Missing or invalid bearer token"
            },
            401
            );
            }

        // 2. Parse JSON body safely
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

        // 3. Validate input
        const text = payload.text;

        if (typeof text !== "string" || text.trim() === "") {
            return jsonResponse(
            {
            error: "Invalid payload",
            message: "Expected a non-empty string field called 'text'"
            },
            400
            );
        }

        // 4. Normalize text
        const normalizedText = text.toLowerCase();

        // 5. Mock keyword analysis
        const highRiskKeywords = ["cancel", "terrible", "garbage"];
        const mediumRiskKeywords = ["bad", "angry", "refund", "complaint"];

        const detectedHighRiskKeywords = highRiskKeywords.filter((word) =>
        normalizedText.includes(word)
        );

        const detectedMediumRiskKeywords = mediumRiskKeywords.filter((word) =>
        normalizedText.includes(word)
        );

        // 6. Assign score and severity
        let score = 3;
        let severity = "low";

        if (detectedHighRiskKeywords.length > 0) {
            score = 9;
            severity = "high";
            } else if (detectedMediumRiskKeywords.length > 0) {
                score = 6;
                severity = "medium";
        }

        // 7. Return analyzer result
        return jsonResponse(
            {
            score,
            severity,
            detected_keywords: [
            ...detectedHighRiskKeywords,
            ...detectedMediumRiskKeywords
            ],
            reason:
            score === 9
            ? "High-risk negative keyword detected"
            : score === 6
            ? "Medium-risk negative keyword detected"
            : "No relevant negative keyword detected"
            },
            200
            );
        } catch (error) {
        return jsonResponse(
            {
            error: "Internal server error",
            message: error.message
            },
            500
            );
            }
            }
        };

        function jsonResponse(data, status = 200) {
        return new Response(JSON.stringify(data), {
        status,
        headers: {
        "Content-Type": "application/json"
        }
        });
}   