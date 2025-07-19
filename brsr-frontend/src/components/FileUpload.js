import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, FileText, Loader2, AlertTriangle } from 'lucide-react'

const FileUpload = ({ onUpload, isLoading, disabled }) => {
  const [file, setFile] = useState(null)
  const [companyName, setCompanyName] = useState('')
  const [reportingYear, setReportingYear] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled) return
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      validateAndSetFile(files[0])
    }
  }

  const handleFileInput = (e) => {
    if (disabled) return
    
    const files = e.target.files
    if (files && files[0]) {
      validateAndSetFile(files[0])
    }
  }

  const validateAndSetFile = (file) => {
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file')
      return
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setError('File size must be less than 50MB')
      return
    }
    
    setError('')
    setFile(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (disabled) return
    
    if (!file || !companyName || !reportingYear) {
      setError('Please fill in all fields')
      return
    }
    
    try {
      await onUpload(file, companyName, reportingYear)
      // Reset form
      setFile(null)
      setCompanyName('')
      setReportingYear('')
      setError('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      setError(error.message || 'Upload failed')
    }
  }

  const removeFile = () => {
    if (disabled) return
    
    setFile(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <div className={`bg-white rounded-xl shadow-lg p-8 ${disabled ? 'opacity-50' : ''}`}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Upload BRSR Document
        </h2>
        
        {disabled && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Please connect to the backend server to upload documents.
              </p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
              ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              ${dragActive && !disabled ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              ${file ? 'border-green-400 bg-green-50' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isLoading || disabled}
            />
            
            {!file ? (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Drop your PDF here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Maximum file size: 50MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1 text-red-500 hover:text-red-700"
                  disabled={isLoading || disabled}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Company Name Input */}
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading || disabled}
            />
          </div>

          {/* Reporting Year Input */}
          <div>
            <label htmlFor="reportingYear" className="block text-sm font-medium text-gray-700 mb-2">
              Reporting Year
            </label>
            <input
              id="reportingYear"
              type="text"
              value={reportingYear}
              onChange={(e) => setReportingYear(e.target.value)}
              placeholder="e.g., 2023-2024"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading || disabled}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!file || !companyName || !reportingYear || isLoading || disabled}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              'Upload Document'
            )}
          </button>
        </form>
      </div>
    </motion.div>
  )
}

export default FileUpload
