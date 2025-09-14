"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Info } from 'lucide-react';
import TenorSelector from './TenorSelector';

interface KPRSimulatorProps {
  housePrice: number;
}

const banks = [
  { name: 'BRI', interestRate: 8 },
  { name: 'BCA', interestRate: 7.5 },
  { name: 'Mandiri', interestRate: 8.2 },
];

export default function KPRSimulator({ housePrice }: KPRSimulatorProps) {
  const [dp, setDp] = useState(20);
  const [tenor, setTenor] = useState(10);
  const [selectedBank, setSelectedBank] = useState(banks[0]);
  const [showDetails, setShowDetails] = useState(false);

  const calculatePayment = () => {
    const loanAmount = housePrice * (1 - dp / 100);
    const monthlyInterest = selectedBank.interestRate / 12 / 100;
    const totalMonths = tenor * 12;
    
    const monthlyPayment = (loanAmount * monthlyInterest) / 
                         (1 - Math.pow(1 + monthlyInterest, -totalMonths));
    
    return {
      monthly: monthlyPayment,
      totalInterest: monthlyPayment * totalMonths - loanAmount,
      minSalary: monthlyPayment * 3,
    };
  };

  const { monthly, totalInterest, minSalary } = calculatePayment();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-lg mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Simulasi KPR</h2>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-amber-600 hover:text-amber-700 flex items-center"
        >
          {showDetails ? 'Sembunyikan' : 'Detail'} 
          <ChevronDown className={`ml-1 transition-transform ${showDetails ? 'rotate-180' : ''}`} size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Input DP */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Uang Muka (DP): {dp}% 
            <span className="text-amber-600 ml-2">(Rp {Math.floor(housePrice * dp / 100).toLocaleString('id-ID')})</span>
          </label>
          <input
            type="range"
            min="10"
            max="50"
            value={dp}
            onChange={(e) => setDp(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10%</span>
            <span>50%</span>
          </div>
        </div>

        {/* Tenor Selection */}
        <TenorSelector
          selectedTenor={tenor}
          onTenorChange={setTenor}
          loanAmount={housePrice * (1 - dp / 100)}
          interestRate={selectedBank.interestRate}
          userIncome={minSalary} // Using calculated minimum salary as reference income
        />

        {/* Pilihan Bank */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bank
          </label>
          <div className="grid grid-cols-3 gap-2">
            {banks.map((bank) => (
              <button
                key={bank.name}
                onClick={() => setSelectedBank(bank)}
                className={`px-3 py-2 rounded-lg border ${
                  selectedBank.name === bank.name 
                    ? 'border-amber-500 bg-amber-50 text-amber-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                } transition-colors`}
              >
                {bank.name} ({bank.interestRate}%)
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hasil Simulasi (Selalu Tampil) */}
      <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700">Estimasi Cicilan:</span>
          <span className="text-xl font-bold text-amber-600">
            Rp {monthly.toLocaleString('id-ID', { maximumFractionDigits: 0 })}/bulan
          </span>
        </div>
        <div className="text-sm text-gray-600">
          <span className="block">Minimal gaji: Rp {minSalary.toLocaleString('id-ID')}/bulan</span>
          <span className="block">Total bunga: Rp {totalInterest.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Detail Tambahan (Toggle) */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="mt-4 space-y-3 text-sm text-gray-600"
        >
          <div className="flex items-start">
            <Info className="text-amber-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
            <span>DP minimal 20% untuk meningkatkan persetujuan KPR</span>
          </div>
          <div className="flex items-start">
            <Info className="text-amber-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
            <span>Perhitungan belum termasuk biaya administrasi dan asuransi</span>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <h4 className="font-medium text-gray-700 mb-1">Syarat Umum:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Usia minimal 21 tahun</li>
              <li>Masa kerja minimal 2 tahun</li>
              <li>Slip gaji 3 bulan terakhir</li>
            </ul>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}