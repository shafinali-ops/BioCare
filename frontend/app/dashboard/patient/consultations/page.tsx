'use client';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import PatientConsultations from '@/components/patient/PatientConsultations';

export default function ConsultationsPage() {
    return (
        <DashboardLayout role="patient">
            <PatientConsultations />
        </DashboardLayout>
    );
}
