import React from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const HelpCenter = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002c2b]/5 to-[#002c2b]/10">
      <Header showSearchButton={false} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#002c2b] mb-3">Help Center</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find quick guidance for booking, payments, and managing your travel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#002c2b]">Booking Support</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-2">
              <p>1. Search your route and choose travel date.</p>
              <p>2. Select an available schedule and seat.</p>
              <p>3. Complete passenger details and payment.</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#002c2b]">Ticket Management</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-2">
              <p>Access your tickets from your dashboard after login.</p>
              <p>Use your ticket QR code during check-in at departure.</p>
              <p>Contact support for changes based on operator policy.</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm md:col-span-2">
            <CardHeader>
              <CardTitle className="text-[#002c2b]">Need More Help?</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              For urgent assistance, call +355 69 123 4567 or email info@etickets.al.
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default HelpCenter;
