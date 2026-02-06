const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { sessionId } = JSON.parse(event.body);

    if (!sessionId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ paid: false, error: "Missing sessionId" }),
      };
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      return {
        statusCode: 200,
        body: JSON.stringify({
          paid: true,
          stripe_session_id: session.id,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ paid: false }),
    };

  } catch (err) {
    console.error("Stripe verify error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ paid: false, error: "Server error" }),
    };
  }
};
