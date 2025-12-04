import DashboardLayout from '@/components/layouts/DashboardLayout';
import PatientChat from '@/components/chat/PatientChat';

export default function PatientChatPage() {
  return (
    <DashboardLayout role="patient">
      <PatientChat />
    </DashboardLayout>
  );
}
