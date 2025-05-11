import { useState } from 'react';
import { Link } from 'react-router-dom';
import './payment.css';
import { SiMercadopago } from "react-icons/si";

const PaymentForm = () => { 
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        if(!selectedMethod) {
            setError("Please select a payment method");
            return;
        }
        
        setIsProcessing(true);
        setError("");
        
        // Simular procesamiento de pago
        setTimeout(() => {
            setIsProcessing(false);
            alert(`Payment processed with: ${selectedMethod}`);
        }, 2000);
    };

    const paymentMethods = [
        {
            id: 'credit-card',
            title: 'Credit Card',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <path d="M1 10h22"/>
                </svg>
            )
        },
        {
            id: 'crypto',
            title: 'Mercado pago',
            icon: (
                <SiMercadopago />
            )
        },
        {
            id: 'paypal',
            title: 'PayPal',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10.365 19.833l1.93-3.89a4.5 4.5 0 00-4.183-2.51V4.5h-6a1 1 0 00-1 1V18a1 1 0 001 1h2.758a2 2 0 011.715-.971l2.71.275zM15 4.5h6a1 1 0 011 1V18a1 1 0 01-1 1h-6V4.5zm6 2h-6"/>
                </svg>
            )
        },
    ];

    return (
        <>
            <div className="formContainerPayment"> 
                <div className="formWrapperPayment">
                    <h2 className="paymentTitle">Select Payment Method</h2>
                    <form className="paymentForm" onSubmit={handleSubmit}>
                        <div className="paymentMethods">
                            {paymentMethods.map(method => (
                                <div 
                                    key={method.id}
                                    className={`methodCard ${selectedMethod === method.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedMethod(method.id)}
                                >
                                    <div className="methodIcon">{method.icon}</div>
                                    <h3 className="methodTitle">{method.title}</h3>
                                </div>
                            ))}
                        </div>
                        
                        <div className="securityNote">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3z"/>
                                <path d="M12 12h.01"/>
                            </svg>
                            <span>All transactions are securely encrypted</span>
                        </div>

                        <Link to="/cardForm">
                            <button
                                type="button"
                                className="submitButtonPayment"
                                disabled={isProcessing || !selectedMethod}
                            >
                                {isProcessing ? "Processing..." : "Confirm Payment"}
                            </button>
                        </Link>
                        
                        {error && <p className="errorMessage">{error}</p>}
                    </form>
                </div>
            </div>
        </>
    );
};

export default PaymentForm;