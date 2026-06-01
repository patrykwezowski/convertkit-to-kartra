// /api/convertkit-webhook.js

export const config = {
    api: {
      bodyParser: false,
    },
  };
  
  async function getRawBody(req) {
    return new Promise((resolve, reject) => {
      let data = "";
  
      req.on("data", chunk => {
        data += chunk;
      });
  
      req.on("end", () => {
        resolve(data);
      });
  
      req.on("error", err => {
        reject(err);
      });
    });
  }
  
  export default async function handler(req, res) {
  
    // ===================================
    // ALLOW ONLY POST
    // ===================================
  
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        message: "Method Not Allowed",
      });
    }
  
    try {
  
      // ===================================
      // GET RAW BODY
      // ===================================
  
      const rawBody = await getRawBody(req);
  
      console.log("RAW BODY:", rawBody);
  
      const body = JSON.parse(rawBody);
  
      console.log("PARSED BODY:", body);
  
      // ===================================
      // EXTRACT DATA
      // ===================================
  
// ===================================
// EXTRACT KIT DATA
// ===================================

// ===================================
// EXTRACT KIT DATA
// ===================================

const subscriber =
  body?.subscribers?.[0];

const email =
  subscriber?.email;

const first_name =
  subscriber?.first_name || "";
  
      // ===================================
      // VALIDATE
      // ===================================
  
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email missing",
          body,
        });
      }
  
      // ===================================
      // KARTRA REQUEST
      // ===================================
  
      const kartraParams =
        new URLSearchParams();
  
      // AUTH
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
  
      // LEAD
      kartraParams.append(
        "lead[email]",
        email
      );
  
      kartraParams.append(
        "lead[first_name]",
        first_name
      );
  
      // ACTION 1
      kartraParams.append(
        "actions[0][cmd]",
        "create_lead"
      );
  
      // ACTION 2
      kartraParams.append(
        "actions[1][cmd]",
        "assign_tag"
      );
  
      kartraParams.append(
        "actions[1][tag_name]",
        "Breaketrough move manual API automation"
      );
  
      // SEND TO KARTRA
      const kartraResponse =
        await fetch(
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
        kartraData
      );
  
      return res.status(200).json({
        success: true,
        body,
        kartraData,
      });
  
    } catch (error) {
  
      console.error(error);
  
      return res.status(500).json({
        success: false,
        error: error.message,
      });
  
    }
  }