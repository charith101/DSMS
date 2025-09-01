import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Input } from '../../components/shared';
import { usePayment } from '../../contexts/PaymentContext';

/**
 * Pricing Management Page - Manage per-lesson and per-day pricing
 */
const PricingManagement = () => {
  const { pricing, loadPricing, updatePricing } = usePayment();
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [pricingForm, setPricingForm] = useState({
    pricePerLesson: 50,
    pricePerDay: 20
  });
  
  // Load pricing data on component mount
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        await loadPricing();
      } catch (error) {
        console.error('Error loading pricing data:', error);
      }
    };
    
    fetchPricing();
  }, [loadPricing]);
  
  // Format amount as currency
  const formatAmount = (amount) => {
    return `$${Number(amount).toFixed(2)}`;
  };
  
  const handleEditPricing = () => {
    setPricingForm({
      pricePerLesson: pricing.pricePerLesson,
      pricePerDay: pricing.pricePerDay
    });
    setShowEditModal(true);
  };
  
  const handlePricingInputChange = (e) => {
    const { name, value } = e.target;
    setPricingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const submitPricingUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const updatedPricing = {
        pricePerLesson: Number(pricingForm.pricePerLesson),
        pricePerDay: Number(pricingForm.pricePerDay)
      };
      
      await updatePricing(updatedPricing);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating pricing:', error);
    }
  };
  
  // Calculate example costs
  const calculateExampleCosts = () => {
    const lessonExamples = [
      { quantity: 1, cost: pricing.pricePerLesson * 1 },
      { quantity: 5, cost: pricing.pricePerLesson * 5 },
      { quantity: 10, cost: pricing.pricePerLesson * 10 }
    ];
    
    const dayExamples = [
      { quantity: 1, cost: pricing.pricePerDay * 1 },
      { quantity: 7, cost: pricing.pricePerDay * 7 },
      { quantity: 30, cost: pricing.pricePerDay * 30 }
    ];
    
    return { lessonExamples, dayExamples };
  };
  
  const { lessonExamples, dayExamples } = calculateExampleCosts();
  
  return (
    <div className="space-y-6">
      <div className="content-header">
        <h1 className="text-2xl font-bold">Pricing Management</h1>
        <p className="text-secondary">Manage lesson and day-based pricing</p>
      </div>
      
      {/* Pricing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <Card.Header title="Current Pricing" />
          <Card.Body>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Price per Lesson</h3>
                  <p className="text-sm text-secondary">Individual driving lesson</p>
                </div>
                <div className="text-xl font-bold">{formatAmount(pricing.pricePerLesson)}</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Price per Day</h3>
                  <p className="text-sm text-secondary">Daily access rate</p>
                </div>
                <div className="text-xl font-bold">{formatAmount(pricing.pricePerDay)}</div>
              </div>
              
              <div className="pt-4">
                <Button 
                  variant="primary" 
                  onClick={handleEditPricing}
                  className="w-full"
                >
                  Update Pricing
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Header title="Pricing Calculator" />
          <Card.Body>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Lesson-based Pricing</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Number of Lessons</th>
                      <th className="text-right py-2">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lessonExamples.map((example, index) => (
                      <tr key={`lesson-${index}`} className="border-b border-gray-100">
                        <td className="py-2">{example.quantity} lesson{example.quantity > 1 ? 's' : ''}</td>
                        <td className="text-right py-2 font-medium">{formatAmount(example.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Day-based Pricing</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Number of Days</th>
                      <th className="text-right py-2">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayExamples.map((example, index) => (
                      <tr key={`day-${index}`} className="border-b border-gray-100">
                        <td className="py-2">{example.quantity} day{example.quantity > 1 ? 's' : ''}</td>
                        <td className="text-right py-2 font-medium">{formatAmount(example.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
      
      {/* Edit Pricing Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Update Pricing"
        size="md"
      >
        <form onSubmit={submitPricingUpdate} className="space-y-6">
          <Input
            name="pricePerLesson"
            label="Price per Lesson"
            type="number"
            step="0.01"
            min="0"
            value={pricingForm.pricePerLesson}
            onChange={handlePricingInputChange}
            required
          />
          
          <Input
            name="pricePerDay"
            label="Price per Day"
            type="number"
            step="0.01"
            min="0"
            value={pricingForm.pricePerDay}
            onChange={handlePricingInputChange}
            required
          />
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update Pricing
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PricingManagement;