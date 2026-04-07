// File Upload API endpoints (Cloudinary integration)

import { apiCallFormData } from './index';

/**
 * Upload auction images to Cloudinary via backend
 * @param {File[]} files - Array of image files
 * @param {object} options - Upload options (folder, tags, etc.)
 * @returns {Promise} Array of uploaded image data with URLs
 */
export const uploadAuctionImages = async (files, options = {}) => {
  const formData = new FormData();
  
  // Add all files to FormData
  files.forEach((file, index) => {
    formData.append('files', file);
  });
  
  // Add any additional options
  if (options.folder) {
    formData.append('folder', options.folder);
  }
  if (options.tags) {
    formData.append('tags', JSON.stringify(options.tags));
  }
  
  return apiCallFormData('/api/uploads/images', formData);
};

/**
 * Upload a single image
 * @param {File} file - Image file
 * @param {object} options - Upload options
 * @returns {Promise} Uploaded image data with URL
 */
export const uploadImage = async (file, options = {}) => {
  return uploadAuctionImages([file], options);
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID of image
 * @returns {Promise} Deletion confirmation
 */
export const deleteImage = async (publicId) => {
  return fetch(`${import.meta.env.VITE_API_URL}/api/uploads/images/${publicId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
  }).then(response => response.json());
};

/**
 * Get Cloudinary upload URL for direct uploads
 * Useful for client-side uploads without backend proxy
 * @returns {Promise} Upload configuration (signature, timestamp, etc.)
 */
export const getCloudinaryUploadConfig = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/uploads/config`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
  });
  return response.json();
};

/**
 * Validate image file before upload
 * @param {File} file - Image file
 * @returns {object} Validation result {valid: boolean, error: string|null}
 */
export const validateImageFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Supported: JPEG, PNG, WebP, GIF`,
    };
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size too large. Maximum: ${maxSize / 1024 / 1024}MB`,
    };
  }
  
  return { valid: true, error: null };
};

/**
 * Upload images with progress tracking
 * @param {File[]} files - Image files
 * @param {function} onProgress - Progress callback (loaded, total)
 * @param {object} options - Upload options
 * @returns {Promise} Upload result
 */
export const uploadImagesWithProgress = async (files, onProgress, options = {}) => {
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append('files', file);
  });
  
  if (options.folder) {
    formData.append('folder', options.folder);
  }
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          onProgress(event.loaded, event.total);
        }
      });
    }
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });
    
    const apiUrl = `${import.meta.env.VITE_API_URL}/api/uploads/images`;
    xhr.open('POST', apiUrl);
    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
    xhr.send(formData);
  });
};
