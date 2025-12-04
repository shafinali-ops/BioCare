'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { prescriptionService, Medicine } from '@/services/prescriptionService';

interface PrescriptionFormProps {
    consultationId: string;
    onSuccess?: () => void;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ consultationId, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const { register, control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            medicines: [{ medicine_name: '', dosage: '', duration: '', frequency: '', instructions: '' }],
            instructions: '',
            follow_up_date: ''
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "medicines"
    });

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);

            // Filter out medicines with empty names
            const medicines = data.medicines.filter((m: Medicine) => m.medicine_name.trim() !== '');

            if (medicines.length === 0) {
                toast.error('Please add at least one medicine');
                return;
            }

            await prescriptionService.createPrescription({
                consultationId,
                medicines,
                follow_up_date: data.follow_up_date || undefined,
                instructions: data.instructions
            });

            toast.success('Prescription created successfully');

            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create prescription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Create Prescription</h3>

            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="p-4 bg-gray-50 rounded-lg space-y-3 relative">
                        {fields.length > 1 && (
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            >
                                <FaTrash size={14} />
                            </button>
                        )}

                        <div>
                            <input
                                {...register(`medicines.${index}.medicine_name` as const, {
                                    required: 'Medicine name is required'
                                })}
                                placeholder="Medicine Name *"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                            {errors.medicines?.[index]?.medicine_name && (
                                <span className="text-red-500 text-xs">
                                    {errors.medicines[index]?.medicine_name?.message}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <input
                                    {...register(`medicines.${index}.dosage` as const, {
                                        required: 'Dosage is required'
                                    })}
                                    placeholder="Dosage (e.g., 500mg) *"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                                {errors.medicines?.[index]?.dosage && (
                                    <span className="text-red-500 text-xs">Required</span>
                                )}
                            </div>
                            <div>
                                <input
                                    {...register(`medicines.${index}.frequency` as const, {
                                        required: 'Frequency is required'
                                    })}
                                    placeholder="Frequency (e.g., 2x/day) *"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                                {errors.medicines?.[index]?.frequency && (
                                    <span className="text-red-500 text-xs">Required</span>
                                )}
                            </div>
                            <div>
                                <input
                                    {...register(`medicines.${index}.duration` as const, {
                                        required: 'Duration is required'
                                    })}
                                    placeholder="Duration (e.g., 5 days) *"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                                {errors.medicines?.[index]?.duration && (
                                    <span className="text-red-500 text-xs">Required</span>
                                )}
                            </div>
                        </div>

                        <input
                            {...register(`medicines.${index}.instructions` as const)}
                            placeholder="Special instructions (optional)"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={() => append({ medicine_name: '', dosage: '', duration: '', frequency: '', instructions: '' })}
                className="flex items-center text-sm text-blue-600 hover:text-blue-500"
            >
                <FaPlus className="mr-1" /> Add Another Medicine
            </button>

            <div>
                <label className="block text-sm font-medium text-gray-700">General Instructions</label>
                <textarea
                    {...register('instructions')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    placeholder="General instructions for the patient"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Follow-up Date (Optional)</label>
                <input
                    type="date"
                    {...register('follow_up_date')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
                {loading ? 'Creating...' : 'Create Prescription'}
            </button>
        </form>
    );
};

export default PrescriptionForm;
