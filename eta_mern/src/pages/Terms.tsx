import React from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002c2b]/5 to-[#002c2b]/10">
      <Header showSearchButton={false} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#002c2b] mb-3">Terms & Conditions</h1>
          <p className="text-gray-600">Please review the basic terms for using E-Tickets Albania services.</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#002c2b]">Usage Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              By booking through E-Tickets Albania, you agree to provide accurate passenger details and to
              follow route operator travel policies.
            </p>
            <p>
              Ticket availability, prices, and departure times may change based on operator updates.
              Please verify booking details before payment.
            </p>
            <p>
              Refunds, cancellations, and schedule changes are handled according to operator rules.
              Contact support for assistance with specific bookings.
            </p>
            <p>
              Misuse of the platform, fraudulent activity, or disruption of service may result in account
              suspension.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Terms;
