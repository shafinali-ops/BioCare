'use client'

import { useState, useEffect, useRef } from 'react'
import { chatbotService } from '@/services/chatbotService'
import { ChatMessage, ChatbotAIResponse } from '@/types'
import { toast } from 'react-toastify'

export default function EnhancedChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [sessionId, setSessionId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [language, setLanguage] = useState<'en' | 'ur' | 'auto'>('auto')
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [sessions, setSessions] = useState<any[]>([])
  const [showSessions, setShowSessions] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadSessions = async () => {
    try {
      const response = await chatbotService.getSessions()
      if (response.success) {
        setSessions(response.sessions)
      }
    } catch (error) {
      console.error('Failed to load sessions:', error)
    }
  }

  const loadSession = async (sid: string) => {
    try {
      const response = await chatbotService.getChatHistory(sid)
      if (response.success) {
        setMessages(response.messages)
        setSessionId(sid)
        setShowSessions(false)
      }
    } catch (error) {
      toast.error('Failed to load session')
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = inputMessage
    setInputMessage('')
    setLoading(true)

    // Add user message to UI immediately
    const tempUserMsg: ChatMessage = {
      _id: Date.now().toString(),
      userId: '',
      sessionId: sessionId || '',
      role: 'user',
      content: userMessage,
      messageType: 'text',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempUserMsg])

    try {
      const response = await chatbotService.sendMessage(userMessage, sessionId, language)

      if (response.success) {
        setSessionId(response.sessionId)
        // Replace temp message with actual saved message and add AI response
        setMessages(prev => [
          ...prev.filter(m => m._id !== tempUserMsg._id),
          response.message.role === 'user' ? response.message : tempUserMsg,
          ...(response.message.role === 'assistant' ? [response.message] : [])
        ])

        // Reload sessions to update sidebar
        loadSessions()
      }
    } catch (error: any) {
      toast.error('Failed to send message')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    setShowFileUpload(false)

    try {
      const response = await chatbotService.uploadFile(file, sessionId)

      if (response.success) {
        setSessionId(response.sessionId)

        // Add file message and AI response
        const fileMsg: ChatMessage = {
          _id: Date.now().toString(),
          userId: '',
          sessionId: response.sessionId,
          role: 'user',
          content: `Uploaded: ${file.name}`,
          messageType: 'file',
          attachments: [{
            filename: file.name,
            filepath: '',
            fileType: file.type
          }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        setMessages(prev => [...prev, fileMsg, response.message])
        toast.success('File analyzed successfully!')
        loadSessions()
      }
    } catch (error) {
      toast.error('Failed to upload file')
      console.error(error)
    } finally {
      setUploadingFile(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await transcribeAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      toast.info('Recording started...')
    } catch (error) {
      toast.error('Failed to access microphone')
      console.error(error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    setLoading(true)
    try {
      const response = await chatbotService.transcribeVoice(audioBlob, sessionId)

      if (response.success && response.transcription) {
        setInputMessage(response.transcription)
        toast.success('Voice transcribed!')
      }
    } catch (error) {
      toast.error('Failed to transcribe voice')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const playTextToSpeech = async (text: string) => {
    try {
      const audioBlob = await chatbotService.textToSpeech(text)
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audio.play()
    } catch (error) {
      toast.error('Failed to play audio')
      console.error(error)
    }
  }

  const newChat = () => {
    setMessages([])
    setSessionId('')
    setInputMessage('')
  }

  const getTriageLevelColor = (level?: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 dark:bg-red-900/20 border-red-500'
      case 'high': return 'bg-orange-100 dark:bg-orange-900/20 border-orange-500'
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-500'
      case 'low': return 'bg-green-100 dark:bg-green-900/20 border-green-500'
      default: return 'bg-gray-100 dark:bg-gray-700 border-gray-300'
    }
  }

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      {/* Sessions Sidebar */}
      <div className={`${showSessions ? 'w-64' : 'w-12'} transition-all duration-300 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col`}>
        <button
          onClick={() => setShowSessions(!showSessions)}
          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg transition"
        >
          <span className="text-2xl">{showSessions ? '◀' : '▶'}</span>
        </button>

        {showSessions && (
          <div className="flex-1 overflow-y-auto p-3">
            <button
              onClick={newChat}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition mb-4 font-semibold"
            >
              + New Chat
            </button>

            <h3 className="font-bold text-sm text-gray-600 dark:text-gray-400 mb-2">Recent Sessions</h3>
            <div className="space-y-2">
              {sessions.map((session) => (
                <button
                  key={session._id}
                  onClick={() => loadSession(session._id)}
                  className={`w-full text-left p-3 rounded-lg transition ${sessionId === session._id
                    ? 'bg-primary-100 dark:bg-primary-900/20 border-l-4 border-primary-600'
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                >
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {session.lastMessage.substring(0, 30)}...
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(session.lastMessageTime).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span>🤖</span>
              AI Medical Assistant
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">24/7 Medical Guidance & Support</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
            >
              <option value="auto">Auto Detect</option>
              <option value="en">English</option>
              <option value="ur">اردو (Urdu)</option>
            </select>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👋</div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                Welcome to AI Medical Assistant
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Ask me about symptoms, upload medical reports, or use voice input
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-3xl mb-2">💬</div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Text Chat</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ask questions in English or Urdu
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="text-3xl mb-2">🎤</div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Voice Input</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Record voice messages
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-3xl mb-2">📄</div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-1">File Analysis</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Upload PDF, DOC, or images
                  </p>
                </div>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={message._id || index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                {/* Message Bubble */}
                <div
                  className={`rounded-lg p-4 ${message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                    }`}
                >
                  {message.messageType === 'file' && message.attachments && (
                    <div className="mb-2 flex items-center gap-2 text-sm opacity-80">
                      <span>📎</span>
                      <span>{message.attachments[0]?.filename}</span>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{message.content}</p>

                  <p className="text-xs opacity-70 mt-2">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                {/* AI Response Details */}
                {message.role === 'assistant' && message.aiResponse && (
                  <div className="mt-3 space-y-3">
                    {/* Triage Level */}
                    {message.aiResponse.triage_level && (
                      <div className={`p-3 rounded-lg border-2 ${getTriageLevelColor(message.aiResponse.triage_level)}`}>
                        <p className="font-semibold text-sm">
                          Triage: {message.aiResponse.triage_level.toUpperCase()}
                        </p>
                      </div>
                    )}

                    {/* Emergency Alert */}
                    {message.aiResponse.is_emergency && (
                      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-3">
                        <p className="text-red-700 dark:text-red-300 font-bold flex items-center gap-2">
                          <span>⚠️</span>
                          EMERGENCY - Seek Immediate Medical Attention!
                        </p>
                      </div>
                    )}

                    {/* Immediate Consultation */}
                    {message.aiResponse.consult_doctor_immediately && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500 rounded-lg p-3">
                        <p className="text-orange-700 dark:text-orange-300 font-semibold flex items-center gap-2">
                          <span>🚨</span>
                          Immediate doctor consultation recommended
                        </p>
                      </div>
                    )}

                    {/* Symptoms Detected */}
                    {message.aiResponse.symptoms_detected && message.aiResponse.symptoms_detected.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <p className="font-semibold text-sm mb-2 text-gray-800 dark:text-white">Symptoms Detected:</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {message.aiResponse.symptoms_detected.map((symptom, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs"
                            >
                              {symptom}
                            </span>
                          ))}
                        </div>
                        {message.aiResponse.symptom_explanations && (
                          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            {Object.entries(message.aiResponse.symptom_explanations).map(([symptom, explanation], idx) => (
                              <p key={idx}><span className="font-medium">{symptom}:</span> {explanation}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Possible Conditions */}
                    {message.aiResponse.possible_conditions && message.aiResponse.possible_conditions.length > 0 && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                        <p className="font-semibold text-sm mb-2 text-gray-800 dark:text-white">Possible Conditions:</p>
                        <div className="space-y-2">
                          {message.aiResponse.possible_conditions.map((condition, idx) => (
                            <div key={idx} className="text-sm border-b border-purple-100 dark:border-purple-800 last:border-0 pb-2 last:pb-0">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{condition.name}</span>
                                <span className="text-xs bg-purple-200 dark:bg-purple-800 px-2 py-1 rounded">
                                  {condition.confidence}
                                </span>
                              </div>
                              {condition.explanation && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                  {condition.explanation}
                                </p>
                              )}
                              {condition.why_suspected && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                                  &quot;Reason: {condition.why_suspected}&quot;
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Risk & Lifestyle Factors */}
                    {(message.aiResponse.risk_factors_detected?.length || 0) > 0 && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                        <p className="font-semibold text-sm mb-2 text-gray-800 dark:text-white">Risk Factors:</p>
                        <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400">
                          {message.aiResponse.risk_factors_detected?.map((factor, idx) => (
                            <li key={idx}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Home Care Advice */}
                    {message.aiResponse.home_care_advice && message.aiResponse.home_care_advice.length > 0 && (
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                        <p className="font-semibold text-sm mb-2 text-gray-800 dark:text-white flex items-center gap-2">
                          <span>🏠</span>
                          Home Care Advice:
                        </p>
                        <ul className="space-y-1 text-sm">
                          {message.aiResponse.home_care_advice.map((advice, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                              <span className="text-green-600">✓</span>
                              <span>{advice}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Avoid These */}
                    {message.aiResponse.avoid_these && message.aiResponse.avoid_these.length > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                        <p className="font-semibold text-sm mb-2 text-gray-800 dark:text-white flex items-center gap-2">
                          <span>🚫</span>
                          Avoid These:
                        </p>
                        <ul className="space-y-1 text-sm">
                          {message.aiResponse.avoid_these.map((avoid, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                              <span className="text-red-600">✕</span>
                              <span>{avoid}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Daily Life Impact */}
                    {message.aiResponse.daily_life_impact && message.aiResponse.daily_life_impact.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                        <p className="font-semibold text-sm mb-2 text-gray-800 dark:text-white">Daily Life Impact:</p>
                        <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400">
                          {message.aiResponse.daily_life_impact.map((impact, idx) => (
                            <li key={idx}>{impact}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Health Tips */}
                    {message.aiResponse.health_tips && message.aiResponse.health_tips.length > 0 && (
                      <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-3">
                        <p className="font-semibold text-sm mb-2 text-gray-800 dark:text-white flex items-center gap-2">
                          <span>💡</span>
                          Health Tips:
                        </p>
                        <ul className="space-y-1 text-sm">
                          {message.aiResponse.health_tips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                              <span className="text-teal-600">✦</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Appointment Reminder */}
                    {message.aiResponse.appointment_reminder && (
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-100 dark:border-indigo-800">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-sm text-gray-800 dark:text-white flex items-center gap-2">
                            <span>📅</span>
                            Appointment Recommendation:
                          </p>
                          {typeof message.aiResponse.appointment_reminder !== 'string' && (
                            <span className={`text-xs px-2 py-0.5 rounded ${message.aiResponse.appointment_reminder.type === 'urgent'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-indigo-100 text-indigo-800'
                              }`}>
                              {message.aiResponse.appointment_reminder.type?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {typeof message.aiResponse.appointment_reminder === 'string'
                            ? message.aiResponse.appointment_reminder
                            : message.aiResponse.appointment_reminder.suggested_follow_up}
                        </p>
                        {typeof message.aiResponse.appointment_reminder !== 'string' && message.aiResponse.appointment_reminder.reason && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                            Reason: {message.aiResponse.appointment_reminder.reason}
                          </p>
                        )}
                      </div>
                    )}

                    {/* TTS Button */}
                    <button
                      onClick={() => playTextToSpeech(message.content)}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                    >
                      <span>🔊</span>
                      Play Audio
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {uploadingFile && (
            <div className="mb-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Processing file...
              </p>
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* File Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || uploadingFile}
              className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
              title="Upload PDF, DOC, or Image"
            >
              <span className="text-xl">📎</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.tiff"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Voice Recording Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={loading || uploadingFile}
              className={`p-3 rounded-lg transition disabled:opacity-50 ${isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              title={isRecording ? 'Stop Recording' : 'Start Voice Recording'}
            >
              <span className="text-xl">{isRecording ? '⏹️' : '🎤'}</span>
            </button>

            {/* Text Input */}
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white resize-none text-black"
              rows={2}
              disabled={loading || uploadingFile}
            />

            {/* Send Button */}
            <button
              onClick={sendMessage}
              disabled={loading || uploadingFile || !inputMessage.trim()}
              className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xl">📤</span>
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            AI-powered medical assistant. Not a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </div>
  )
}
