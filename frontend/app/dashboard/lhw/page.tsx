import DashboardLayout from '@/components/layouts/DashboardLayout'
import LHWDashboard from '@/components/dashboards/LHWDashboard'

export default function LHWDashboardPage() {
    return (
        <DashboardLayout role="lhw">
            <LHWDashboard />
        </DashboardLayout>
    )
}
