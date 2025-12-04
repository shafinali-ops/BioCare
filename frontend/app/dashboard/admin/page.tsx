import DashboardLayout from '@/components/layouts/DashboardLayout'
import AdminDashboard from '@/components/dashboards/AdminDashboard'

export default function AdminDashboardPage() {
  return (
    <DashboardLayout role="admin">
      <AdminDashboard />
    </DashboardLayout>
  )
}

