'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { doctorService } from '@/services/doctorService'
import { toast } from 'react-toastify'

interface TimeSlot {
  from: string
  to: string
}

export default function DoctorAvailabilityPage() {
  const [slots, setSlots] = useState<TimeSlot[]>([
    { from: '', to: '' },
  ])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const updateSlot = (index: number, field: keyof TimeSlot, value: string) => {
    const next = [...slots]
    next[index][field] = value
    setSlots(next)
  }

  const addSlot = () => {
    setSlots([...slots, { from: '', to: '' }])
  }

  const removeSlot = (index: number) => {
    if (slots.length === 1) return
    setSlots(slots.filter((_, i) => i !== index))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('📅 Saving availability...');
    console.log('Selected date:', selectedDate);
    console.log('All slots:', slots);

    const cleaned = slots.filter(s => s.from && s.to)

    console.log('Cleaned slots:', cleaned);
    console.log('Cleaned slots count:', cleaned.length);

    if (cleaned.length === 0) {
      console.error('❌ No valid slots to save');
      toast.error('Please add at least one time slot.')
      return
    }

    setSaving(true)
    try {
      console.log('🚀 Calling doctorService.scheduleAvailability...');
      console.log('Parameters:', { slots: cleaned, date: selectedDate || undefined });

      const result = await doctorService.scheduleAvailability(cleaned, selectedDate || undefined)

      console.log('✅ Save successful:', result);
      toast.success(selectedDate ? 'Date-specific availability saved' : 'Weekly availability saved')
    } catch (err: any) {
      console.error('❌ Save failed:', err);
      console.error('Error response:', err.response?.data);
      toast.error(err.response?.data?.message || 'Failed to save availability')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout role="doctor">
      <div className="px-4 py-6 space-y-8 bg-slate-50">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Availability
            </h1>
            <p className="text-sm text-slate-500">
              Set your time slots. Select a date for specific availability, or leave blank for weekly default.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <form onSubmit={handleSave} className="space-y-6">

            {/* Date Selection */}
            <div className="bg-primary-50 p-4 rounded-xl border border-primary-100">
              <label className="block text-sm font-bold text-blue-900 mb-2">
                Select Date (Optional)
              </label>
              <p className="text-xs text-blue-700 mb-3">
                Pick a specific date to set availability for that day only. Leave blank to set your general weekly schedule.
              </p>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full md:w-1/3 px-4 py-2 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-3">
              {slots.map((slot, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row md:items-center gap-3 bg-slate-50 rounded-xl p-3"
                >
                  <div className="flex-1 flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        From
                      </label>
                      <input
                        type="time"
                        value={slot.from}
                        onChange={(e) => updateSlot(index, 'from', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        To
                      </label>
                      <input
                        type="time"
                        value={slot.to}
                        onChange={(e) => updateSlot(index, 'to', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSlot(index)}
                    className="text-xs text-red-500 hover:text-red-600 self-start md:self-center"
                    disabled={slots.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={addSlot}
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                + Add another slot
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save Availability'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}