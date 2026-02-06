const Stripe = require('stripe');

exports.handler = async (event) => {
  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

    const body = JSON.parse(event.body);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Event Rental',
            },
            unit_amount: body.amount, // cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        order_id: body.order_id,
      },
		success_url: `${body.origin}/thank-you2.html?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${body.origin}/checkout-place-order.html`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
