interface CreateCheckoutParams {
  variantId: string
  customData: Record<string, string>
}

export async function createCheckout({
  variantId,
  customData,
}: CreateCheckoutParams): Promise<string> {
  const isSubscription = customData.purchase_type === "subscription"
  const redirectUrl = isSubscription
    ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    : `${process.env.NEXT_PUBLIC_APP_URL}/purchase-success`
  const thankYouNote = isSubscription
    ? "Your subscription is now active. Head to the dashboard to get started."
    : "Your download link is being sent to your email."

  const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          custom_price: null,
          product_options: {
            redirect_url: redirectUrl,
            receipt_thank_you_note: thankYouNote,
          },
          checkout_options: {
            embed: false,
            media: false,
            logo: true,
          },
          checkout_data: {
            custom: customData,
          },
          expires_at: null,
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: process.env.LEMONSQUEEZY_STORE_ID,
            },
          },
          variant: {
            data: { type: "variants", id: variantId },
          },
        },
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Lemon Squeezy checkout creation failed: ${response.status}`)
  }

  const json = await response.json()
  return json.data.attributes.url as string
}
