// /api/convertkit-webhook.js

export const config = {
    api: {
      bodyParser: false,
    },
  };
  
  async function getRawBody(req) {
    return new Promise((resolve, reject) => {
      let data = "";
  
      req.on("data", (chunk) => {
        data += chunk;
      });
  
      req.on("end", () => {
        resolve(data);
      });
  
      req.on("error", (err) => {
        reject(err);
      });
    });
  }
  
  export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        message: "Method Not Allowed",
      });
    }
  
    try {
      // ==========================
      // PARSE KIT PAYLOAD
      // ==========================
  
      const rawBody = await getRawBody(req);
  
      console.log("RAW BODY:", rawBody);
  
      const body = JSON.parse(rawBody);
  
      console.log("PARSED BODY:", body);
  
      const subscriber = body?.subscribers?.[0];
  
      const email = subscriber?.email;
      const first_name = subscriber?.first_name || "";
  
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email missing",
          body,
        });
      }
  
      // ==========================
      // KARTRA REQUEST
      // ==========================
  
      const kartraParams = new URLSearchParams();
  
      kartraParams.append(
        "app_id",
        process.env.KARTRA_APP_ID
      );
  
      kartraParams.append(
        "api_key",
        process.env.KARTRA_API_KEY
      );
  
      kartraParams.append(
        "api_password",
        process.env.KARTRA_API_PASSWORD
      );
  
      kartraParams.append(
        "lead[email]",
        email
      );
  
      kartraParams.append(
        "lead[first_name]",
        first_name
      );
  
      kartraParams.append(
        "actions[0][cmd]",
        "create_lead"
      );
  
      kartraParams.append(
        "actions[1][cmd]",
        "assign_tag"
      );
  
      kartraParams.append(
        "actions[1][tag_name]",
        "Breakethrough movie LT subscribers"
      );
  
      const kartraResponse = await fetch(
        "https://app.kartra.com/api",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body: kartraParams.toString(),
        }
      );
  
      const kartraData =
        await kartraResponse.json();
  
      console.log(
        "KARTRA RESPONSE:",
        JSON.stringify(kartraData, null, 2)
      );
  
      // ==========================
      // GOOGLE SHEETS LOGGING
      // ==========================
  
      try {
        await fetch(
          "https://script.google.com/macros/s/AKfycbwacWTtPUUjoD5vYSpajuWG6jcHWWknAIVxAQMUI4breAFsnnvGnyo4eNvERVjU7wYe/exec",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              timestamp:
                new Date().toISOString(),
  
              email,
              first_name,
  
              kartraStatus:
                kartraData?.status || "",
  
              kartraResponse:
                kartraData,
  
              subscriber,
            }),
          }
        );
      } catch (sheetError) {
        console.error(
          "Google Sheet logging failed:",
          sheetError
        );
      }
  
      return res.status(200).json({
        success: true,
        email,
        first_name,
        kartraData,
      });
  
    } catch (error) {
  
      console.error(
        "WEBHOOK ERROR:",
        error
      );
  
      return res.status(500).json({
        success: false,
        error: error.message,
      });
  
    }
  }