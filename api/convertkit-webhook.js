export default async function handler(req, res) {
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
  
      if (!email) {
        debug.error = "Missing email";
  
        return res.status(400).json(debug);
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
  
      debug.kartraPayload = kartraPayload;
  
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
  
      let kartraData;
  
      try {
        kartraData = await kartraResponse.json();
      } catch {
        kartraData = await kartraResponse.text();
      }
  
      debug.kartraResponse = kartraData;
      debug.kartraStatus = kartraResponse.status;
  
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