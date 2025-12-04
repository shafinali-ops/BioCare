import DashboardLayout from '@/components/layouts/DashboardLayout';
import PatientCallInterface from '@/components/video/PatientCallInterface';

export default function PatientVideoCallPage() {
  return (
    <DashboardLayout role="patient">
      <PatientCallInterface />
    </DashboardLayout>
  );
}
