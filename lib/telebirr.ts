import { envConfig } from "./env-config"

interface TelebirrPaymentRequest {
  amount: number
  currency: string
  orderId: string
  description: string
  customerName: string
  customerEmail: string
  customerPhone: string
}

interface TelebirrPaymentResponse {
  success: boolean
  transactionId?: string
  referenceNumber?: string
  paymentUrl?: string
  error?: string
}

export interface TelebirrCallbackData {
  transactionId: string
  referenceNumber: string
  status: "SUCCESS" | "FAILED" | "CANCELLED"
  amount: number
  currency: string
  orderId: string
  timestamp: string
  signature: string
}

class TelebirrService {
  private baseUrl: string
  private merchantId: string
  private apiKey: string
  private apiSecret: string

  constructor() {
    this.baseUrl = envConfig.TELEBIRR_BASE_URL
    this.merchantId = envConfig.TELEBIRR_MERCHANT_ID
    this.apiKey = envConfig.TELEBIRR_API_KEY
    this.apiSecret = envConfig.TELEBIRR_API_SECRET
  }

  private generateSignature(data: Record<string, any>): string {
    // Sort the data keys alphabetically
    const sortedKeys = Object.keys(data).sort()

    // Create the string to sign
    const stringToSign = sortedKeys.map((key) => `${key}=${data[key]}`).join("&") + `&key=${this.apiSecret}`

    // Generate HMAC-SHA256 signature
    const crypto = require("crypto")
    return crypto.createHmac("sha256", this.apiSecret).update(stringToSign).digest("hex").toUpperCase()
  }

  private async makeRequest(endpoint: string, data: Record<string, any>): Promise<any> {
    try {
      const signature = this.generateSignature(data)
      const requestData = {
        ...data,
        merchantId: this.merchantId,
        signature,
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "X-Merchant-ID": this.merchantId,
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Telebirr API request failed:", error)
      throw error
    }
  }

  async initiatePayment(request: TelebirrPaymentRequest): Promise<TelebirrPaymentResponse> {
    try {
      const paymentData = {
        amount: request.amount,
        currency: request.currency,
        orderId: request.orderId,
        description: request.description,
        customerName: request.customerName,
        customerEmail: request.customerEmail,
        customerPhone: request.customerPhone,
        callbackUrl: `${envConfig.NEXT_PUBLIC_APP_URL}/api/payments/telebirr/callback`,
        returnUrl: `${envConfig.NEXT_PUBLIC_APP_URL}/courses/payment/success`,
        cancelUrl: `${envConfig.NEXT_PUBLIC_APP_URL}/courses/payment/cancelled`,
        timestamp: new Date().toISOString(),
      }

      const response = await this.makeRequest("/payment/initiate", paymentData)

      if (response.success) {
        return {
          success: true,
          transactionId: response.transactionId,
          referenceNumber: response.referenceNumber,
          paymentUrl: response.paymentUrl,
        }
      } else {
        return {
          success: false,
          error: response.message || "Payment initiation failed",
        }
      }
    } catch (error) {
      console.error("Payment initiation error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  async verifyPayment(transactionId: string): Promise<{
    success: boolean
    status: string
    amount?: number
    currency?: string
    orderId?: string
    error?: string
  }> {
    try {
      const verificationData = {
        transactionId,
        timestamp: new Date().toISOString(),
      }

      const response = await this.makeRequest("/payment/verify", verificationData)

      return {
        success: response.success,
        status: response.status,
        amount: response.amount,
        currency: response.currency,
        orderId: response.orderId,
        error: response.success ? undefined : response.message,
      }
    } catch (error) {
      console.error("Payment verification error:", error)
      return {
        success: false,
        status: "failed",
        error: error instanceof Error ? error.message : "Verification failed",
      }
    }
  }

  verifyCallback(callbackData: TelebirrCallbackData): boolean {
    try {
      const dataToVerify = {
        transactionId: callbackData.transactionId,
        referenceNumber: callbackData.referenceNumber,
        status: callbackData.status,
        amount: callbackData.amount,
        currency: callbackData.currency,
        orderId: callbackData.orderId,
        timestamp: callbackData.timestamp,
      }

      const expectedSignature = this.generateSignature(dataToVerify)
      return expectedSignature === callbackData.signature
    } catch (error) {
      console.error("Callback verification error:", error)
      return false
    }
  }
}

// Utility functions
export function generateOrderId(userId: string, trainingId: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `ORD_${userId.substring(0, 8)}_${trainingId.substring(0, 8)}_${timestamp}_${random}`.toUpperCase()
}

export function formatAmountForTelebirr(amount: number): number {
  // Telebirr expects amounts in cents/smallest currency unit
  return Math.round(amount * 100)
}

export const telebirrService = new TelebirrService()
