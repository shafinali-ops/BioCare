import DashboardLayout from '@/components/layouts/DashboardLayout'
import PatientDashboard from '@/components/dashboards/PatientDashboard'

export default function PatientDashboardPage() {
  return (
    <DashboardLayout role="patient">
      <PatientDashboard />
    </DashboardLayout>
  )
}

