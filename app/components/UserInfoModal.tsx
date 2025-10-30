"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, User, Calendar, CreditCard, Loader2 } from "lucide-react";

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void> | void;
  selectedAgent: "hindi" | "english";
}

export interface UserFormData {
  loan_type: string;
  loan_account: string;
  loan_amount: string;
  emi_amount: string;
  due_date: string;
  bounce_charge: string;
  default_interest: string;
  user_name: string;
  user_email: string;
  user_mobile: string;
  interest_rate: string;
  tenure: string;
}

const UserInfoModal: React.FC<UserInfoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedAgent,
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    loan_type: "personal",
    loan_account: "LAN416",
    loan_amount: "300000",
    emi_amount: "14294",
    due_date: "15",
    bounce_charge: "500",
    default_interest: "0.5",
    user_name: "Avinash Arora",
    user_email: "avinash.arora@orbitindia.net",
    user_mobile: "9810048271",
    interest_rate: "5",
    tenure: "24",
  });

  const [errors, setErrors] = useState<Partial<UserFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Partial<UserFormData> = {};

    if (!formData.user_name.trim()) newErrors.user_name = "Name is required";
    if (!formData.user_mobile.trim()) newErrors.user_mobile = "Mobile is required";
    if (!formData.user_email.trim()) newErrors.user_email = "Email is required";
    if (!formData.loan_type.trim()) newErrors.loan_type = "Loan type is required";
    if (!formData.loan_account.trim()) newErrors.loan_account = "Account is required";
    if (!formData.loan_amount.trim()) newErrors.loan_amount = "Amount is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.user_email && !emailRegex.test(formData.user_email)) {
      newErrors.user_email = "Invalid email format";
    }

    // Mobile validation (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (formData.user_mobile && !mobileRegex.test(formData.user_mobile)) {
      newErrors.user_mobile = "Mobile must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setIsSubmitting(true);
        await Promise.resolve(onSubmit(formData));
      } catch (error) {
        console.error("Failed to submit user info:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name as keyof UserFormData]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full h-full max-h-[calc(100vh-3rem)] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white relative">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
                <h2 className="text-2xl font-bold">Complete Your Information</h2>
                <p className="text-white/90 mt-1">
                  Agent: {selectedAgent === "hindi" ? "Hindi Support" : "English Support"}
                </p>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
                {/* Action Buttons (pinned to top) */}
                <div className="border-b border-blue-100 bg-white/95 px-6 py-4 shrink-0">
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">
                      Review the details, then start the call with Maya.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
                      <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-80"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Connecting…
                          </>
                        ) : (
                          <>
                            <Phone size={18} />
                            Start Call
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 space-y-6">
                  {/* Personal Information Section */}
                  <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <User className="mr-2 text-blue-500" size={20} />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="user_name"
                        value={formData.user_name}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.user_name ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter your name"
                      />
                      {errors.user_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.user_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        name="user_mobile"
                        value={formData.user_mobile}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.user_mobile ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="10 digit mobile number"
                        maxLength={10}
                      />
                      {errors.user_mobile && (
                        <p className="text-red-500 text-xs mt-1">{errors.user_mobile}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="user_email"
                        value={formData.user_email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.user_email ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="your.email@example.com"
                      />
                      {errors.user_email && (
                        <p className="text-red-500 text-xs mt-1">{errors.user_email}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Loan Details Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <CreditCard className="mr-2 text-purple-500" size={20} />
                    Loan Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loan Type *
                      </label>
                      <select
                        name="loan_type"
                        value={formData.loan_type}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.loan_type ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <option value="">Select loan type</option>
                        <option value="personal">Personal Loan</option>
                        <option value="home">Home Loan</option>
                        <option value="auto">Auto Loan</option>
                        <option value="education">Education Loan</option>
                        <option value="business">Business Loan</option>
                      </select>
                      {errors.loan_type && (
                        <p className="text-red-500 text-xs mt-1">{errors.loan_type}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loan Account Number *
                      </label>
                      <input
                        type="text"
                        name="loan_account"
                        value={formData.loan_account}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.loan_account ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Account number"
                      />
                      {errors.loan_account && (
                        <p className="text-red-500 text-xs mt-1">{errors.loan_account}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loan Amount *
                      </label>
                      <input
                        type="number"
                        name="loan_amount"
                        value={formData.loan_amount}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.loan_amount ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Total loan amount"
                      />
                      {errors.loan_amount && (
                        <p className="text-red-500 text-xs mt-1">{errors.loan_amount}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        EMI Amount
                      </label>
                      <input
                        type="number"
                        name="emi_amount"
                        value={formData.emi_amount}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Monthly EMI"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Details Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Calendar className="mr-2 text-green-500" size={20} />
                    Additional Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date (Day of Month)
                      </label>
                      <input
                        type="number"
                        name="due_date"
                        value={formData.due_date}
                        onChange={handleChange}
                        min="1"
                        max="31"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Day of month (1-31)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bounce Charge
                      </label>
                      <input
                        type="number"
                        name="bounce_charge"
                        value={formData.bounce_charge}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Bounce charge amount"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Interest Rate (%)
                      </label>
                      <input
                        type="number"
                        name="interest_rate"
                        value={formData.interest_rate}
                        onChange={handleChange}
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Annual interest rate"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Default Interest (Bounce) %
                      </label>
                      <input
                        type="number"
                        name="default_interest"
                        value={formData.default_interest}
                        onChange={handleChange}
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Default interest rate"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tenure (Months)
                      </label>
                      <input
                        type="number"
                        name="tenure"
                        value={formData.tenure}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Loan tenure in months"
                      />
                    </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UserInfoModal;
