import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Calendar, Building, RefreshCw, Search, AlertTriangle } from 'lucide-react'

const DocumentList = ({ documents, onRefresh, onSearch, disabled }) => {
  const handleSearchDocument = (companyName) => {
    if (disabled) return
    onSearch(`company:${companyName}`)
  }

  const handleRefresh = () => {
    if (disabled) return
    onRefresh()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className={`bg-white rounded-xl shadow-lg p-6 ${disabled ? 'opacity-50' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Uploaded Documents
          </h2>
          <button
            onClick={handleRefresh}
            disabled={disabled}
            className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>

        {disabled && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Please connect to the backend server to view documents.
              </p>
            </div>
          </div>
        )}

        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No documents uploaded yet
            </h3>
            <p className="text-gray-500">
              Upload your first BRSR document to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 mb-2 truncate">
                      {doc.filename || 'Untitled Document'}
                    </h3>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      {doc.company && (
                        <div className="flex items-center space-x-1">
                          <Building className="h-4 w-4" />
                          <span>{doc.company}</span>
                        </div>
                      )}
                      
                      {doc.year && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{doc.year}</span>
                        </div>
                      )}
                      
                      {doc.upload_date && (
                        <div className="text-xs text-gray-500">
                          Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    {doc.company && (
                      <button
                        onClick={() => handleSearchDocument(doc.company)}
                        disabled={disabled}
                        className="mt-3 flex items-center space-x-1 px-3 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Search className="h-3 w-3" />
                        <span>Search in this document</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default DocumentList
