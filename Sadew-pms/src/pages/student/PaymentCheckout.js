import React, { useState } from 'react';
import { Card, Button, Input, Select } from '../../components/shared';
import { useForm } from '../../hooks/useForm';
import { PAYMENT_FORM_RULES, formatCardNumber, formatExpiryDate } from '../../utils/validationRules';
import { usePayment } from '../../contexts/PaymentContext';

/**
 * Payment Checkout Page - Multi-step payment process for students
 */
const PaymentCheckout = () => {
  const [step, setStep] = useState(1);
  const { pricing, processPayment, calculatePaymentAmount } = usePayment();
  
  // Form validation rules for each step
  const getValidationRules = () => {
    if (step === 1) {
      return {
        pricingType: {
          required: true,
          requiredMessage: 'Please select a pricing type'
        },
        quantity: {
          required: true,
          requiredMessage: 'Please enter the quantity',
          min: 1,
          minMessage: 'Quantity must be at least 1'
        },
        amount: PAYMENT_FORM_RULES.amount
      };
    }
    if (step === 2) {
      return {
        cardholderName: PAYMENT_FORM_RULES.cardholderName,
        cardNumber: PAYMENT_FORM_RULES.cardNumber,
        expiryDate: PAYMENT_FORM_RULES.expiryDate,
        cvv: PAYMENT_FORM_RULES.cvv,
        email: PAYMENT_FORM_RULES.email,
        phone: PAYMENT_FORM_RULES.phone
      };
    }
    return {};
  };

  const {
    values: formData,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue
  } = useForm(
    {
      pricingType: '',
      quantity: '',
      amount: '',
      discountCode: '',
      paymentMethod: 'credit_card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      email: '',
      phone: ''
    },
    getValidationRules(),
    async (data) => {
      try {
        await processPayment(data);
        setStep(3);
      } catch (error) {
        console.error('Payment failed:', error);
      }
    }
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Format specific fields
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    }
    
    handleChange(name, formattedValue);
    
    // Calculate amount when pricing type or quantity changes
    if (name === 'pricingType' || name === 'quantity') {
      if (formData.pricingType && formData.quantity) {
        const amount = calculatePaymentAmount(formData.pricingType, Number(formData.quantity));
        setFieldValue('amount', amount);
      }
    }
  };

  const handleFieldBlur = (e) => {
    const { name } = e.target;
    handleBlur(name);
  };
  
  const canProceedToNextStep = () => {
    if (step === 1) {
      return formData.pricingType && formData.quantity && formData.amount;
    }
    if (step === 2) {
      return isValid && Object.keys(touched).length > 0;
    }
    return true;
  };
  
  const nextStep = () => {
    if (canProceedToNextStep()) {
      setStep(step + 1);
    }
  };
  
  const prevStep = () => {
    setStep(step - 1);
  };
  
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (step === 2) {
      handleSubmit(e);
    } else {
      nextStep();
    }
  };
  
  const steps = [
    { number: 1, title: 'Select Pricing', completed: step > 1 },
    { number: 2, title: 'Payment Details', completed: step > 2 },
    { number: 3, title: 'Confirmation', completed: false }
  ];
  
  // Format amount as currency
  const formatAmount = (amount) => {
    return `$${Number(amount).toFixed(2)}`;
  };
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="content-header">
        <h1 className="content-title">Make Payment</h1>
        <p className="content-description">
          Complete your payment securely using our encrypted checkout process.
        </p>
      </div>
      
      {/* Progress Indicator */}
      <Card>
        <Card.Body>
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <React.Fragment key={s.number}>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s.completed ? 'bg-success-color text-white' :
                    s.number === step ? 'bg-primary-color text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {s.completed ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      s.number
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    s.number === step ? 'text-primary' : 'text-secondary'
                  }`}>
                    {s.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    s.completed ? 'bg-success-color' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </Card.Body>
      </Card>
      
      {/* Step Content */}
      <form onSubmit={handleFormSubmit}>
        {step === 1 && (
          <Card>
            <Card.Header title="Step 1: Select Pricing" />
            <Card.Body className="space-y-6">
              <Select
                name="pricingType"
                label="Choose Pricing Type"
                value={formData.pricingType}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                options={[
                  { value: 'lesson', label: `Per Lesson - ${formatAmount(pricing.pricePerLesson)} each` },
                  { value: 'day', label: `Per Day - ${formatAmount(pricing.pricePerDay)} each` }
                ]}
                error={touched.pricingType && errors.pricingType}
                required
              />
              
              {formData.pricingType && (
                <Input
                  name="quantity"
                  label={formData.pricingType === 'lesson' ? 'Number of Lessons' : 'Number of Days'}
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={touched.quantity && errors.quantity}
                  required
                />
              )}
              
              <Input
                name="discountCode"
                label="Discount Code (Optional)"
                placeholder="Enter discount code"
                value={formData.discountCode}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
              />
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-xl font-bold text-primary-color">
                    {formatAmount(formData.amount || 0)}
                  </span>
                </div>
              </div>
            </Card.Body>
            <Card.Footer>
              <Button 
                type="button" 
                onClick={nextStep}
                disabled={!canProceedToNextStep()}
                className="ml-auto"
              >
                Continue to Payment
              </Button>
            </Card.Footer>
          </Card>
        )}
        
        {step === 2 && (
          <Card>
            <Card.Header title="Step 2: Payment Information" />
            <Card.Body className="space-y-6">
              <Select
                name="paymentMethod"
                label="Payment Method"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                options={[
                  { value: 'credit_card', label: 'Credit Card' },
                  { value: 'debit_card', label: 'Debit Card' }
                ]}
                required
              />
              
              <Input
                name="cardholderName"
                label="Cardholder Name"
                placeholder="John Doe"
                value={formData.cardholderName}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={touched.cardholderName && errors.cardholderName}
                required
              />
              
              <Input
                name="cardNumber"
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={touched.cardNumber && errors.cardNumber}
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="expiryDate"
                  label="Expiry Date"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={touched.expiryDate && errors.expiryDate}
                  required
                />
                
                <Input
                  name="cvv"
                  label="CVV"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={touched.cvv && errors.cvv}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={touched.email && errors.email}
                  required
                />
                
                <Input
                  name="phone"
                  label="Phone Number"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={touched.phone && errors.phone}
                  required
                />
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-yellow-800">Secure Payment</h4>
                    <p className="text-yellow-700 text-sm mt-1">
                      Your payment information is encrypted and secure. We do not store your card details.
                    </p>
                  </div>
                </div>
              </div>
            </Card.Body>
            <Card.Footer>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={!canProceedToNextStep()}
                >
                  Review Payment
                </Button>
              </div>
            </Card.Footer>
          </Card>
        )}
        
        {step === 3 && (
          <Card>
            <Card.Header title="Step 3: Confirm Payment" />
            <Card.Body className="space-y-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium mb-4">Payment Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Pricing Type:</span>
                    <span>
                      {formData.pricingType === 'lesson' ? 'Per Lesson' : 'Per Day'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>
                      {formData.quantity} {formData.pricingType === 'lesson' ? 'lesson' : 'day'}
                      {Number(formData.quantity) > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span>Credit Card ending in {formData.cardNumber.slice(-4)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total:</span>
                      <span className="text-primary-color">{formatAmount(formData.amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-800 text-sm">
                    By clicking "Complete Payment", you agree to our terms and conditions.
                  </p>
                </div>
              </div>
            </Card.Body>
            <Card.Footer>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button 
                  type="submit" 
                  variant="success" 
                  className="font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Complete Payment'}
                </Button>
              </div>
            </Card.Footer>
          </Card>
        )}
      </form>
    </div>
  );
};

export default PaymentCheckout;