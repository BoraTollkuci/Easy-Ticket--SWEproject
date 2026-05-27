import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002c2b]/5 to-[#002c2b]/10">
      <Header showSearchButton={false} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#002c2b] mb-3">Contact Us</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have a question about routes, schedules, or bookings? Our team is here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-[#002c2b] flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Phone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">+355 69 123 4567</p>
              <p className="text-sm text-gray-500 mt-2">Daily: 08:00 - 20:00</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-[#002c2b] flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">info@etickets.al</p>
              <p className="text-sm text-gray-500 mt-2">We reply within 24 hours</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-[#002c2b] flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Office
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">Tirane, Albania</p>
              <p className="text-sm text-gray-500 mt-2">Main Support Center</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Contact;
