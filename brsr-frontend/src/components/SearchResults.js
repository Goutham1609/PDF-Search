import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Star, Clock, Building } from 'lucide-react'

const SearchResults = ({ results, query, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>Searching documents...</span>
        </div>
      </div>
    )
  }

  if (!results || results.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-500">
          Try adjusting your search terms or check if documents are uploaded.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          Search Results for "{query}"
        </h3>
        <div className="text-sm text-gray-500">
          {results.length} result{results.length !== 1 ? 's' : ''} found
        </div>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  {result.company && (
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Building className="h-4 w-4" />
                      <span>{result.company}</span>
                    </div>
                  )}
                  
                  {result.year && (
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{result.year}</span>
                    </div>
                  )}
                  
                  {result.score && (
                    <div className="flex items-center space-x-1 text-sm text-orange-600">
                      <Star className="h-4 w-4" />
                      <span>{(result.score * 100).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-900 mb-2 leading-relaxed">
                  {result.content || result.text}
                </p>
                
                {result.metadata && (
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {result.metadata.page && (
                      <span>Page {result.metadata.page}</span>
                    )}
                    {result.metadata.chunk && (
                      <span>Chunk {result.metadata.chunk}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default SearchResults
