import fs from "fs";
import path from "path";

const LOG_FILE = "/tmp/webhook.log";

function writeLog(message, data = null) {
  const timestamp = new Date().toISOString();

  const logEntry = `
[${timestamp}]
${message}
${data ? JSON.stringify(data, null, 2) : ""}
-----------------------------------
`;

  fs.appendFileSync(LOG_FILE, logEntry);
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    writeLog("Invalid request method", {
      method: req.method,
    });

    return res.status(405).json({
      success: false,
      message: "Method Not Allowed",
    });
  }

  try {
    writeLog("Webhook received", req.body);

    // Support multiple Kit payload formats
    const email =
      req.body.email ||
      req.body.subscriber?.email_address;

    const first_name =
      req.body.first_name ||
      req.body.subscriber?.first_name ||
      "";

    if (!email) {
      writeLog("Missing email", req.body);

      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const kartraPayload = {
      api_key: process.env.KARTRA_API_KEY,
      api_password: process.env.KARTRA_API_PASSWORD,
      lead: {
        email,
        first_name,
      },
      actions: {
        assign_tag: "member",
        subscribe_to_membership: "12",
      },
    };

    writeLog("Sending to Kartra", kartraPayload);

    const kartraResponse = await fetch(
      "https://app.kartra.com/api",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(kartraPayload),
      }
    );

    const kartraData = await kartraResponse.json();

    writeLog("Kartra response", kartraData);

    if (!kartraResponse.ok) {
      writeLog("Kartra API error", kartraData);

      return res.status(500).json({
        success: false,
        message: "Kartra API failed",
      });
    }

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    writeLog("Webhook exception", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}