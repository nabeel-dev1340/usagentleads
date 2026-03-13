interface CreateCheckoutParams {
  variantId: string
  customData: Record<string, string>
}

export async function createCheckout({
  variantId,
  customData,
}: CreateCheckoutParams): Promise<string> {
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
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/purchase-success`,
            receipt_thank_you_note:
              "Your download link is being sent to your email.",
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
