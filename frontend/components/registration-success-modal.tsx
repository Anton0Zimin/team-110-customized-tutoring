"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight } from "lucide-react"

interface RegistrationSuccessModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RegistrationSuccessModal({ isOpen, onClose }: RegistrationSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <DialogTitle className="text-2xl font-serif font-bold text-[#8B1538]">
            Registration Successful!
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <p className="text-gray-600 font-serif">
            Thank you for registering with Owl & Lion Access. Your information has been successfully submitted and you'll be matched with a suitable tutor soon.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-serif font-semibold text-green-800 mb-2">What's Next?</h4>
            <ul className="text-sm text-green-700 font-serif space-y-1 text-left">
              <li>• We'll review your learning preferences</li>
              <li>• Match you with an appropriate tutor</li>
              <li>• Send you a welcome email with next steps</li>
              <li>• Schedule your first tutoring session</li>
            </ul>
          </div>
          
          <Button 
            onClick={onClose}
            className="bg-[#8B1538] hover:bg-[#7A1230] text-white font-serif px-6 py-2"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 