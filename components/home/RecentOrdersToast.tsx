import { getRecentPurchases } from "@/lib/supabase/server"
import { RecentOrdersToastClient } from "./RecentOrdersToastClient"

/**
 * Server wrapper: fetches the privacy-safe recent orders and hands them to the
 * client toast. Only masked fields (RecentOrder) cross to the client — never raw rows.
 */
export async function RecentOrdersToast() {
  const orders = await getRecentPurchases(8)
  if (orders.length === 0) return null
  return <RecentOrdersToastClient orders={orders} />
}
