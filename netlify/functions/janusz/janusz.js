const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  // Obsługa CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: "Method Not Allowed",
    };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1", {
      method: "POST",
      headers: {
        Authorization: `Bearer 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`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        options: { wait_for_model: true }
      }),
    });

    const data = await response.json();

    const reply = (Array.isArray(data) && data[0]?.generated_text)
      ? data[0].generated_text.split("Janusz:")[1]?.trim() || data[0].generated_text
      : data.generated_text || data.error || "Nieznana odpowiedź";

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Błąd serwera: " + err.message }),
    };
  }
};
