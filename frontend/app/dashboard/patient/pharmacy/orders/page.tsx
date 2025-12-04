'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { pharmacyService } from '@/services/pharmacyService'
import { useTheme, themes } from '@/contexts/ThemeContext'
import { toast } from 'react-toastify'

interface Order {
  _id: string
  id: string
  patientId: string
  medications: Array<{
    medicationId: string
    name: string
    quantity: number
    price: number
  }>
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  date: string
}

export default function PharmacyOrdersPage() {
  const { theme } = useTheme()
  const themeColors = themes[theme]
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered'>('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      // This would typically come from an orders endpoint
      // For now, we'll create a mock structure
      setOrders([])
    } catch (error: any) {
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter)

  if (loading) {
    return (
      <DashboardLayout role="patient">
        <div className="text-center py-12">Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="patient">
      <div className="px-4 py-6">
        {/* Hero Section */}
        <div className="relative mb-8 overflow-hidden rounded-3xl">
          <div className={`absolute inset-0 bg-gradient-to-r ${themeColors.primary}`}></div>
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative text-white p-8 md:p-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3">Order History</h1>
                <p className="text-xl opacity-90">Track your medication orders</p>
              </div>
              <div className="hidden md:block text-8xl opacity-20">📦</div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className={`${themeColors.card} rounded-2xl shadow-xl p-6 mb-8 border-2 ${themeColors.border}`}>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'processing', 'shipped', 'delivered'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl font-semibold transition ${filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} (
                {status === 'all' ? orders.length : orders.filter(o => o.status === status).length})
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className={`${themeColors.card} rounded-2xl shadow-xl p-12 text-center border-2 ${themeColors.border}`}>
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-4">You haven&apos;t placed any orders yet</p>
              <a
                href="/dashboard/patient/pharmacy"
                className={`${themeColors.button} text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition inline-block`}
              >
                Browse Medications
              </a>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order._id || order.id}
                className={`${themeColors.card} rounded-2xl shadow-xl p-6 border-2 ${themeColors.border} hover:shadow-2xl transition-all`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">Order #{order._id || order.id}</h3>
                      <span className={`px-3 py-1 text-xs rounded-full font-semibold ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-primary-100 text-primary-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                        }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      <span className="font-semibold">Date:</span> {new Date(order.date).toLocaleDateString()}
                    </p>
                    <div className="mb-2">
                      <p className="font-semibold text-gray-900 mb-1">Medications:</p>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {order.medications.map((med, index) => (
                          <li key={index}>
                            {med.name} - Quantity: {med.quantity} - ${med.price.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      Total: ${order.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

