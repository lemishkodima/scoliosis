const DEFAULT_GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwfJRkcoxqIVXbawOjT6iVvgOGgb3cnvv92q5aDtNAjt6ZdaNjH4mKMngGimqAa53Q8/exec";

function parseBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === "object") {
    return req.body;
  }

  try {
    return JSON.parse(req.body);
  } catch (_) {
    return {};
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
  }

  const requestSecret = process.env.REQUEST_SECRET;
  if (!requestSecret) {
    return res.status(500).json({
      ok: false,
      error: "Missing REQUEST_SECRET environment variable",
    });
  }

  const googleScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL || DEFAULT_GOOGLE_SCRIPT_URL;
  const payload = parseBody(req);

  try {
    const response = await fetch(googleScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        secret: requestSecret,
      }),
    });

    const responseText = await response.text();
    let responseData = null;

    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch (_) {
      responseData = { message: responseText };
    }

    if (!response.ok || responseData?.ok === false) {
      return res.status(502).json({
        ok: false,
        error: responseData?.error || responseData?.message || "Google Apps Script request failed",
      });
    }

    return res.status(200).json({
      ok: true,
      message: responseData?.message || "Lead submitted",
    });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      error: String(error && error.message ? error.message : error),
    });
  }
};
