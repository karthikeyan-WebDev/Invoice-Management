

/// this code working completely perfect ///


import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Plus, Edit2, Trash2, CreditCard, Calendar, User, FileText, DollarSign, X, ChevronLeft, ChevronRight, ChevronFirst, ChevronLast } from "lucide-react";

const Payments = () => {
  const [paymentsData, setPaymentsData] = useState({
    results: [],
    count: 0,
    next: null,
    previous: null
  });
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState({ 
    id: null, 
    invoice: "", 
    invoice_number: "", 
    client_name: "",
    amount_paid: "" 
  });
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPayments = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/payments/?page=${pageNumber}`);
      setPaymentsData({
        results: response.data.results || [],
        count: response.data.count || 0,
        next: response.data.next,
        previous: response.data.previous
      });
      setPage(pageNumber);
      
      // Calculate total pages based on actual results length
      const itemsPerPage = response.data.results.length;
      setTotalPages(Math.ceil(response.data.count / Math.max(1, itemsPerPage)));
      
      setError(null);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setError("Failed to load payments. Please try again.");
      setPaymentsData({
        results: [],
        count: 0,
        next: null,
        previous: null
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await axios.get("/api/invoices/");
      setInvoices(response.data.results || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setInvoices([]);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchPayments();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const payload = {
        invoice: form.invoice,
        amount_paid: form.amount_paid
      };

      if (form.id) {
        await axios.put(`/api/payments/${form.id}/`, payload);
        setSuccess("Payment updated successfully!");
      } else {
        await axios.post("/api/payments/", payload);
        setSuccess("Payment created successfully!");
      }
      
      fetchPayments(page);
      setForm({ id: null, invoice: "", invoice_number: "", client_name: "", amount_paid: "" });
      setShowForm(false);
    } catch (error) {
      console.error("Error saving payment:", error);
      setError(error.response?.data?.message || "Failed to save payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (payment) => {
    setForm({ 
      id: payment.id,
      invoice: payment.invoice,
      invoice_number: payment.invoice_number,
      client_name: payment.client_name,
      amount_paid: payment.amount_paid
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      try {
        setLoading(true);
        setError(null);
        await axios.delete(`/api/payments/${id}/`);
        setSuccess("Payment deleted successfully!");
        
        // Handle page adjustment if last item on page is deleted
        if (paymentsData.results.length === 1 && page > 1) {
          fetchPayments(page - 1);
        } else {
          fetchPayments(page);
        }
      } catch (error) {
        console.error("Error deleting payment:", error);
        setError("Failed to delete payment. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const goToPage = (pageNumber) => {
    if (!loading && pageNumber >= 1 && pageNumber <= totalPages) {
      fetchPayments(pageNumber);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let start = Math.max(page - halfVisible, 1);
      let end = Math.min(start + maxVisiblePages - 1, totalPages);
      
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(end - maxVisiblePages + 1, 1);
      }
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...');
        }
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <CreditCard className="text-blue-600" size={32} />
                  Payments
                </h1>
                <p className="text-gray-600 mt-2">Manage payment records and transactions</p>
              </div>
              <button 
                onClick={() => {
                  setForm({ id: null, invoice: "", invoice_number: "", client_name: "", amount_paid: "" });
                  setShowForm(true);
                }} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 font-medium"
              >
                <Plus size={20} />
                Add Payment
              </button>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          {/* Add/Edit Payment Form */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="text-blue-600" size={24} />
                    {form.id ? "Edit Payment" : "Add Payment"}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Invoice Field - Different display for edit vs add */}
                  {form.id ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FileText size={16} className="inline mr-2" />
                          Invoice Number
                        </label>
                        <input
                          type="text"
                          value={form.invoice_number}
                          readOnly
                          className="w-full border border-gray-300 px-4 py-3 rounded-lg bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <User size={16} className="inline mr-2" />
                          Client Name
                        </label>
                        <input
                          type="text"
                          value={form.client_name}
                          readOnly
                          className="w-full border border-gray-300 px-4 py-3 rounded-lg bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FileText size={16} className="inline mr-2" />
                        Invoice
                      </label>
                      <select 
                        name="invoice" 
                        value={form.invoice} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      >
                        <option value="">-- Select Invoice --</option>
                        {invoices.map((invoice) => (
                          <option key={invoice.id} value={invoice.id}>
                            {invoice.invoice_number} - {invoice.client_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Amount Paid Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign size={16} className="inline mr-2" />
                      Amount Paid
                    </label>
                    <input
                      type="number"
                      step="0.0"
                      name="amount_paid"
                      value={form.amount_paid}
                      onChange={handleChange}
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)} 
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150 font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {form.id ? "Update" : "Add"} Payment
                    {loading && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Payments Table */}
          {loading && paymentsData.results.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <CreditCard className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading payments</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button 
                onClick={() => fetchPayments(page)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <FileText size={16} />
                          Invoice
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          Client
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} />
                          Amount Paid
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          Date
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentsData.results.length > 0 ? (
                      paymentsData.results.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {payment.invoice_number}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">
                              {payment.client_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-green-600">
                              ₹{payment.amount_paid?.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {payment.payment_date && new Date(payment.payment_date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex justify-center space-x-2">
                              <button 
                                onClick={() => handleEdit(payment)} 
                                disabled={loading}
                                className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Edit Payment"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDelete(payment.id)} 
                                disabled={loading}
                                className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete Payment"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center">
                          <div className="text-center py-12">
                            <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                            <p className="text-gray-500">Get started by adding your first payment record.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Enhanced Pagination Controls */}
              {paymentsData.results.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200 gap-4">
                  <div className="text-sm text-gray-700">
                    Showing {(page - 1) * paymentsData.results.length + 1} to{' '}
                    {Math.min(page * paymentsData.results.length, paymentsData.count)} of{' '}
                    {paymentsData.count} payments
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => goToPage(1)}
                      disabled={page === 1 || loading}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      <ChevronFirst className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => goToPage(page - 1)}
                      disabled={!paymentsData.previous || loading}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {getPageNumbers().map((pageNumber, index) => (
                      <button
                        key={index}
                        onClick={() => typeof pageNumber === 'number' ? goToPage(pageNumber) : null}
                        disabled={pageNumber === '...' || loading}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                          pageNumber === page 
                            ? 'bg-blue-600 text-white' 
                            : 'border border-gray-300 hover:bg-gray-50'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => goToPage(page + 1)}
                      disabled={!paymentsData.next || loading}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => goToPage(totalPages)}
                      disabled={page === totalPages || loading}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      <ChevronLast className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payments;







