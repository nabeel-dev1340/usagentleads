export interface Agent {
  id: string
  name: string
  email: string | null
  phone: string | null
  state: string
}

export interface Purchase {
  id: string
  user_id: string | null
  guest_email: string | null
  purchase_type: "state" | "full_database" | "subscription"
  state_code: string | null
  lemon_squeezy_order_id: string | null
  lemon_squeezy_customer_id: string | null
  amount_paid: number
  status: "pending" | "completed" | "failed" | "refunded"
  download_token: string
  token_used: boolean
  expires_at: string | null
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  lemon_squeezy_subscription_id: string
  lemon_squeezy_customer_id: string | null
  status: "active" | "paused" | "cancelled" | "expired" | "on_trial"
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export interface DownloadLog {
  id: string
  user_id: string | null
  guest_email: string | null
  download_type: string
  state_code: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface USState {
  code: string
  name: string
  slug: string
  agentCount: number
}

export interface AgentsApiResponse {
  data: Agent[]
  count: number
  page: number
  totalPages: number
}
