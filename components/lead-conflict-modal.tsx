'use client'

import { AlertCircle, User, Mail, Phone, Building2, MapPin, FileText } from 'lucide-react'

interface LeadConflictModalProps {
  isOpen: boolean
  existingLead: {
    nombre: string
    email: string
    telefono?: string
    empresa?: string
    ciudad?: string
    ruc_cedula?: string
  }
  newData: {
    nombre: string
    email: string
    telefono: string
    empresa: string
    ciudad?: string
    ruc_cedula?: string
  }
  onUseExisting: () => void
  onUpdateAndContinue: () => void
  onCancel: () => void
  isUpdating?: boolean
  canUpdateLead?: boolean
  onRequestVerification?: () => void
  verificationState?: 'idle' | 'sending' | 'sent' | 'error'
  verificationError?: string | null
}

export default function LeadConflictModal({
  isOpen,
  existingLead,
  newData,
  onUseExisting,
  onUpdateAndContinue,
  onCancel,
  isUpdating = false,
  canUpdateLead = true,
  onRequestVerification,
  verificationState = 'idle',
  verificationError = null
}: LeadConflictModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0066CC] to-[#0052A3] p-6 rounded-t-2xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">
                Contacto ya registrado
              </h2>
              <p className="text-blue-100 text-sm">
                Este correo electrónico ya está asociado a un contacto. ¿Qué deseas hacer?
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Comparación de datos */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Datos guardados */}
            <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-600" />
                Datos guardados
              </h3>
              <div className="space-y-3 text-sm">
                <DataField
                  icon={<User className="w-4 h-4" />}
                  label="Nombre"
                  value={existingLead.nombre}
                />
                <DataField
                  icon={<Mail className="w-4 h-4" />}
                  label="Email"
                  value={existingLead.email}
                />
                <DataField
                  icon={<Phone className="w-4 h-4" />}
                  label="Teléfono"
                  value={existingLead.telefono || 'No especificado'}
                />
                <DataField
                  icon={<Building2 className="w-4 h-4" />}
                  label="Empresa"
                  value={existingLead.empresa || 'No especificado'}
                />
                <DataField
                  icon={<MapPin className="w-4 h-4" />}
                  label="Ciudad"
                  value={existingLead.ciudad || 'No especificado'}
                />
                <DataField
                  icon={<FileText className="w-4 h-4" />}
                  label="RUC/Cédula"
                  value={existingLead.ruc_cedula || 'No especificado'}
                />
              </div>
            </div>

            {/* Datos nuevos */}
            <div className="border-2 border-[#FFD700] rounded-xl p-4 bg-yellow-50">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-[#FFD700]" />
                Datos ingresados ahora
              </h3>
              <div className="space-y-3 text-sm">
                <DataField
                  icon={<User className="w-4 h-4" />}
                  label="Nombre"
                  value={newData.nombre}
                  highlight={newData.nombre !== existingLead.nombre}
                />
                <DataField
                  icon={<Mail className="w-4 h-4" />}
                  label="Email"
                  value={newData.email}
                />
                <DataField
                  icon={<Phone className="w-4 h-4" />}
                  label="Teléfono"
                  value={newData.telefono}
                  highlight={newData.telefono !== existingLead.telefono}
                />
                <DataField
                  icon={<Building2 className="w-4 h-4" />}
                  label="Empresa"
                  value={newData.empresa}
                  highlight={newData.empresa !== existingLead.empresa}
                />
                <DataField
                  icon={<MapPin className="w-4 h-4" />}
                  label="Ciudad"
                  value={newData.ciudad || 'No especificado'}
                  highlight={newData.ciudad !== existingLead.ciudad}
                />
                <DataField
                  icon={<FileText className="w-4 h-4" />}
                  label="RUC/Cédula"
                  value={newData.ruc_cedula || 'No especificado'}
                  highlight={newData.ruc_cedula !== existingLead.ruc_cedula}
                />
              </div>
            </div>
          </div>

          {/* Nota informativa */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-[#0066CC] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold text-gray-900 mb-1">¿Qué significa esto?</p>
              <p>
                Los valores resaltados en <span className="font-semibold">amarillo</span> son diferentes 
                a los datos guardados. Si eliges "Actualizar y continuar", se sobrescribirán los datos 
                anteriores con los nuevos valores.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            disabled={isUpdating}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={onUseExisting}
            disabled={isUpdating}
            className="flex-1 px-6 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Usar datos guardados
          </button>
          <button
            onClick={onUpdateAndContinue}
            disabled={isUpdating || !canUpdateLead}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#0066CC] to-[#0052A3] text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUpdating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Actualizando...
              </>
            ) : canUpdateLead ? (
              'Actualizar y continuar'
            ) : (
              'Actualización restringida'
            )}
          </button>
        </div>
        {!canUpdateLead && (
          <div className="px-6 pb-6 space-y-3 text-sm text-red-600">
            <p>
              Para actualizar los datos necesitamos confirmar que eres el propietario del correo. Verifica tu identidad y
              vuelve a intentar.
            </p>
            {onRequestVerification && (
              <button
                onClick={onRequestVerification}
                disabled={isUpdating || verificationState === 'sending'}
                className="w-full px-4 py-2 border border-red-200 rounded-lg text-red-700 font-semibold hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verificationState === 'sent'
                  ? 'Enlace enviado, revisa tu correo'
                  : verificationState === 'sending'
                    ? 'Enviando enlace de verificación...'
                    : 'Verificar correo para actualizar'}
              </button>
            )}
            {verificationState === 'sent' && (
              <p className="text-green-700">
                Revisa tu bandeja de entrada y sigue el enlace para autenticarte. Vuelve a esta pantalla después de confirmar.
              </p>
            )}
            {verificationError && (
              <p className="text-red-700">
                {verificationError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Componente auxiliar para mostrar campos de datos
function DataField({ 
  icon, 
  label, 
  value, 
  highlight = false 
}: { 
  icon: React.ReactNode
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className={`flex items-start gap-2 ${highlight ? 'bg-yellow-100 -mx-2 px-2 py-1 rounded-lg' : ''}`}>
      <div className="text-gray-500 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 mb-0.5">{label}</div>
        <div className={`font-medium truncate ${highlight ? 'text-gray-900' : 'text-gray-700'}`}>
          {value}
        </div>
      </div>
    </div>
  )
}
