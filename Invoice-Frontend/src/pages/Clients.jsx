//  this code is  using pagination like 1,2,3....//

import { useEffect, useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast } from "lucide-react";

export default function Clients() {
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    results: [],
  });

  const clients = pagination.results;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    company_name: "",
    address: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchClients = async (pageNumber = 1) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`api/clients/?page=${pageNumber}`);
      setPagination(res.data);
      setPage(pageNumber);
      
      // Calculate total pages based on actual results length
      const itemsPerPage = res.data.results.length;
      setTotalPages(Math.ceil(res.data.count / Math.max(1, itemsPerPage)));
      
      setError(null);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setError("Failed to fetch clients. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (editingId) {
        await axios.put(`api/clients/${editingId}/`, form);
        setSuccess("Client updated successfully!");
      } else {
        await axios.post('api/clients/', form);
        setSuccess("Client created successfully!");
      }
      
      setForm({
        name: "",
        email: "",
        phone_number: "",
        company_name: "",
        address: "",
      });
      setEditingId(null);
      fetchClients(page);
    } catch (error) {
      console.error("Error saving client:", error);
      setError(error.response?.data?.message || "Failed to save client. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (client) => {
    setForm({
      name: client.name,
      email: client.email,
      phone_number: client.phone_number,
      company_name: client.company_name,
      address: client.address,
    });
    setEditingId(client.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`api/clients/${id}/`);
      setSuccess("Client deleted successfully!");
      
      // Handle page adjustment if last item on page is deleted
      if (clients.length === 1 && page > 1) {
        fetchClients(page - 1);
      } else {
        fetchClients(page);
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      setError("Failed to delete client. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: "",
      email: "",
      phone_number: "",
      company_name: "",
      address: "",
    });
    setEditingId(null);
    setError(null);
    setSuccess(null);
  };

  const goToPage = (pageNumber) => {
    if (!isLoading && pageNumber >= 1 && pageNumber <= totalPages) {
      fetchClients(pageNumber);
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

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">👥</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
                <p className="text-gray-600">Manage your client database</p>
              </div>
            </div>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
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

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingId ? "Edit Client" : "Add New Client"}
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["name", "email", "phone_number", "company_name", "address"].map((field) => (
                  <div key={field} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {field.replace("_", " ")}
                    </label>
                    <input
                      type={field === "email" ? "email" : "text"}
                      placeholder={`Enter ${field.replace("_", " ")}`}
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required={field !== "company_name" && field !== "address"}
                    />
                  </div>
                ))}
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>{editingId ? "Update Client" : "Add Client"}</span>
                  {isLoading && (
                    <div className="w-2 h-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-600 transition-all duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Clients Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 font-semibold text-gray-900 text-sm uppercase tracking-wider">
              Clients List
            </div>
            {isLoading && clients.length === 0 ? (
              <div className="p-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : clients.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No clients found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-700">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-6">Name</th>
                      <th className="py-3 px-6">Email</th>
                      <th className="py-3 px-6">Phone</th>
                      <th className="py-3 px-6">Company Name</th>
                      <th className="py-3 px-6">Address</th>
                      <th className="py-3 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="py-4 px-6">{client.name}</td>
                        <td className="py-4 px-6">{client.email}</td>
                        <td className="py-4 px-6">{client.phone_number}</td>
                        <td className="py-4 px-6">{client.company_name}</td>
                        <td className="py-4 px-6">{client.address}</td>
                        <td className="py-4 px-6 flex justify-center space-x-4">
                          <button
                            onClick={() => handleEdit(client)}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(client.id)}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Enhanced Pagination */}
            {clients.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200 gap-4">
                <div className="text-sm text-gray-700">
                  Showing {(page - 1) * pagination.results.length + 1} to{' '}
                  {Math.min(page * pagination.results.length, pagination.count)} of{' '}
                  {pagination.count} clients
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={page === 1 || isLoading}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <ChevronFirst className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={!pagination.previous || isLoading}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {getPageNumbers().map((pageNumber, index) => (
                    <button
                      key={index}
                      onClick={() => typeof pageNumber === 'number' ? goToPage(pageNumber) : null}
                      disabled={pageNumber === '...' || isLoading}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                        pageNumber === page 
                          ? 'bg-blue-600 text-white' 
                          : 'border border-gray-300 hover:bg-gray-50'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={!pagination.next || isLoading}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={page === totalPages || isLoading}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <ChevronLast className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}






