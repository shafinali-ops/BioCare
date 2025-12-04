export interface User {
  id: number | string
  _id?: string
  email: string
  password?: string
  role: 'admin' | 'doctor' | 'patient'
  name?: string
}

export interface Admin extends User {
  id: number | string
  name: string
  role: 'admin'
}

export interface Doctor extends User {
  id: number | string
  name: string
  specialization: string
  availability: TimeSlot[]
  role: 'doctor'
}

export interface Patient extends User {
  id: number | string
  _id?: string
  userId?: {
    _id: string
    id?: string
    email: string
    name: string
  }
  name: string
  age: number
  gender: string
  medicalHistory: MedicalRecord[]
  role: 'patient'
}

export interface TimeSlot {
  from: string
  to: string
}

export interface Hospital {
  id: number
  name: string
  location: string
  specialization: string[]
}

export interface Consultation {
  _id: string
  id?: string
  patientId: Patient | string
  doctorId: Doctor | string
  appointmentId: Appointment | string
  consultation_date: string
  symptoms: string[]
  diagnosis?: string
  doctor_notes?: string
  recommended_tests?: string[]
  consultation_status: 'not_started' | 'in-progress' | 'completed'
  status?: string
}

export interface Prescription {
  _id: string
  id?: string
  consultationId: Consultation | string
  doctorId: Doctor | string
  patientId: Patient | string
  medicines: {
    medicine_name: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
  }[]
  follow_up_date?: string
  prescription_date: string
  instructions?: string
  status: 'active' | 'expired' | 'cancelled'
}

export interface Appointment {
  _id: string
  id?: string
  patientId: Patient | string
  doctorId: Doctor | string
  date: string
  time?: string
  startTime?: string
  endTime?: string
  reason_for_visit?: string
  reason?: string
  status: 'pending' | 'approved' | 'scheduled' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
}

export interface Notification {
  id: number | string
  userId: number
  message: string
  date: string
  read?: boolean
}

export interface MedicalRecord {
  condition: string
  date: string
  notes?: string
}

export interface HealthRecord {
  _id: string
  id?: string
  type: string
  date: string
  notes?: string
  data?: any
}

export interface Medication {
  name: string
  dosage: string
  frequency: string
  duration?: string
}

export interface Diagnosis {
  input_symptoms: string[]
  symptom_severity_analysis: {
    [symptom: string]: 'mild' | 'moderate' | 'severe'
  }
  possible_conditions: {
    name: string
    confidence: 'low' | 'medium' | 'high'
  }[]
  triage_level: 'low' | 'medium' | 'high' | 'critical'
  urgency_category: string
  is_emergency: boolean
  home_care_advice: string[]
  avoid_these: string[]
  recommended_otc_medicines: {
    name: string
    dosage_note: string
  }[]
  warning_signs_to_monitor: string[]
  when_to_visit_doctor: string[]
  recommendation: string
  urgency_statement: string
  consult_doctor_immediately: boolean
}

export interface UrgencyLevel {
  level: 'low' | 'medium' | 'high' | 'critical'
  message: string
}

export interface SymptomCheckHistory extends Diagnosis {
  _id: string
  patientId: string | Patient
  userId: string
  check_date?: string
  createdAt: string
  updatedAt: string
}

export interface ChatbotAIResponse {
  patient_query: string
  language_detected: 'en' | 'ur'
  symptoms_detected: string[]
  symptom_explanations?: Record<string, string>
  report_summary?: string
  risk_factors_detected?: string[]
  lifestyle_factors?: string[]
  possible_conditions: {
    name: string
    confidence: 'low' | 'medium' | 'high'
    why_suspected?: string
    explanation?: string
  }[]
  triage_level: 'low' | 'medium' | 'high' | 'critical'
  urgency_category: 'routine-care' | 'urgent-care' | 'emergency'
  is_emergency: boolean
  home_care_advice: string[]
  avoid_these: string[]
  recommended_otc_medicines: {
    name: string
    dosage_note: string
  }[]
  warning_signs_to_monitor: string[]
  when_to_visit_doctor: string[]
  daily_life_impact?: string[]
  health_tips?: string[]
  appointment_reminder?: {
    suggested_follow_up: string
    type: string
    reason: string
  }
  recommendation: string
  urgency_statement: string
  consult_doctor_immediately: boolean
  response_text: string
}

export interface ChatMessage {
  _id: string
  userId: string
  patientId?: string
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  messageType: 'text' | 'voice' | 'file'
  language?: string
  attachments?: {
    filename: string
    filepath: string
    fileType: string
    extractedText?: string
  }[]
  aiResponse?: ChatbotAIResponse
  vectorId?: string
  audioPath?: string
  timestamp?: string
  createdAt: string
  updatedAt: string
}

export interface ChatSession {
  _id: string
  lastMessage: string
  lastMessageTime: string
  messageCount: number
}
