import React, { useEffect } from 'react';
import { Card, Button } from '../../components/shared';
import { usePayment } from '../../contexts/PaymentContext';

/**
 * Pricing Page - Display simplified pricing structure
 */
const PricingPage = () => {
  const { pricing, loadPricing } = usePayment();
  
  useEffect(() => {
    loadPricing();
  }, [loadPricing]);
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="content-header text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Simple, Transparent Pricing</h1>
        <p className="text-secondary max-w-2xl mx-auto">Choose the pricing option that works best for you</p>
      </div>
      
      {/* Pricing Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Per Lesson Pricing */}
        <Card className="border-t-4 border-primary">
          <Card.Header title="Pay Per Lesson" />
          <Card.Body className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                ${pricing.pricePerLesson.toFixed(2)}
                <span className="text-base font-normal text-secondary"> / lesson</span>
              </div>
              <p className="text-sm text-secondary mt-1">Perfect for occasional learners</p>
            </div>
            
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="text-success-color mr-2">✓</span>
                <span>Pay only for what you need</span>
              </li>
              <li className="flex items-center">
                <span className="text-success-color mr-2">✓</span>
                <span>Flexible scheduling</span>
              </li>
              <li className="flex items-center">
                <span className="text-success-color mr-2">✓</span>
                <span>No long-term commitment</span>
              </li>
            </ul>
            
            <Button variant="primary" className="w-full mt-4">
              Book a Lesson
            </Button>
          </Card.Body>
        </Card>
        
        {/* Per Day Pricing */}
        <Card className="border-t-4 border-secondary">
          <Card.Header title="Pay Per Day" />
          <Card.Body className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">
                ${pricing.pricePerDay.toFixed(2)}
                <span className="text-base font-normal text-secondary"> / day</span>
              </div>
              <p className="text-sm text-secondary mt-1">Great for intensive learning</p>
            </div>
            
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="text-success-color mr-2">✓</span>
                <span>Full day access</span>
              </li>
              <li className="flex items-center">
                <span className="text-success-color mr-2">✓</span>
                <span>Multiple sessions per day</span>
              </li>
              <li className="flex items-center">
                <span className="text-success-color mr-2">✓</span>
                <span>Cost-effective for regular users</span>
              </li>
            </ul>
            
            <Button variant="secondary" className="w-full mt-4">
              Book Multiple Days
            </Button>
          </Card.Body>
        </Card>
      </div>
      
      {/* FAQ Section */}
      <Card>
        <Card.Header title="Frequently Asked Questions" />
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-primary mb-2">
                What if I need to cancel or reschedule?
              </h4>
              <p className="text-sm text-secondary mb-4">
                You can reschedule lessons with 24-hour notice. Cancellations 
                are eligible for partial refunds based on your remaining balance.
              </p>
              
              <h4 className="font-semibold text-primary mb-2">
                Are there any hidden fees?
              </h4>
              <p className="text-sm text-secondary">
                No hidden fees! The price per lesson or day includes everything you need.
                Pay only for what you use with our transparent pricing.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-primary mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-sm text-secondary mb-4">
                We accept all major credit cards, debit cards, and bank transfers.
                Discounts available when booking multiple lessons or days.
              </p>
              
              <h4 className="font-semibold text-primary mb-2">
                Can I switch between pricing options?
              </h4>
              <p className="text-sm text-secondary">
                Yes! You can switch between per-lesson and per-day pricing at any time
                based on your changing needs and schedule.
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>
      
      {/* Contact Section */}
      <Card variant="primary">
        <Card.Body className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            Need Help With Pricing?
          </h3>
          <p className="text-blue-100 mb-4">
            Our team is here to help you select the best pricing option for your learning goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="secondary">
              Chat with Us
            </Button>
            <Button variant="outline-primary">
              Call (555) 123-4567
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PricingPage;