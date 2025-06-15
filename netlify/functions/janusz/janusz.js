const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const now = new Date().toISOString();
  console.log("Wersja funkcji Janusz v4 – logowanie odpowiedzi: " + now);

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

    const response = await fetch("https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta", {
      method: "POST",
      headers: {
        Authorization: "Bearer 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",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        options: { wait_for_model: true }
      }),
    });

    let data = {};
    const raw = await response.text();
    console.log("RAW RESPONSE:", raw);
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.log("Błąd JSON.parse:", e.message);
      data = { error: "Nieprawidłowy JSON z Hugging Face" };
    }

    const reply = (Array.isArray(data) && data[0]?.generated_text)
      ? data[0].generated_text
      : data.generated_text || data.error || "To na pewno robota kotów szpiegów z kosmosu.";

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
