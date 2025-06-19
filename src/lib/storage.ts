import { supabase } from './supabase'

export class StorageService {
  private static BUCKET_NAME = 'logos'

  // Upload logo file and return the file name
  static async uploadLogo(file: File, businessName: string): Promise<{ fileName: string | null, publicUrl: string | null, error: any }> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const sanitizedBusinessName = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')
      const fileName = `${sanitizedBusinessName}-${Date.now()}.${fileExt}`

      // Upload file
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        return { fileName: null, publicUrl: null, error }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName)

      return { 
        fileName: fileName, 
        publicUrl: urlData.publicUrl, 
        error: null 
      }
    } catch (err) {
      console.error('Unexpected upload error:', err)
      return { fileName: null, publicUrl: null, error: err }
    }
  }

  // Get public URL for a stored logo
  static getLogoUrl(fileName: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(fileName)
    
    return data.publicUrl
  }

  // Delete logo file
  static async deleteLogo(fileName: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([fileName])

      if (error) {
        console.error('Delete error:', error)
        return { error }
      }

      return { error: null }
    } catch (err) {
      console.error('Unexpected delete error:', err)
      return { error: err }
    }
  }

  // Update logo (delete old, upload new)
  static async updateLogo(
    newFile: File, 
    businessName: string, 
    oldFileName?: string
  ): Promise<{ fileName: string | null, publicUrl: string | null, error: any }> {
    try {
      // Delete old file if it exists
      if (oldFileName) {
        await this.deleteLogo(oldFileName)
      }

      // Upload new file
      return await this.uploadLogo(newFile, businessName)
    } catch (err) {
      console.error('Unexpected update error:', err)
      return { fileName: null, publicUrl: null, error: err }
    }
  }
}