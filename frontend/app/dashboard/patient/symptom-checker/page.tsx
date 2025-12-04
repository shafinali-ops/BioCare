import DashboardLayout from '@/components/layouts/DashboardLayout'
import SymptomChecker from '@/components/features/SymptomChecker'

export default function SymptomCheckerPage() {
  return (
    <DashboardLayout role="patient">
      <div className="px-4 py-6">
        <SymptomChecker />
      </div>
    </DashboardLayout>
  )
}

