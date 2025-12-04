import DashboardLayout from '@/components/layouts/DashboardLayout'
import DoctorDashboard from '@/components/dashboards/DoctorDashboard'

export default function DoctorDashboardPage() {
  return (
    <DashboardLayout role="doctor">
      <DoctorDashboard />
    </DashboardLayout>
  )
}

