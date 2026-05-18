export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        message: "Method Not Allowed",
      });
    }
  
    try {
      const { email, first_name, fields = {}, tags = [] } = req.body;
  
      // Validate required fields
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }
  
      // Prepare Kartra payload
      const kartraPayload = {
        api_key: process.env.KARTRA_API_KEY,
        api_password: process.env.KARTRA_API_PASSWORD,
        lead: {
          email,
          first_name: first_name || "",
        },
        actions: {
          assign_tag: "member",
          subscribe_to_membership: "YOUR_MEMBERSHIP_ID",
        },
      };
  
      console.log("Sending lead to Kartra:", {
        email,
        first_name,
      });
  
      // Send request to Kartra
      const kartraResponse = await fetch("https://app.kartra.com/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(kartraPayload),
      });
  
      const kartraData = await kartraResponse.json();
  
      // Handle Kartra API errors
      if (!kartraResponse.ok) {
        console.error("Kartra API Error:", kartraData);
  
        return res.status(500).json({
          success: false,
          message: "Failed to send data to Kartra",
          error: kartraData,
        });
      }
  
      console.log("Kartra Success:", kartraData);
  
      return res.status(200).json({
        success: true,
        message: "Lead processed successfully",
      });
    } catch (error) {
      console.error("Webhook Error:", error);
  
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }