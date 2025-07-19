import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader2, AlertTriangle } from 'lucide-react'
import SearchResults from './SearchResults'

const SearchSection = ({ onSearch, searchResults, isLoading, searchQuery, disabled }) => {
  const [query, setQuery] = useState(searchQuery || '')

  const handleSearch = (e) => {
    e.preventDefault()
    if (disabled) return
    
    if (query.trim()) {
      onSearch(query)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      {/* Search Form */}
      <div className={`bg-white rounded-xl shadow-lg p-6 mb-8 ${disabled ? 'opacity-50' : ''}`}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Search Documents
        </h2>
        
        {disabled && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Please connect to the backend server to search documents.
              </p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for sustainability metrics, ESG data, carbon emissions..."
              className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              disabled={isLoading || disabled}
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          
          <button
            type="submit"
            disabled={!query.trim() || isLoading || disabled}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Searching...</span>
              </div>
            ) : (
              'Search Documents'
            )}
          </button>
        </form>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <SearchResults 
          results={searchResults}
          query={searchQuery}
          isLoading={isLoading}
        />
      )}
    </motion.div>
  )
}

export default SearchSection
