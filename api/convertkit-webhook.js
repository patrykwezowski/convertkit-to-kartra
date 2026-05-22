// /api/convertkit-webhook.js

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        message: "Method Not Allowed",
      });
    }
  
    try {
      // Debug object
      const debug = {
        receivedBody: req.body,
      };
  
      // Support multiple Kit payload formats
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
  
      // Validate email
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
          debug,
        });
      }
  
      // -----------------------------------
      // KARTRA PAYLOAD
      // -----------------------------------
  
      const params = new URLSearchParams();
  
      // Authentication
      params.append("app_id", process.env.KARTRA_APP_ID);

      params.append("api_key", process.env.KARTRA_API_KEY);
      
      params.append(
        "api_password",
        process.env.KARTRA_API_PASSWORD
      );
  
      // Lead data
      params.append("lead[email]", email);
  
      params.append(
        "lead[first_name]",
        first_name
      );
  
      // Action 1 → Assign tag
      params.append(
        "actions[0][cmd]",
        "assign_tag"
      );
  
      params.append(
        "actions[0][tag_name]",
        "member"
      );
  
      // Action 2 → Subscribe to membership
      params.append(
        "actions[1][cmd]",
        "subscribe_to_membership"
      );
  
      params.append(
        "actions[1][membership_id]",
        "12"
      );
  
      debug.kartraPayload = Object.fromEntries(
        params.entries()
      );
  
      // -----------------------------------
      // SEND TO KARTRA
      // -----------------------------------
  
      const kartraResponse = await fetch(
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
  
      // Kartra sometimes returns text instead of JSON
      let kartraData;
  
      try {
        kartraData = await kartraResponse.json();
      } catch {
        kartraData = await kartraResponse.text();
      }
  
      debug.kartraResponse = kartraData;
      debug.kartraStatus = kartraResponse.status;
  
      // -----------------------------------
      // RETURN RESPONSE
      // -----------------------------------
  
      return res.status(200).json({
        success: true,
        debug,
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
        stack: error.stack,
      });
    }
  }