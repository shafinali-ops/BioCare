'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { consultationService } from '@/services/consultationService';
import PrescriptionForm from './PrescriptionForm';

interface ConsultationFormProps {
    appointmentId: string;
    onSuccess?: () => void;
}

const ConsultationForm: React.FC<ConsultationFormProps> = ({ appointmentId, onSuccess }) => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [consultationId, setConsultationId] = useState<string | null>(null);
    const [showPrescription, setShowPrescription] = useState(false);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);

            // Convert symptoms to array if it's a string
            const symptoms = data.symptoms.split(',').map((s: string) => s.trim()).filter(Boolean);
            const recommended_tests = data.recommended_tests
                ? data.recommended_tests.split(',').map((t: string) => t.trim()).filter(Boolean)
                : [];

            const response = await consultationService.createConsultation({
                appointmentId,
                symptoms,
                doctor_notes: data.doctor_notes,
                diagnosis: data.diagnosis,
                recommended_tests
            });

            setConsultationId(response.consultation._id);
            toast.success('Consultation saved successfully');
            setShowPrescription(true);

            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save consultation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {!showPrescription ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Symptoms <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            {...register('symptoms', { required: 'Symptoms are required' })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            rows={3}
                            placeholder="Enter symptoms separated by commas"
                        />
                        {errors.symptoms && (
                            <span className="text-red-500 text-sm">{errors.symptoms.message as string}</span>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Diagnosis <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            {...register('diagnosis', { required: 'Diagnosis is required' })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            rows={3}
                        />
                        {errors.diagnosis && (
                            <span className="text-red-500 text-sm">{errors.diagnosis.message as string}</span>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Doctor Notes</label>
                        <textarea
                            {...register('doctor_notes')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Recommended Tests</label>
                        <textarea
                            {...register('recommended_tests')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            rows={2}
                            placeholder="Enter tests separated by commas"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save & Continue to Prescription'}
                    </button>
                </form>
            ) : (
                <PrescriptionForm consultationId={consultationId!} />
            )}
        </div>
    );
};

export default ConsultationForm;
