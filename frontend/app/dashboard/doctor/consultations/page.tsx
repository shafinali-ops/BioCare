'use client';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import DoctorConsultations from '@/components/doctor/DoctorConsultations';

export default function DoctorConsultationsPage() {
    return (
        <DashboardLayout role="doctor">
            <DoctorConsultations />
        </DashboardLayout>
    );
}
