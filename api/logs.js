import fs from "fs";

const LOG_FILE = "/tmp/webhook.log";

export default async function handler(req, res) {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return res.status(200).send("No logs yet.");
    }

    const logs = fs.readFileSync(LOG_FILE, "utf8");

    res.setHeader("Content-Type", "text/plain");
    return res.status(200).send(logs);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}