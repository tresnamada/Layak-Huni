"use client";
import { motion } from 'framer-motion';
import { CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface TenorOption {
  years: number;
  monthlyPayment: number;
  totalInterest: number;
  isRecommended?: boolean;
  affordabilityLevel: 'good' | 'moderate' | 'risky';
}

interface TenorSelectorProps {
  selectedTenor: number;
  onTenorChange: (tenor: number) => void;
  loanAmount: number;
  interestRate: number;
  userIncome?: number;
}

const TENOR_OPTIONS = [5, 10, 15, 20, 25, 30];

export default function TenorSelector({
  selectedTenor,
  onTenorChange,
  loanAmount,
  interestRate,
  userIncome
}: TenorSelectorProps) {
  
  const calculatePaymentForTenor = (years: number) => {
    const monthlyInterest = interestRate / 12 / 100;
    const totalMonths = years * 12;
    
    const monthlyPayment = (loanAmount * monthlyInterest) / 
                         (1 - Math.pow(1 + monthlyInterest, -totalMonths));
    
    const totalInterest = monthlyPayment * totalMonths - loanAmount;
    
    // Determine affordability level based on payment-to-income ratio
    let affordabilityLevel: 'good' | 'moderate' | 'risky' = 'good';
    if (userIncome) {
      const paymentRatio = monthlyPayment / userIncome;
      if (paymentRatio > 0.4) affordabilityLevel = 'risky';
      else if (paymentRatio > 0.3) affordabilityLevel = 'moderate';
    }
    
    return {
      monthlyPayment,
      totalInterest,
      affordabilityLevel
    };
  };

  const tenorOptions: TenorOption[] = TENOR_OPTIONS.map(years => {
    const calculation = calculatePaymentForTenor(years);
    return {
      years,
      ...calculation,
      isRecommended: years === 15 || years === 20 // Default recommendation logic
    };
  });

  const getAffordabilityColor = (level: 'good' | 'moderate' | 'risky') => {
    switch (level) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'risky': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getAffordabilityIcon = (level: 'good' | 'moderate' | 'risky') => {
    switch (level) {
      case 'good': return <CheckCircle size={16} className="text-green-600" />;
      case 'moderate': return <TrendingUp size={16} className="text-yellow-600" />;
      case 'risky': return <TrendingDown size={16} className="text-red-600" />;
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Pilih Tenor Kredit
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {tenorOptions.map((option) => (
          <motion.button
            key={option.years}
            onClick={() => onTenorChange(option.years)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative p-4 rounded-lg border-2 transition-all duration-200
              ${selectedTenor === option.years 
                ? 'border-amber-500 bg-amber-50 shadow-md' 
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }
            `}
          >
            {/* Recommended Badge */}
            {option.isRecommended && (
              <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                Rekomendasi
              </div>
            )}
            
            {/* Tenor Years */}
            <div className="text-center mb-2">
              <div className={`text-lg font-bold ${
                selectedTenor === option.years ? 'text-amber-700' : 'text-gray-800'
              }`}>
                {option.years} Tahun
              </div>
            </div>
            
            {/* Monthly Payment */}
            <div className="text-center mb-2">
              <div className="text-xs text-gray-500 mb-1">Cicilan/bulan</div>
              <div className={`text-sm font-semibold ${
                selectedTenor === option.years ? 'text-amber-600' : 'text-gray-700'
              }`}>
                Rp {option.monthlyPayment.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
              </div>
            </div>
            
            {/* Total Interest */}
            <div className="text-center mb-2">
              <div className="text-xs text-gray-500 mb-1">Total bunga</div>
              <div className="text-xs text-gray-600">
                Rp {option.totalInterest.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
              </div>
            </div>
            
            {/* Affordability Indicator */}
            {userIncome && (
              <div className={`
                flex items-center justify-center mt-2 px-2 py-1 rounded-full text-xs border
                ${getAffordabilityColor(option.affordabilityLevel)}
              `}>
                {getAffordabilityIcon(option.affordabilityLevel)}
                <span className="ml-1 capitalize">{option.affordabilityLevel}</span>
              </div>
            )}
            
            {/* Selection Indicator */}
            {selectedTenor === option.years && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 left-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center"
              >
                <CheckCircle size={12} className="text-white" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
      
      {/* Payment Impact Comparison */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="mt-4 p-3 bg-gray-50 rounded-lg"
      >
        <div className="text-sm text-gray-600 mb-2">
          <strong>Perbandingan dengan tenor lain:</strong>
        </div>
        
        {selectedTenor > 5 && (
          <div className="text-xs text-gray-500 mb-1">
            Tenor lebih pendek ({selectedTenor - 5} tahun): 
            <span className="text-green-600 ml-1">
              Hemat Rp {(calculatePaymentForTenor(selectedTenor).totalInterest - 
                        calculatePaymentForTenor(selectedTenor - 5).totalInterest).toLocaleString('id-ID')} bunga
            </span>
          </div>
        )}
        
        {selectedTenor < 30 && (
          <div className="text-xs text-gray-500">
            Tenor lebih panjang ({selectedTenor + 5} tahun): 
            <span className="text-blue-600 ml-1">
              Cicilan lebih ringan Rp {(calculatePaymentForTenor(selectedTenor).monthlyPayment - 
                                      calculatePaymentForTenor(selectedTenor + 5).monthlyPayment).toLocaleString('id-ID')}/bulan
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}