"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Coffee, Gift, X } from "lucide-react"

interface PayPalSupportProps {
  onClose?: () => void
  showCloseButton?: boolean
}

export function PayPalSupport({ onClose, showCloseButton = false }: PayPalSupportProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")

  const predefinedAmounts = [3, 5, 10, 25]

  const handlePayPalDonation = (amount: number) => {
    // PayPal donation URL using your paypal.me link - opens in new tab to prevent navigation
    const paypalUrl = `https://paypal.me/kovaciclazar/${amount}`
    window.open(paypalUrl, "_blank", "noopener,noreferrer")
  }

  const handleCustomDonation = () => {
    const amount = Number.parseFloat(customAmount)
    if (amount && amount > 0) {
      // Open PayPal in new tab to prevent navigation
      const paypalUrl = `https://paypal.me/kovaciclazar/${amount}`
      window.open(paypalUrl, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-200 p-6 relative">
      {showCloseButton && onClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Heart className="h-6 w-6 text-red-500" />
          <h3 className="text-xl font-bold text-gray-800">Support the Creator</h3>
          <Heart className="h-6 w-6 text-red-500" />
        </div>

        <p className="text-gray-600 text-sm max-w-md mx-auto">
          Love this tool? Help keep it running and ad-free! Your support helps maintain the servers and develop new
          features.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {predefinedAmounts.map((amount) => (
              <Button
                key={amount}
                variant={selectedAmount === amount ? "default" : "outline"}
                onClick={() => {
                  setSelectedAmount(amount)
                  handlePayPalDonation(amount)
                }}
                className="flex items-center justify-center space-x-1 text-sm"
              >
                <Coffee className="h-4 w-4" />
                <span>${amount}</span>
              </Button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Custom amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              min="1"
              step="0.01"
            />
            <Button
              onClick={handleCustomDonation}
              disabled={!customAmount || Number.parseFloat(customAmount) <= 0}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm"
            >
              <Gift className="h-4 w-4 mr-1" />
              Donate
            </Button>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Secure payment via PayPal</p>
            <p>• No account required</p>
            <p>• 100% goes to development</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
