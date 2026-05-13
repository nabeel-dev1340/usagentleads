interface CreateCheckoutParams {
  variantId: string
  customData: Record<string, string>
}

export async function createCheckout({
  variantId,
  customData,
}: CreateCheckoutParams): Promise<string> {
  const isSubscription = customData.purchase_type === "subscription" || customData.purchase_type === "subscription_api"
  const pageToken = customData.page_token || ""
  // Validate page_token is a clean UUID to prevent URL injection
  const safePageToken = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pageToken)
    ? pageToken
    : ""
  const redirectUrl = isSubscription
    ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    : `${process.env.NEXT_PUBLIC_APP_URL}/purchase-success${safePageToken ? `?pt=${safePageToken}` : ""}`
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
          // No free trial — subscriptions are charged immediately. Setting
          // trial_ends_at to now overrides any trial configured on the variant.
          ...(isSubscription ? { trial_ends_at: new Date().toISOString() } : {}),
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
    const errorBody = await response.text()
    console.error("Lemon Squeezy error body:", errorBody)
    throw new Error(`Lemon Squeezy checkout creation failed: ${response.status} - ${errorBody}`)
  }

  const json = await response.json()
  return json.data.attributes.url as string
}
