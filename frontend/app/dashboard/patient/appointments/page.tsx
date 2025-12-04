import DashboardLayout from '@/components/layouts/DashboardLayout';
import PatientAppointments from '@/components/patient/PatientAppointments';

export default function AppointmentsPage() {
  return (
    <DashboardLayout role="patient">
      <PatientAppointments />
    </DashboardLayout>
  );
}
