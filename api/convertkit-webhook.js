// /api/convertkit-webhook.js

export default async function handler(req, res) {
    // -----------------------------------
    // ONLY ALLOW POST
    // -----------------------------------
  
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        message: "Method Not Allowed",
      });
    }
  
    try {
      // -----------------------------------
      // DEBUG OBJECT
      // -----------------------------------
  
      const debug = {
        receivedBody: req.body,
      };
  
      // -----------------------------------
      // SUPPORT MULTIPLE KIT PAYLOADS
      // -----------------------------------
  
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
  
      // -----------------------------------
      // VALIDATE EMAIL
      // -----------------------------------
  
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
          debug,
        });
      }
  
 // ===================================
// STEP 1 — CREATE / UPDATE LEAD
// ===================================

const createLeadParams =
new URLSearchParams();

createLeadParams.append(
"app_id",
process.env.KARTRA_APP_ID
);

createLeadParams.append(
"api_key",
process.env.KARTRA_API_KEY
);

createLeadParams.append(
"api_password",
process.env.KARTRA_API_PASSWORD
);

// Lead MUST be array/object structure
createLeadParams.append(
"lead[email]",
email
);

createLeadParams.append(
"lead[first_name]",
first_name
);

// Create lead command
createLeadParams.append(
"actions[0][cmd]",
"create_lead"
);

debug.createLeadPayload =
Object.fromEntries(
  createLeadParams.entries()
);

const createLeadResponse =
await fetch(
  "https://app.kartra.com/api",
  {
    method: "POST",
    headers: {
      "Content-Type":
        "application/x-www-form-urlencoded",
    },
    body: createLeadParams.toString(),
  }
);

let createLeadData;

try {
createLeadData =
  await createLeadResponse.json();
} catch {
createLeadData =
  await createLeadResponse.text();
}

debug.createLeadResponse =
createLeadData;
  
      // ===================================
      // STEP 2 — ASSIGN TAG + MEMBERSHIP
      // ===================================
  
      const actionParams =
        new URLSearchParams();
  
      actionParams.append(
        "app_id",
        process.env.KARTRA_APP_ID
      );
  
      actionParams.append(
        "api_key",
        process.env.KARTRA_API_KEY
      );
  
      actionParams.append(
        "api_password",
        process.env.KARTRA_API_PASSWORD
      );
  
      actionParams.append(
        "lead[email]",
        email
      );
  
      // -----------------------------------
      // ASSIGN TAG
      // -----------------------------------
  
      actionParams.append(
        "actions[0][cmd]",
        "assign_tag"
      );
  
      actionParams.append(
        "actions[0][tag_name]",
        "member"
      );
  
      // -----------------------------------
      // SUBSCRIBE TO MEMBERSHIP
      // -----------------------------------
  
      actionParams.append(
        "actions[1][cmd]",
        "subscribe_to_membership"
      );
  
      actionParams.append(
        "actions[1][membership_id]",
        "12"
      );
  
      debug.actionPayload =
        Object.fromEntries(
          actionParams.entries()
        );
  
      const kartraResponse =
        await fetch(
          "https://app.kartra.com/api",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded",
            },
            body: actionParams.toString(),
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
  
      // ===================================
      // SUCCESS RESPONSE
      // ===================================
  
      return res.status(200).json({
        success: true,
        debug,
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Internal Server Error",
        error: error.message,
        stack: error.stack,
      });
    }
  }