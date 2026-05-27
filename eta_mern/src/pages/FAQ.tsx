import React from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FAQ = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002c2b]/5 to-[#002c2b]/10">
      <Header showSearchButton={false} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#002c2b] mb-3">FAQ</h1>
          <p className="text-gray-600">Answers to the most common questions from travelers.</p>
        </div>

        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-[#002c2b]">How do I book a ticket?</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              Use the search section on the home page, choose a schedule, and finish booking with your details.
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-[#002c2b]">Can I book for multiple passengers?</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              Yes. Set the passenger count during search and complete details for each traveler.
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-[#002c2b]">Where can I find my tickets?</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              After signing in, open your dashboard to view booked tickets and their QR codes.
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-[#002c2b]">Who do I contact for support?</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              Reach us at info@etickets.al or +355 69 123 4567 for route and ticket help.
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FAQ;
