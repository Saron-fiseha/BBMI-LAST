// // import crypto from "crypto"

// // // Telebirr API Configuration
// // const TELEBIRR_CONFIG = {
// //   baseUrl: process.env.TELEBIRR_BASE_URL || "https://api.telebirr.com",
// //   merchantId: process.env.TELEBIRR_MERCHANT_ID || "",
// //   apiKey: process.env.TELEBIRR_API_KEY || "",
// //   apiSecret: process.env.TELEBIRR_API_SECRET || "",
// //   callbackUrl: process.env.NEXT_PUBLIC_APP_URL + "/api/payments/telebirr/callback",
// //   returnUrl: process.env.NEXT_PUBLIC_APP_URL + "/courses/payment/success",
// //   cancelUrl: process.env.NEXT_PUBLIC_APP_URL + "/courses/payment/cancel",
// // }

// // export interface TelebirrPaymentRequest {
// //   amount: number
// //   currency: string
// //   orderId: string
// //   description: string
// //   customerName: string
// //   customerEmail: string
// //   customerPhone?: string
// // }

// // export interface TelebirrPaymentResponse {
// //   success: boolean
// //   transactionId?: string
// //   referenceNumber?: string
// //   paymentUrl?: string
// //   message?: string
// //   error?: string
// // }

// // export interface TelebirrCallbackData {
// //   transactionId: string
// //   referenceNumber: string
// //   status: "SUCCESS" | "FAILED" | "CANCELLED"
// //   amount: number
// //   currency: string
// //   orderId: string
// //   signature: string
// // }

// // class TelebirrService {
// //   private generateSignature(data: Record<string, any>): string {
// //     // Sort the data keys alphabetically
// //     const sortedKeys = Object.keys(data).sort()

// //     // Create the string to sign
// //     const stringToSign = sortedKeys.map((key) => `${key}=${data[key]}`).join("&") + `&key=${TELEBIRR_CONFIG.apiSecret}`

// //     // Generate HMAC-SHA256 signature
// //     return crypto.createHmac("sha256", TELEBIRR_CONFIG.apiSecret).update(stringToSign).digest("hex").toUpperCase()
// //   }

// //   private async makeRequest(endpoint: string, data: any): Promise<any> {
// //     const url = `${TELEBIRR_CONFIG.baseUrl}${endpoint}`

// //     try {
// //       const response = await fetch(url, {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${TELEBIRR_CONFIG.apiKey}`,
// //           "X-Merchant-ID": TELEBIRR_CONFIG.merchantId,
// //         },
// //         body: JSON.stringify(data),
// //       })

// //       if (!response.ok) {
// //         throw new Error(`HTTP error! status: ${response.status}`)
// //       }

// //       return await response.json()
// //     } catch (error) {
// //       console.error("Telebirr API request failed:", error)
// //       throw error
// //     }
// //   }

// //   async initiatePayment(paymentRequest: TelebirrPaymentRequest): Promise<TelebirrPaymentResponse> {
// //     try {
// //       // Prepare payment data
// //       const paymentData = {
// //         merchantId: TELEBIRR_CONFIG.merchantId,
// //         orderId: paymentRequest.orderId,
// //         amount: paymentRequest.amount.toFixed(2),
// //         currency: paymentRequest.currency,
// //         description: paymentRequest.description,
// //         customerName: paymentRequest.customerName,
// //         customerEmail: paymentRequest.customerEmail,
// //         customerPhone: paymentRequest.customerPhone || "",
// //         callbackUrl: TELEBIRR_CONFIG.callbackUrl,
// //         returnUrl: TELEBIRR_CONFIG.returnUrl,
// //         cancelUrl: TELEBIRR_CONFIG.cancelUrl,
// //         timestamp: Date.now().toString(),
// //       }

// //       // Generate signature
// //       paymentData.signature = this.generateSignature(paymentData)

// //       // Make API request
// //       const response = await this.makeRequest("/payment/initiate", paymentData)

// //       if (response.success) {
// //         return {
// //           success: true,
// //           transactionId: response.transactionId,
// //           referenceNumber: response.referenceNumber,
// //           paymentUrl: response.paymentUrl,
// //           message: response.message,
// //         }
// //       } else {
// //         return {
// //           success: false,
// //           error: response.message || "Payment initiation failed",
// //         }
// //       }
// //     } catch (error) {
// //       console.error("Error initiating Telebirr payment:", error)
// //       return {
// //         success: false,
// //         error: error instanceof Error ? error.message : "Unknown error occurred",
// //       }
// //     }
// //   }

// //   async verifyPayment(transactionId: string): Promise<TelebirrPaymentResponse> {
// //     try {
// //       const verificationData = {
// //         merchantId: TELEBIRR_CONFIG.merchantId,
// //         transactionId,
// //         timestamp: Date.now().toString(),
// //       }

// //       // Generate signature
// //       verificationData.signature = this.generateSignature(verificationData)

// //       // Make API request
// //       const response = await this.makeRequest("/payment/verify", verificationData)

// //       return {
// //         success: response.success,
// //         transactionId: response.transactionId,
// //         referenceNumber: response.referenceNumber,
// //         message: response.message,
// //         error: response.success ? undefined : response.message,
// //       }
// //     } catch (error) {
// //       console.error("Error verifying Telebirr payment:", error)
// //       return {
// //         success: false,
// //         error: error instanceof Error ? error.message : "Verification failed",
// //       }
// //     }
// //   }

// //   verifyCallback(callbackData: TelebirrCallbackData): boolean {
// //     try {
// //       // Prepare data for signature verification (exclude signature)
// //       const { signature, ...dataToVerify } = callbackData

// //       // Generate expected signature
// //       const expectedSignature = this.generateSignature(dataToVerify)

// //       // Compare signatures
// //       return signature === expectedSignature
// //     } catch (error) {
// //       console.error("Error verifying callback signature:", error)
// //       return false
// //     }
// //   }

// //   async refundPayment(transactionId: string, amount: number, reason: string): Promise<TelebirrPaymentResponse> {
// //     try {
// //       const refundData = {
// //         merchantId: TELEBIRR_CONFIG.merchantId,
// //         transactionId,
// //         amount: amount.toFixed(2),
// //         reason,
// //         timestamp: Date.now().toString(),
// //       }

// //       // Generate signature
// //       refundData.signature = this.generateSignature(refundData)

// //       // Make API request
// //       const response = await this.makeRequest("/payment/refund", refundData)

// //       return {
// //         success: response.success,
// //         transactionId: response.refundTransactionId,
// //         message: response.message,
// //         error: response.success ? undefined : response.message,
// //       }
// //     } catch (error) {
// //       console.error("Error processing Telebirr refund:", error)
// //       return {
// //         success: false,
// //         error: error instanceof Error ? error.message : "Refund failed",
// //       }
// //     }
// //   }
// // }

// // export const telebirrService = new TelebirrService()

// // // Helper function to generate unique order ID
// // export function generateOrderId(userId: number, trainingId: number): string {
// //   const timestamp = Date.now()
// //   return `ORD-${userId}-${trainingId}-${timestamp}`
// // }

// // // Helper function to format amount for Telebirr (ETB)
// // export function formatAmountForTelebirr(amount: number): number {
// //   return Math.round(amount * 100) / 100 // Round to 2 decimal places
// // }
// import crypto from "crypto"

// // Telebirr API Configuration
// const TELEBIRR_CONFIG = {
//   baseUrl: process.env.TELEBIRR_BASE_URL || "https://api.telebirr.com",
//   merchantId: process.env.TELEBIRR_MERCHANT_ID || "",
//   apiKey: process.env.TELEBIRR_API_KEY || "",
//   apiSecret: process.env.TELEBIRR_API_SECRET || "",
//   callbackUrl: process.env.NEXT_PUBLIC_APP_URL + "/api/payments/telebirr/callback",
//   returnUrl: process.env.NEXT_PUBLIC_APP_URL + "/courses/payment/success",
//   cancelUrl: process.env.NEXT_PUBLIC_APP_URL + "/courses/payment/cancel",
// }

// export interface TelebirrPaymentRequest {
//   amount: number
//   currency: string
//   orderId: string
//   description: string
//   customerName: string
//   customerEmail: string
//   customerPhone?: string
// }

// export interface TelebirrPaymentResponse {
//   success: boolean
//   transactionId?: string
//   referenceNumber?: string
//   paymentUrl?: string
//   message?: string
//   error?: string
// }

// export interface TelebirrCallbackData {
//   transactionId: string
//   referenceNumber: string
//   status: "SUCCESS" | "FAILED" | "CANCELLED"
//   amount: number
//   currency: string
//   orderId: string
//   signature: string
// }

// class TelebirrService {
//   private generateSignature(data: Record<string, any>): string {
//     // Sort keys alphabetically
//     const sortedKeys = Object.keys(data).sort()
//     const stringToSign = sortedKeys.map((key) => `${key}=${data[key]}`).join("&") + `&key=${TELEBIRR_CONFIG.apiSecret}`

//     return crypto
//       .createHmac("sha256", TELEBIRR_CONFIG.apiSecret)
//       .update(stringToSign)
//       .digest("hex")
//       .toUpperCase()
//   }

//   private async makeRequest(endpoint: string, data: any): Promise<any> {
//     const url = `${TELEBIRR_CONFIG.baseUrl}${endpoint}`

//     try {
//       const response = await fetch(url, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${TELEBIRR_CONFIG.apiKey}`,
//           "X-Merchant-ID": TELEBIRR_CONFIG.merchantId,
//         },
//         body: JSON.stringify(data),
//       })

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }

//       return await response.json()
//     } catch (error) {
//       console.error("Telebirr API request failed:", error)
//       throw error
//     }
//   }

//   async initiatePayment(paymentRequest: TelebirrPaymentRequest): Promise<TelebirrPaymentResponse> {
//     try {
//       // Prepare payment data
//       const paymentData = {
//         merchantId: TELEBIRR_CONFIG.merchantId,
//         orderId: paymentRequest.orderId,
//         amount: paymentRequest.amount.toFixed(2),
//         currency: paymentRequest.currency,
//         description: paymentRequest.description,
//         customerName: paymentRequest.customerName,
//         customerEmail: paymentRequest.customerEmail,
//         customerPhone: paymentRequest.customerPhone || "",
//         callbackUrl: TELEBIRR_CONFIG.callbackUrl,
//         returnUrl: TELEBIRR_CONFIG.returnUrl,
//         cancelUrl: TELEBIRR_CONFIG.cancelUrl,
//         timestamp: Date.now().toString(),
//       }

//       // Create signed payload (no mutation)
//       const signedPaymentData = {
//         ...paymentData,
//         signature: this.generateSignature(paymentData),
//       }

//       // Make API request
//       const response = await this.makeRequest("/payment/initiate", signedPaymentData)

//       if (response.success) {
//         return {
//           success: true,
//           transactionId: response.transactionId,
//           referenceNumber: response.referenceNumber,
//           paymentUrl: response.paymentUrl,
//           message: response.message,
//         }
//       } else {
//         return {
//           success: false,
//           error: response.message || "Payment initiation failed",
//         }
//       }
//     } catch (error) {
//       console.error("Error initiating Telebirr payment:", error)
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : "Unknown error occurred",
//       }
//     }
//   }

//   async verifyPayment(transactionId: string): Promise<TelebirrPaymentResponse> {
//     try {
//       const verificationData = {
//         merchantId: TELEBIRR_CONFIG.merchantId,
//         transactionId,
//         timestamp: Date.now().toString(),
//       }

//       const signedVerificationData = {
//         ...verificationData,
//         signature: this.generateSignature(verificationData),
//       }

//       const response = await this.makeRequest("/payment/verify", signedVerificationData)

//       return {
//         success: response.success,
//         transactionId: response.transactionId,
//         referenceNumber: response.referenceNumber,
//         message: response.message,
//         error: response.success ? undefined : response.message,
//       }
//     } catch (error) {
//       console.error("Error verifying Telebirr payment:", error)
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : "Verification failed",
//       }
//     }
//   }

//   verifyCallback(callbackData: TelebirrCallbackData): boolean {
//     try {
//       const { signature, ...dataToVerify } = callbackData
//       const expectedSignature = this.generateSignature(dataToVerify)
//       return signature === expectedSignature
//     } catch (error) {
//       console.error("Error verifying callback signature:", error)
//       return false
//     }
//   }

//   async refundPayment(transactionId: string, amount: number, reason: string): Promise<TelebirrPaymentResponse> {
//     try {
//       const refundData = {
//         merchantId: TELEBIRR_CONFIG.merchantId,
//         transactionId,
//         amount: amount.toFixed(2),
//         reason,
//         timestamp: Date.now().toString(),
//       }

//       const signedRefundData = {
//         ...refundData,
//         signature: this.generateSignature(refundData),
//       }

//       const response = await this.makeRequest("/payment/refund", signedRefundData)

//       return {
//         success: response.success,
//         transactionId: response.refundTransactionId,
//         message: response.message,
//         error: response.success ? undefined : response.message,
//       }
//     } catch (error) {
//       console.error("Error processing Telebirr refund:", error)
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : "Refund failed",
//       }
//     }
//   }
// }

// export const telebirrService = new TelebirrService()

// export function generateOrderId(userId: number, trainingId: number): string {
//   const timestamp = Date.now()
//   return `ORD-${userId}-${trainingId}-${timestamp}`
// }

// export function formatAmountForTelebirr(amount: number): number {
//   return Math.round(amount * 100) / 100
// }

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
