/**
 * Client-side image compression utilities using Canvas API
 * Compresses images without requiring additional dependencies
 */

export const imageCompressionUtils = {
  /**
   * Compress image using Canvas API
   * @param {File} file - Original image file
   * @param {Object} options - Compression options
   * @returns {Promise<Blob>} Compressed image blob
   */
  async compressImage(file, options = {}) {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.75,
      format = 'image/jpeg'
    } = options

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)

      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target.result

        img.onload = () => {
          const canvas = document.createElement('canvas')
          let { width, height } = img

          // Calculate new dimensions maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round(height * maxWidth / width)
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = Math.round(width * maxHeight / height)
              height = maxHeight
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')

          // Enable image smoothing for better quality
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'

          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Failed to compress image'))
              }
            },
            format,
            quality
          )
        }

        img.onerror = () => reject(new Error('Failed to load image'))
      }

      reader.onerror = () => reject(new Error('Failed to read file'))
    })
  },

  /**
   * Compress avatar specifically (smaller dimensions, optimized for profile pictures)
   * @param {File} file - Avatar image file
   * @returns {Promise<Blob>} Compressed avatar blob
   */
  async compressAvatar(file) {
    return this.compressImage(file, {
      maxWidth: 512,
      maxHeight: 512,
      quality: 0.85,
      format: 'image/jpeg'
    })
  },

  /**
   * Create small thumbnail (for lists and grids)
   * @param {File} file - Image file
   * @returns {Promise<Blob>} Thumbnail blob
   */
  async createThumbnail(file) {
    return this.compressImage(file, {
      maxWidth: 200,
      maxHeight: 200,
      quality: 0.7,
      format: 'image/jpeg'
    })
  },

  /**
   * Calculate compression ratio
   * @param {number} original - Original size in bytes
   * @param {number} compressed - Compressed size in bytes
   * @returns {string} Percentage string
   */
  getCompressionRatio(original, compressed) {
    const ratio = ((1 - compressed / original) * 100).toFixed(1)
    return `${ratio}%`
  },

  /**
   * Format file size for display
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size string
   */
  formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }
}

export default imageCompressionUtils
