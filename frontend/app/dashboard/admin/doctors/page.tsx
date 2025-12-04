'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { adminService, Doctor } from '@/services/adminService'
import { toast } from 'react-toastify'

interface DoctorFormData {
  name: string
  email: string
  password: string
  specialization: string
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'blocked'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [formData, setFormData] = useState<DoctorFormData>({
    name: '',
    email: '',
    password: '',
    specialization: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    fetchDoctors()
  }, [])

  useEffect(() => {
    filterData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctors, filter, searchQuery])

  const fetchDoctors = async () => {
    try {
      const data = await adminService.getAllDoctors()
      setDoctors(data)
      setFilteredDoctors(data)
    } catch (error: any) {
      toast.error('Failed to fetch doctors')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filterData = () => {
    let filtered = [...doctors]

    // Status filter
    if (filter !== 'all') {
      filtered = filtered.filter(d => d.status === filter)
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(doctor =>
        doctor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredDoctors(filtered)
    setCurrentPage(1)
  }

  // CREATE
  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await adminService.createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'doctor',
        specialization: formData.specialization
      })
      toast.success('Doctor created successfully!')
      setShowCreateModal(false)
      resetForm()
      fetchDoctors()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create doctor')
    }
  }

  // UPDATE - Approve
  const handleApprove = async (doctorId: string) => {
    try {
      await adminService.approveDoctor(doctorId)
      toast.success('Doctor approved successfully!')
      fetchDoctors()
    } catch (error: any) {
      toast.error('Failed to approve doctor')
    }
  }

  // UPDATE - Reject
  const handleReject = async (doctorId: string) => {
    try {
      await adminService.rejectDoctor(doctorId)
      toast.success('Doctor rejected!')
      fetchDoctors()
    } catch (error: any) {
      toast.error('Failed to reject doctor')
    }
  }

  // UPDATE - Block
  const handleBlock = async (doctor: Doctor) => {
    if (!confirm(`Are you sure you want to block Dr. ${doctor.name}?`)) return

    try {
      await adminService.blockUser(doctor.userId._id)
      toast.success('Doctor blocked successfully!')
      fetchDoctors()
    } catch (error: any) {
      toast.error('Failed to block doctor')
    }
  }

  // UPDATE - Unblock
  const handleUnblock = async (doctor: Doctor) => {
    try {
      await adminService.unblockUser(doctor.userId._id)
      toast.success('Doctor unblocked successfully!')
      fetchDoctors()
    } catch (error: any) {
      toast.error('Failed to unblock doctor')
    }
  }

  // DELETE
  const handleDeleteDoctor = async (doctor: Doctor) => {
    if (!confirm(`Are you sure you want to delete Dr. ${doctor.name}? This action cannot be undone.`)) return

    try {
      await adminService.manageUsers(doctor.userId._id, 'delete')
      toast.success('Doctor deleted successfully!')
      fetchDoctors()
    } catch (error: any) {
      toast.error('Failed to delete doctor')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      specialization: ''
    })
  }

  // Get counts for each status
  const pendingCount = doctors.filter(d => d.status === 'pending').length
  const approvedCount = doctors.filter(d => d.status === 'approved').length
  const rejectedCount = doctors.filter(d => d.status === 'rejected').length
  const blockedCount = doctors.filter(d => d.status === 'blocked').length

  // Pagination
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentDoctors = filteredDoctors.slice(startIndex, endIndex)

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading doctors...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="p-4 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Doctor Management</h1>
            <p className="text-sm text-gray-500">Approve and manage doctor accounts</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Doctor
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="p-3 flex items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                All ({doctors.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'approved' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                Approved ({approvedCount})
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'rejected' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                Rejected ({rejectedCount})
              </button>
              <button
                onClick={() => setFilter('blocked')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'blocked' ? 'bg-gray-50 text-gray-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                Blocked ({blockedCount})
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Doctor Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Hospital
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentDoctors.length > 0 ? (
                  currentDoctors.map((doctor) => (
                    <tr key={doctor._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                            {doctor.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'DR'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">Dr. {doctor.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">D{doctor._id.slice(-5).toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{doctor.specialization || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{doctor.userId?.email || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{doctor.hospitalId?.name || 'Not assigned'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${doctor.status === 'approved' ? 'bg-green-50 text-green-700' :
                          doctor.status === 'rejected' ? 'bg-red-50 text-red-700' :
                            doctor.status === 'blocked' ? 'bg-gray-50 text-gray-700' :
                              'bg-yellow-50 text-yellow-700'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${doctor.status === 'approved' ? 'bg-green-600' :
                            doctor.status === 'rejected' ? 'bg-red-600' :
                              doctor.status === 'blocked' ? 'bg-gray-600' :
                                'bg-yellow-600'
                            }`}></span>
                          {doctor.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {doctor.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(doctor._id)}
                                className="text-green-600 hover:text-green-800 text-xs font-medium"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(doctor._id)}
                                className="text-red-600 hover:text-red-800 text-xs font-medium"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {doctor.status === 'approved' && (
                            <button
                              onClick={() => handleBlock(doctor)}
                              className="text-gray-600 hover:text-gray-800 text-xs font-medium"
                            >
                              Block
                            </button>
                          )}
                          {doctor.status === 'blocked' && (
                            <button
                              onClick={() => handleUnblock(doctor)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              Unblock
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteDoctor(doctor)}
                            className="text-red-600 hover:text-red-800 text-xs font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-sm font-medium text-gray-500">No doctors found</p>
                        <p className="text-xs text-gray-400">
                          {filter === 'all' ? 'No doctors registered yet' : `No ${filter} doctors`}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredDoctors.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-xs text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredDoctors.length)} of {filteredDoctors.length} entries
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${currentPage === page ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create Doctor Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Add New Doctor</h2>
                  <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleCreateDoctor} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Dr. John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="doctor@hospital.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Specialization</label>
                    <input
                      type="text"
                      required
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Cardiology"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setShowCreateModal(false); resetForm(); }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 text-sm"
                    >
                      Add Doctor
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
