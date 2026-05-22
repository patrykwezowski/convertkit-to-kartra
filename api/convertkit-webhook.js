// /api/convertkit-webhook.js

export default async function handler(req, res) {

    // ONLY ALLOW POST
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        message: "Method Not Allowed",
      });
    }
  
    try {
  
      const debug = {
        receivedBody: req.body,
      };
  
      // SUPPORT KIT PAYLOADS
      const email =
        req.body.email ||
        req.body.subscriber?.email_address;
  
      const first_name =
        req.body.first_name ||
        req.body.subscriber?.first_name ||
        "";
  
      debug.parsedData = {
        email,
        first_name,
      };
  
      // VALIDATE EMAIL
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
          debug,
        });
      }
  
      // ===================================
      // SINGLE KARTRA REQUEST
      // ===================================
  
      const params =
        new URLSearchParams();
  
      // AUTH
      params.append(
        "app_id",
        process.env.KARTRA_APP_ID
      );
  
      params.append(
        "api_key",
        process.env.KARTRA_API_KEY
      );
  
      params.append(
        "api_password",
        process.env.KARTRA_API_PASSWORD
      );
  
      // LEAD DATA
      params.append(
        "lead[email]",
        email
      );
  
      params.append(
        "lead[first_name]",
        first_name
      );
  
      // ACTION 1 — CREATE LEAD
      params.append(
        "actions[0][cmd]",
        "create_lead"
      );
  
      // ACTION 2 — ASSIGN TAG
      params.append(
        "actions[1][cmd]",
        "assign_tag"
      );
  
      params.append(
        "actions[1][tag_name]",
        "Breaketrough move manual API automation"
      );
  
      debug.payload =
        Object.fromEntries(
          params.entries()
        );
  
      // SEND REQUEST
      const kartraResponse =
        await fetch(
          "https://app.kartra.com/api",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded",
            },
            body: params.toString(),
          }
        );
  
      let kartraData;
  
      try {
        kartraData =
          await kartraResponse.json();
      } catch {
        kartraData =
          await kartraResponse.text();
      }
  
      debug.kartraResponse =
        kartraData;
  
      debug.kartraStatus =
        kartraResponse.status;
  
      // SUCCESS
      return res.status(200).json({
        success: true,
        debug,
      });
  
    } catch (error) {
  
      return res.status(500).json({
        success: false,
        error: error.message,
        stack: error.stack,
      });
  
    }
  }