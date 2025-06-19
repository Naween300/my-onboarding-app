import { useState, useCallback } from 'react'
import { OnboardingData } from '@/lib/types'
import { DatabaseService } from '@/lib/database'
import { StorageService } from '@/lib/storage'

interface UseOnboardingReturn {
  data: Partial<OnboardingData>
  isLoading: boolean
  error: string | null
  currentId: string | null
  updateData: (newData: Partial<OnboardingData>) => void
  saveStepData: (stepData: Partial<OnboardingData>) => Promise<boolean>
  saveCompleteData: () => Promise<boolean>
  loadFromDatabase: (id: string) => Promise<void>
  resetData: () => void
}

// ✅ FIXED: Remove empty strings for required fields
const initialData: Partial<OnboardingData> = {
  // Don't set businessType and businessName to empty strings
  locationType: 'online',
  customerType: 'b2c',
  goals: [],
  brandPersonality: [],
  socialMediaPresence: {
    facebook: 'none',
    instagram: 'none',
    linkedin: 'none'
  },
  brandColors: {
    primary: '#3B82F6',
    secondary: '#EF4444'
  },
  contactInfo: {
    website: '',
    phone: '',
    socialHandles: ''
  },
  budget: 500,
  timeline: 'steady'
}

export const useOnboarding = (): UseOnboardingReturn => {
  const [data, setData] = useState<Partial<OnboardingData>>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentId, setCurrentId] = useState<string | null>(null)

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    console.log('🔄 updateData called with:', newData)
    setData(prevData => {
      const updatedData = { ...prevData, ...newData }
      console.log('📊 Updated data state:', updatedData)
      return updatedData
    })
  }, [])

  // ✅ ENHANCED: Better validation and error handling
  const saveStepData = useCallback(async (stepData: Partial<OnboardingData>): Promise<boolean> => {
    console.log('💾 saveStepData called with:', stepData)
    console.log('📊 Current data state:', data)
    console.log('🆔 Current ID:', currentId)
    
    setIsLoading(true)
    setError(null)

    try {
      // Update local state first
      const updatedData = { ...data, ...stepData }
      setData(updatedData)
      console.log('🔄 Updated data to save:', updatedData)

      // ✅ CRITICAL: Validate required fields before database call
      if (!updatedData.businessType || !updatedData.businessName) {
        const missingFields = [];
        if (!updatedData.businessType) missingFields.push('businessType');
        if (!updatedData.businessName) missingFields.push('businessName');
        
        const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
        console.error('❌ Validation failed:', errorMsg);
        console.error('❌ Current data:', updatedData);
        setError(errorMsg);
        return false;
      }

      let logoFileName: string | undefined

      // Handle logo upload if present in step data
      if (stepData.logo && updatedData.businessName) {
        console.log('📁 Uploading logo...')
        
        const { fileName, publicUrl, error: uploadError } = await StorageService.uploadLogo(
          stepData.logo, 
          updatedData.businessName
        )
        
        if (uploadError) {
          console.error('❌ Logo upload failed:', uploadError)
          setError('Failed to upload logo')
          return false
        }
        
        logoFileName = fileName || undefined
        console.log('✅ Logo uploaded:', { fileName, publicUrl })
      }

      // ✅ ENHANCED: Call DatabaseService with validation
      console.log('💾 Calling DatabaseService.saveStepData...')
      const { data: savedData, error: saveError, isNew } = await DatabaseService.saveStepData(
        currentId,
        updatedData,
        logoFileName
      )
      
      if (saveError) {
        console.error('❌ DatabaseService error:', saveError)
        console.error('❌ Error details:', {
          message: saveError.message,
          code: saveError.code,
          details: saveError.details,
          hint: saveError.hint
        });
        setError(`Database error: ${saveError.message || JSON.stringify(saveError)}`)
        return false
      }

      console.log('✅ DatabaseService returned:', { savedData, isNew })
      
      // Update current ID if this is a new record
      if (isNew && savedData?.id) {
        setCurrentId(savedData.id)
        localStorage.setItem('onboardingId', savedData.id)
        console.log('🆕 New record ID stored:', savedData.id)
      }

      console.log('✅ Step data saved successfully to database')
      return true
      
    } catch (err) {
      console.error('❌ Unexpected error in saveStepData:', err)
      setError(`Hook error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [data, currentId])

  // ✅ ENHANCED: Better validation for complete data save
  const saveCompleteData = useCallback(async (): Promise<boolean> => {
    console.log('🏁 saveCompleteData called with:', data)
    setIsLoading(true)
    setError(null)

    try {
      // ✅ CRITICAL: Validate required fields before saving
      if (!data.businessType || !data.businessName) {
        const missingFields = [];
        if (!data.businessType) missingFields.push('businessType');
        if (!data.businessName) missingFields.push('businessName');
        
        const errorMsg = `Cannot save: Missing required fields: ${missingFields.join(', ')}`;
        console.error('❌ Final validation failed:', errorMsg);
        console.error('❌ Current data:', data);
        setError(errorMsg);
        return false;
      }

      let logoFileName: string | undefined

      // Handle logo upload if present
      if (data.logo && data.businessName) {
        console.log('📁 Uploading logo for final save...')
        
        const { fileName, publicUrl, error: uploadError } = await StorageService.uploadLogo(
          data.logo, 
          data.businessName
        )
        
        if (uploadError) {
          console.error('❌ Logo upload failed:', uploadError)
          setError('Failed to upload logo')
          return false
        }
        
        logoFileName = fileName || undefined
        console.log('✅ Logo uploaded for final save:', { fileName, publicUrl })
      }

      // ✅ ENHANCED: Save complete data to database with better logging
      console.log('💾 Calling DatabaseService for final save...')
      let result
      if (currentId) {
        console.log('🔄 Updating existing record with ID:', currentId)
        result = await DatabaseService.updateOnboardingData(currentId, data, logoFileName)
      } else {
        console.log('🆕 Creating new record')
        result = await DatabaseService.saveOnboardingData(data, logoFileName)
      }
      
      if (result.error) {
        console.error('❌ Database save error:', result.error)
        console.error('❌ Error details:', {
          message: result.error.message,
          code: result.error.code,
          details: result.error.details,
          hint: result.error.hint
        });
        setError(`Failed to save onboarding data: ${result.error.message || JSON.stringify(result.error)}`)
        return false
      }

      // Store the ID for future reference
      if (result.data?.id) {
        setCurrentId(result.data.id)
        localStorage.setItem('onboardingId', result.data.id)
        console.log('🆕 Final record ID stored:', result.data.id)
      }

      console.log('✅ Complete data saved successfully to database')
      return true
      
    } catch (err) {
      console.error('❌ Unexpected error in saveCompleteData:', err)
      setError(`Complete save error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [data, currentId])

  const loadFromDatabase = useCallback(async (id: string): Promise<void> => {
    console.log('📥 loadFromDatabase called with ID:', id)
    setIsLoading(true)
    setError(null)

    try {
      const { data: loadedData, error: loadError } = await DatabaseService.getOnboardingData(id)
      
      if (loadError) {
        console.error('❌ Load error:', loadError)
        setError('Failed to load onboarding data')
        return
      }

      if (loadedData) {
        setData(loadedData)
        setCurrentId(id)
        console.log('✅ Data loaded from database:', loadedData)
      }
    } catch (err) {
      console.error('❌ Unexpected load error:', err)
      setError('An unexpected error occurred while loading data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resetData = useCallback(() => {
    console.log('🔄 resetData called')
    setData(initialData)
    setError(null)
    setCurrentId(null)
    localStorage.removeItem('onboardingId')
  }, [])

  return {
    data,
    isLoading,
    error,
    currentId,
    updateData,
    saveStepData,
    saveCompleteData,
    loadFromDatabase,
    resetData
  }
}
