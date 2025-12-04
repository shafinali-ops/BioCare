import DashboardLayout from '@/components/layouts/DashboardLayout';
import PatientMessagesList from '@/components/chat/PatientMessagesList';

export default function MessagesPage() {
    return (
        <DashboardLayout role="patient">
            <PatientMessagesList />
        </DashboardLayout>
    );
}
