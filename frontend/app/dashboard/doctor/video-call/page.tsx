import DashboardLayout from '@/components/layouts/DashboardLayout';
import DoctorCallInterface from '@/components/video/DoctorCallInterface';

export default function DoctorVideoCallPage() {
  return (
    <DashboardLayout role="doctor">
      <DoctorCallInterface />
    </DashboardLayout>
  );
}
