
/// this code is working perfectly ///



import { useEffect, useState } from "react";
import { Plus, FileText, Calendar, User, Edit, Trash2, Save, X, Hash, Receipt, Clock, Building, CheckCircle, AlertCircle, XCircle, CreditCard, Printer, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react";
import axios from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    client: "",
    invoice_number: generateInvoiceNumber(),
    issue_date: "",
    due_date: "",
    subtotal: "",
    total: "",
    notes: "",
    payment_status: "pending",
    paid_amount: "0.00",
    balance: "",
    line_items: [{ description: "", quantity: "", rate: "", amount: "" }]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: "bank_transfer",
    notes: ""
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalCount: 0,
    totalPages: 1
  });

  // Client search state
  const [clientSearch, setClientSearch] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [isClientLoading, setIsClientLoading] = useState(false);

  function generateInvoiceNumber() {
    const prefix = "INV-";
    const timestamp = Date.now().toString().slice(-4);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return prefix + timestamp + randomNum;
  }

  const fetchInvoices = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`api/invoices/?page=${page}`);
      const data = res.data;
      
      setInvoices(data.results);
      setPagination({
        currentPage: page,
        totalCount: data.count,
        totalPages: Math.ceil(data.count / 3) // Using Django's default page size of 3
      });

      // Auto-adjust current page if we're on an empty page
      if (data.results.length === 0 && page > 1) {
        fetchInvoices(page - 1);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setInvoices([]);
      setPagination({
        currentPage: 1,
        totalCount: 0,
        totalPages: 1
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async (search = "") => {
    setIsClientLoading(true);
    try {
      const res = await axios.get(`api/clients/?search=${search}`);
      const data = res.data;
      
      // Handle different API response structures
      const clientData = data.results || data.data || (Array.isArray(data) ? data : []);
      
      setClients(clientData);
      setFilteredClients(clientData);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setClients([]);
      setFilteredClients([]);
    } finally {
      setIsClientLoading(false);
    }
  };

  const handleClientSearch = async (e) => {
    const value = e.target.value;
    setClientSearch(value);
    setShowClientDropdown(true);

    if (value.trim() === "") {
      setFilteredClients(clients);
      return;
    }

    setIsClientLoading(true);
    try {
      const res = await axios.get(`api/clients/?search=${encodeURIComponent(value)}`);
      const clientData = res.data.results || res.data.data || (Array.isArray(res.data) ? res.data : []);
      setFilteredClients(clientData);
    } catch (error) {
      setFilteredClients([]);
    } finally {
      setIsClientLoading(false);
    }
  };

  const selectClient = (client) => {
    setForm({ ...form, client: client.id });
    setClientSearch(client.name);
    setShowClientDropdown(false);
  };

  const handleLineItemChange = (index, e) => {
    const { name, value } = e.target;
    const lineItems = [...form.line_items];
    lineItems[index][name] = value;

    if (name === "quantity" || name === "rate") {
      const quantity = parseFloat(lineItems[index].quantity) || 0;
      const rate = parseFloat(lineItems[index].rate) || 0;
      lineItems[index].amount = (quantity * rate).toFixed(2);
    }

    setForm({ ...form, line_items: lineItems });
  };

  const addLineItem = () => {
    setForm({
      ...form,
      line_items: [...form.line_items, { description: "", quantity: "", rate: "", amount: "" }]
    });
  };

  const removeLineItem = (index) => {
    if (form.line_items.length > 1) {
      const lineItems = [...form.line_items];
      lineItems.splice(index, 1);
      setForm({ ...form, line_items: lineItems });
    }
  };

  const calculateTotals = () => {
    const subtotal = form.line_items.reduce((sum, item) => {
      return sum + (parseFloat(item.amount) || 0);
    }, 0);
    const total = subtotal.toFixed(2);
    const paidAmount = parseFloat(form.paid_amount) || 0;
    const balance = (subtotal - paidAmount).toFixed(2);

    let paymentStatus = form.payment_status;
    if (paidAmount === 0) {
      paymentStatus = "pending";
    } else if (paidAmount >= subtotal) {
      paymentStatus = "paid";
    } else {
      paymentStatus = "partial";
    }

    setForm(prev => ({
      ...prev,
      subtotal: subtotal.toFixed(2),
      total: total,
      balance: balance,
      payment_status: paymentStatus
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [form.line_items, form.paid_amount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        ...form,
        client_id: form.client,
        line_items_data: form.line_items.map(item => ({
          description: item.description,
          quantity: parseFloat(item.quantity) || 0,
          rate: parseFloat(item.rate) || 0,
          amount: parseFloat(item.amount) || 0
        }))
      };

      let response;
      if (editingId) {
        response = await axios.put(`api/invoices/${editingId}/`, payload);
      } else {
        response = await axios.post("api/invoices/", payload);
      }

      resetForm();
      await fetchInvoices(pagination.currentPage);
    } catch (error) {
      console.error("Error saving invoice:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      client: "",
      invoice_number: generateInvoiceNumber(),
      issue_date: "",
      due_date: "",
      subtotal: "",
      total: "",
      notes: "",
      payment_status: "pending",
      paid_amount: "0.0",
      balance: "",
      line_items: [{ description: "", quantity: "", rate: "", amount: "" }]
    });
    setClientSearch("");
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = async (id) => {
    try {
      const res = await axios.get(`api/invoices/${id}/`);
      const invoiceData = res.data;
      const client = clients.find(c => c.id === invoiceData.client_id || c.id === invoiceData.client);

      setForm({
        client: invoiceData.client_id || invoiceData.client || "",
        invoice_number: invoiceData.invoice_number || "",
        issue_date: invoiceData.issue_date || "",
        due_date: invoiceData.due_date || "",
        subtotal: invoiceData.subtotal || "",
        total: invoiceData.total || "",
        notes: invoiceData.notes || "",
        payment_status: invoiceData.payment_status || "pending",
        paid_amount: invoiceData.paid_amount ?? invoiceData.amount_paid ?? "0.0",
        balance: invoiceData.balance || "",
        line_items: invoiceData.line_items_data || invoiceData.line_items ||
          [{ description: "", quantity: "", rate: "", amount: "" }]
      });

      setClientSearch(client ? client.name : invoiceData.client_name || "");
      setEditingId(id);
      setShowForm(true);
    } catch (error) {
      console.error("Error fetching invoice:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await axios.delete(`api/invoices/${id}/`);
        if (invoices.length === 1 && pagination.currentPage > 1) {
          await fetchInvoices(pagination.currentPage - 1);
        } else {
          await fetchInvoices(pagination.currentPage);
        }
      } catch (error) {
        console.error("Error deleting invoice:", error);
      }
    }
  };

  const handleNewInvoice = () => {
    resetForm();
    setShowForm(true);
  };

  const handleAddPayment = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      amount: "",
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: "bank_transfer",
      notes: ""
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    setIsLoading(true);
    try {
      await axios.post(`api/invoices/${selectedInvoice.id}/payments/`, paymentForm);
      setShowPaymentModal(false);
      await fetchInvoices(pagination.currentPage);
    } catch (error) {
      console.error("Error submitting payment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintInvoice = (invoice) => {
    const client = clients.find(c => c.id === invoice.client_id || c.id === invoice.client);
    const clientName = client?.name || invoice.client_name || 'Unknown Client';
    const clientAddress = client?.address || '';
    const clientEmail = client?.email || '';
    const clientPhone = client?.phone || '';

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Invoice ${invoice.invoice_number}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #222; max-width: 900px; margin: 0 auto; padding: 40px 30px 20px 30px; background: #fff; }
          .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 32px; }
          .company-info h1 { font-size: 28px; color: #1f2937; margin-bottom: 5px; }
          .company-info p { color: #6b7280; font-size: 14px; margin: 0; }
          .invoice-title { text-align: right; }
          .invoice-title h2 { font-size: 32px; color: #2563eb; margin-bottom: 4px; font-weight: bold; letter-spacing: 2px; }
          .invoice-title p { font-size: 16px; color: #6b7280; margin: 0; }
          .invoice-details-row { display: flex; justify-content: space-between; margin-bottom: 32px; }
          .bill-to, .invoice-info { width: 48%; background: #f9fafb; border-left: 4px solid #2563eb; border-radius: 8px; padding: 18px; min-height: 100px; }
          .bill-to h3, .invoice-info h3 { color: #1f2937; font-size: 15px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
          .client-details p, .invoice-meta p { margin-bottom: 5px; font-size: 14px; }
          .invoice-meta p { margin: 0 0 6px 0; }
          .invoice-meta strong { min-width: 90px; display: inline-block; }
          .line-items { margin-bottom: 24px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          .items-table th { background: #f3f4f6; color: #222; padding: 10px 8px; text-align: left; font-weight: 600; font-size: 14px; border-bottom: 2px solid #e5e7eb; }
          .items-table td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
          .items-table tr:last-child td { border-bottom: none; }
          .totals { width: 350px; margin-left: auto; margin-bottom: 18px; }
          .totals-table { width: 100%; border-collapse: collapse; }
          .totals-table td { padding: 8px 12px; font-size: 15px; }
          .totals-table .balance-row { color: #9ca3af; font-weight: bold; font-size: 17px; background: #f3f4f6; }
          .notes { margin-top: 18px; padding: 18px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #6b7280; max-width: 600px; }
          .notes h4 { color: #1f2937; margin-bottom: 10px; font-size: 15px; }
          .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          @media print { body { margin: 0; padding: 15px; } .invoice-header, .invoice-details-row, .items-table, .totals, .notes { break-inside: avoid; } }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div class="company-info">
            <h1>JESH TECHNOLOGY</h1>
             <p>City: Dindigul</p>
             <p>Pin:624802</p>
             <p>Phone: 9876543131</p>
             <p>Email:Jesh@gmail.com </p>
          </div>
          <div class="invoice-title">
            <h2>INVOICE</h2>
            <p>#${invoice.invoice_number || 'N/A'}</p>
          </div>
        </div>

        <div class="invoice-details-row">
          <div class="bill-to">
            <h3>Bill To:</h3>
            <div class="client-details">
              <p><strong>${clientName}</strong></p>
              ${clientAddress ? `<p>${clientAddress}</p>` : ''}
              ${clientEmail ? `<p>Email: ${clientEmail}</p>` : ''}
              ${clientPhone ? `<p>Phone: ${clientPhone}</p>` : ''}
            </div>
          </div>
          <div class="invoice-info">
            <h3>Invoice Details:</h3>
            <div class="invoice-meta">
              <p><strong>Issue Date:</strong> ${invoice.issue_date || ''}</p>
              <p><strong>Due Date:</strong> ${invoice.due_date || ''}</p>
              <p><strong>Status:</strong> ${invoice.payment_status ? invoice.payment_status.toUpperCase() : 'PENDING'}</p>
            </div>
          </div>
        </div>

        <div class="line-items">
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${
                (invoice.line_items_data || invoice.line_items || []).map(item => `
                  <tr>
                    <td>${item.description || ''}</td>
                    <td>${item.quantity || ''}</td>
                    <td>₹${parseFloat(item.rate || 0).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                    <td>₹${parseFloat(item.amount || 0).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>
        </div>

        <div class="totals">
          <table class="totals-table">
            <tr>
              <td><strong>Subtotal:</strong></td>
              <td style="text-align:right">₹${parseFloat(invoice.subtotal || 0).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
            </tr>
            <tr>
              <td><strong>Amount Paid:</strong></td>
              <td style="text-align:right">₹${parseFloat(invoice.paid_amount ?? invoice.amount_paid ?? 0).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
            </tr>
            <tr class="balance-row">
              <td><strong>Balance Due:</strong></td>
              <td style="text-align:right">₹${parseFloat(invoice.balance || invoice.total || 0).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
            </tr>
          </table>
        </div>

        ${invoice.notes ? `
          <div class="notes">
            <h4>Notes:</h4>
            <p>${invoice.notes}</p>
          </div>
        ` : ''}

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    } else {
      alert('Please allow popups to print the invoice.');
    }
  };

  const getStatusBadge = (status, balance) => {
    const statusMap = {
      paid: {
        text: "Paid",
        icon: <CheckCircle className="w-4 h-4" />,
        color: "bg-green-100 text-green-800"
      },
      partial: {
        text: "Partial",
        icon: <AlertCircle className="w-4 h-4" />,
        color: "bg-yellow-100 text-yellow-800"
      },
      pending: {
        text: "Pending",
        icon: <Clock className="w-4 h-4" />,
        color: "bg-blue-100 text-blue-800"
      },
      overdue: {
        text: "Overdue",
        icon: <XCircle className="w-4 h-4" />,
        color: "bg-red-100 text-red-800"
      }
    };

    const numericBalance = parseFloat(balance) || 0;
    const effectiveStatus = numericBalance <= 0 ? 'paid' : (status || 'pending');

    const badge = statusMap[effectiveStatus] || statusMap.pending;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        <span className="ml-1">{badge.text}</span>
      </span>
    );
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchInvoices(page);
    }
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6 px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6 rounded-b-xl">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => goToPage(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => goToPage(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(pagination.currentPage - 1) * 3 + 1}</span> to{' '}
              <span className="font-medium">{Math.min(pagination.currentPage * 3, pagination.totalCount)}</span> of{' '}
              <span className="font-medium">{pagination.totalCount}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => goToPage(1)}
                disabled={pagination.currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">First</span>
                <ChevronsLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-1 mx-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 rounded-md ${pagination.currentPage === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => goToPage(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => goToPage(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Last</span>
                <ChevronsRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchInvoices();
    fetchClients();
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 space-y-6">
          {/* Header Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                  <Receipt className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Invoice Management
                  </h1>
                  <p className="text-gray-600 mt-1">Create and manage professional invoices</p>
                </div>
              </div>
              <button
                onClick={handleNewInvoice}
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span className="font-semibold">New Invoice</span>
                </div>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>

          {/* Invoice Form */}
          {showForm && (
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <span>{editingId ? 'Edit Invoice' : 'Create New Invoice'}</span>
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <User className="w-4 h-4" />
                      <span>Client *</span>
                    </label>
                    <div className="relative">
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                        <input
                          type="text"
                          value={clientSearch}
                          onChange={handleClientSearch}
                          onClick={() => setShowClientDropdown(prev => !prev)}
                          placeholder="Search client..."
                          className="w-full px-4 py-3 outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => fetchClients(clientSearch)}
                          className="p-2 text-gray-500 hover:text-blue-600"
                        >
                          <Search className="w-5 h-5" />
                        </button>
                      </div>
                      {showClientDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                          {isClientLoading ? (
                            <div className="p-4 text-center text-gray-500">Loading clients...</div>
                          ) : filteredClients.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No clients found</div>
                          ) : (
                            <>
                              {filteredClients.map(client => (
                                <div
                                  key={client.id}
                                  onClick={() => selectClient(client)}
                                  className="p-3 hover:bg-blue-50 cursor-pointer flex items-center space-x-3"
                                >
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <User className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{client.name}</p>
                                    <p className="text-xs text-gray-500">{client.email}</p>
                                  </div>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Hash className="w-4 h-4" />
                      <span>Invoice Number</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.invoice_number}
                        readOnly
                        className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl font-mono text-sm"
                      />
                      <div className="absolute right-3 top-3 p-1 bg-green-100 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Calendar className="w-4 h-4" />
                      <span>Issue Date *</span>
                    </label>
                    <input
                      type="date"
                      value={form.issue_date}
                      onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Clock className="w-4 h-4" />
                      <span>Due Date *</span>
                    </label>
                    <input
                      type="date"
                      value={form.due_date}
                      onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-4">
                  <label className="text-lg font-semibold text-gray-900">Line Items</label>
                  <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                    {form.line_items.map((item, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-5">
                          <input
                            type="text"
                            name="description"
                            placeholder="Item description"
                            value={item.description || ""}
                            onChange={(e) => handleLineItemChange(index, e)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <input
                            type="number"
                            name="quantity"
                            placeholder="Qty"
                            value={item.quantity || ""}
                            onChange={(e) => handleLineItemChange(index, e)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <input
                            type="number"
                            step="0.0"
                            name="rate"
                            placeholder="Rate"
                            value={item.rate || ""}
                            onChange={(e) => handleLineItemChange(index, e)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            value={`₹${item.amount || ""}`}
                            readOnly
                            className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl font-semibold text-blue-800"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <button
                            type="button"
                            onClick={() => removeLineItem(index)}
                            className="w-full p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            disabled={form.line_items.length === 1}
                          >
                            <Trash2 className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addLineItem}
                      className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-600 hover:text-blue-600 rounded-xl transition-colors flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Line Item</span>
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    rows={3}
                    placeholder="Additional notes or terms..."
                  />
                </div>

                {/* Totals */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Subtotal</label>
                      <input
                        type="text"
                        value={`₹${form.subtotal ||"0.00"}`}
                        readOnly
                        className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl font-semibold text-blue-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Payment Status</label>
                      <select
                        value={form.payment_status}
                        onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="pending">Pending</option>
                        <option value="partial">Partial</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Paid Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={form.paid_amount}
                        onChange={(e) => setForm({ ...form, paid_amount: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Total</label>
                      <input
                        type="text"
                        value={`₹${form.total || "0.00"}`}
                        readOnly
                        className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-xl font-semibold text-green-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Balance</label>
                      <input
                        type="text"
                        value={`₹${form.balance || "0.00"}`}
                        readOnly
                        className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-xl font-semibold text-red-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{editingId ? 'Update Invoice' : 'Save Invoice'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Payment Modal */}
          {showPaymentModal && selectedInvoice && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Record Payment</h3>
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Invoice #</label>
                      <div className="px-4 py-2 bg-gray-100 rounded-xl font-mono">
                        {selectedInvoice.invoice_number}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Balance Due</label>
                      <div className="px-4 py-2 bg-gray-100 rounded-xl font-mono">
                        ₹{parseFloat(selectedInvoice.balance || 0).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter payment amount"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
                      <input
                        type="date"
                        value={paymentForm.payment_date}
                        onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                      <select
                        value={paymentForm.payment_method}
                        onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="credit_card">Credit Card</option>
                        <option value="cash">Cash</option>
                        <option value="check">Check</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={paymentForm.notes}
                        onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                        placeholder="Payment reference or notes"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handlePaymentSubmit}
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      <span>Record Payment</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invoice List */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Invoices</h2>
            </div>
            {isLoading && invoices.length === 0 ? (
              <div className="p-12 text-center">
                <div className="inline-block h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-gray-600">Loading invoices...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No invoices</h3>
                <p className="mt-1 text-gray-500">Get started by creating a new invoice.</p>
                <div className="mt-6">
                  <button
                    onClick={handleNewInvoice}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    New Invoice
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice #
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th> */}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoices.map((invoice) => {
                        const client = clients.find(c => c.id === invoice.client_id || c.id === invoice.client);
                        const clientName = client?.name || invoice.client_name || 'Unknown Client';
                        
                        return (
                          <tr key={invoice.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Receipt className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 font-mono">{invoice.invoice_number}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{clientName}</div>
                              <div className="text-sm text-gray-500">{client?.email || ''}</div>
                            </td>
                            {/* <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{invoice.issue_date}</div>
                            </td> */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{invoice.due_date}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                ₹{parseFloat(invoice.total || 0).toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(invoice.payment_status, invoice.balance)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handlePrintInvoice(invoice)}
                                  className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50"
                                  title="Print"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>
                                {parseFloat(invoice.balance || 0) > 0 && (
                                  <button
                                    onClick={() => handleAddPayment(invoice)}
                                    className="text-gray-500 hover:text-green-600 p-2 rounded-full hover:bg-green-50"
                                    title="Add Payment"
                                  >
                                    <CreditCard className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleEdit(invoice.id)}
                                  className="text-gray-500 hover:text-yellow-600 p-2 rounded-full hover:bg-yellow-50"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(invoice.id)}
                                  className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {renderPagination()}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}








