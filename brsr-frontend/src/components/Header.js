import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Search, Upload, Wifi, WifiOff } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'

const Header = ({ apiStatus }) => {
  const getStatusColor = () => {
    switch (apiStatus) {
      case 'connected': return 'text-green-600'
      case 'disconnected': return 'text-red-600'
      default: return 'text-yellow-600'
    }
  }

  const getStatusIcon = () => {
    switch (apiStatus) {
      case 'connected': return <Wifi className="h-4 w-4" />
      case 'disconnected': return <WifiOff className="h-4 w-4" />
      default: return <LoadingSpinner size="sm" />
    }
  }

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-12"
    >
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center space-x-2 bg-white p-4 rounded-full shadow-lg">
          <FileText className="h-8 w-8 text-blue-600" />
          <Search className="h-6 w-6 text-green-600" />
          <Upload className="h-6 w-6 text-purple-600" />
        </div>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        BRSR PDF Search
      </h1>
      
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Upload, process, and search Business Responsibility and Sustainability Reports 
        using advanced OCR and semantic search technology.
      </p>
      
      <div className="mt-6 flex justify-center space-x-8 text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>OCR Support</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Vector Search</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span>Smart Indexing</span>
        </div>
        <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span>API Status</span>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
