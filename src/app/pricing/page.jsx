import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Info } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            We believe in clear pricing. No surprises, no hidden fees. You only pay when you sell tickets.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <Card className="border border-gray-800 bg-[#0A0A0A]">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Free Events</CardTitle>
              <CardDescription className="text-base text-gray-500">Perfect for community gatherings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold mb-4 text-white">₦0</div>
              <p className="text-gray-400 mb-6">
                Organize free events without any charges. We don't charge you, and your attendees pay nothing.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">No platform fees</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Unlimited tickets</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Full event management tools</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-rose-600/50 bg-[#0A0A0A]">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Paid Events</CardTitle>
              <CardDescription className="text-base text-gray-500">When you sell tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold mb-4 text-white">6%</div>
              <p className="text-gray-400 mb-6">
                A small platform fee of 6% plus ₦80 per ticket sold. Deducted automatically when you withdraw your earnings.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">No setup costs</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">No monthly subscriptions</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Only pay when tickets sell</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-16 bg-[#0A0A0A] border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-white">
              <Info className="w-5 h-5" />
              How it works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3 text-white">Example breakdown</h3>
              <div className="bg-[#0F0F0F] rounded-lg p-6 space-y-3 border border-gray-800">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Ticket price</span>
                  <span className="font-semibold text-white">₦1,000</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Platform fee (6%)</span>
                  <span className="text-gray-500">₦60</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">VAT</span>
                  <span className="text-gray-500">₦80</span>
                </div>
                <Separator className="bg-gray-800" />
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold text-white">You receive</span>
                  <span className="font-bold text-green-500">₦940</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-500">
              <p>
                The customer pays ₦1,080 (ticket price plus ₦80). You receive ₦940 after the platform fee is deducted.
              </p>
              <p>
                Funds are held for 7 days as protection against refunds, then become available for withdrawal to your bank account.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4 text-white">
            No hidden charges
          </h2>
          <p className="text-center text-gray-500 mb-8 max-w-2xl mx-auto">
            What you see is what you get. We're committed to transparency.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-[#0A0A0A] border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-white">No setup fees</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Create your organizer account and start hosting events immediately. No upfront costs.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#0A0A0A] border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-white">No monthly fees</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  No subscriptions or recurring charges. Your account stays active whether you host events or not.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#0A0A0A] border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-white">No minimum sales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Sell one ticket or one thousand. There are no quotas or minimum requirements.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="bg-[#0A0A0A] border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Common questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 text-white">
                When do I get paid?
              </h3>
              <p className="text-sm text-gray-500">
                Funds from ticket sales are held for 7 days, then become available for withdrawal. You can request a withdrawal anytime after that, with a minimum of ₦1,000. Withdrawals typically arrive within 1 to 3 business days.
              </p>
            </div>

            <Separator className="bg-gray-800" />

            <div>
              <h3 className="font-semibold mb-2 text-white">
                Can the platform fee be customized?
              </h3>
              <p className="text-sm text-gray-500">
                The default fee is 6% plus ₦80 per ticket. Custom fee structures may be available for high volume organizers. Contact support for details.
              </p>
            </div>

            <Separator className="bg-gray-800" />

            <div>
              <h3 className="font-semibold mb-2 text-white">
                What if I need to refund a ticket?
              </h3>
              <p className="text-sm text-gray-500">
                If you issue a refund, the platform fee is also refunded to you. The customer receives their full payment back.
              </p>
            </div>

            <Separator className="bg-gray-800" />

            <div>
              <h3 className="font-semibold mb-2 text-white">
                Do students pay any fees?
              </h3>
              <p className="text-sm text-gray-500">
                For paid events, students pay the ticket price plus ₦80. This covers payment processing. For free events, students pay nothing at all.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
