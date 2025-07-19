import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import SearchSection from './components/SearchSection';
import DocumentList from './components/DocumentList';
import ErrorBoundary from './components/ErrorBoundary';
import { apiService } from './services/apiService';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [documents, setDocuments] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');

  const checkApiHealth = useCallback(async () => {
    try {
      await apiService.getHealth();
      setApiStatus('connected');
      setError(null);
    } catch (error) {
      console.warn('API health check failed:', error.message);
      setApiStatus('disconnected');
      setError('Backend server is not available. Please start the FastAPI server.');
    }
  }, []);

  const loadDocuments = useCallback(async () => {
    try {
      setError(null);
      const docs = await apiService.getDocuments();
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (error) {
      console.error('Failed to load documents:', error.message);
      setError('Failed to load documents. Please try again.');
      setDocuments([]);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      if (mounted) {
        await checkApiHealth();
        await loadDocuments();
      }
    };

    initializeApp();

    return () => {
      mounted = false;
    };
  }, [checkApiHealth, loadDocuments]);

  const handleFileUpload = async (file, companyName, reportingYear) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiService.uploadPDF(file, companyName, reportingYear);
      await loadDocuments();
      setActiveTab('documents');
    } catch (error) {
      console.error('Upload failed:', error.message);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      setSearchQuery(query);
      const results = await apiService.searchDocuments(query);
      setSearchResults(Array.isArray(results) ? results : []);
      setActiveTab('search');
    } catch (error) {
      console.error('Search failed:', error.message);
      setError(error.message);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    checkApiHealth();
  };

  const tabs = [
    { id: 'upload', label: 'Upload', icon: '📤' },
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'search', label: 'Search', icon: '🔍' }
  ];

  return (
    <ErrorBoundary>
      <div>
        <div className="container">
          <Header apiStatus={apiStatus} />

          {apiStatus === 'disconnected' && (
            <div className="alert alert-warning">
              <div className="flex justify-between items-center">
                <p>Backend server is not available. Please start the FastAPI server.</p>
                <button onClick={handleRetry}>Retry</button>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <div className="flex justify-between items-center">
                <p>{error}</p>
                <button onClick={() => setError(null)}>Dismiss</button>
              </div>
            </div>
          )}

          <div className="tab-bar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={activeTab === tab.id ? 'active' : ''}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="section">
            {activeTab === 'upload' && (
              <FileUpload
                onUpload={handleFileUpload}
                isLoading={isLoading}
                disabled={apiStatus === 'disconnected'}
              />
            )}

            {activeTab === 'documents' && (
              <DocumentList
                documents={documents}
                onRefresh={loadDocuments}
                onSearch={handleSearch}
                disabled={apiStatus === 'disconnected'}
              />
            )}

            {activeTab === 'search' && (
              <SearchSection
                onSearch={handleSearch}
                searchResults={searchResults}
                isLoading={isLoading}
                searchQuery={searchQuery}
                disabled={apiStatus === 'disconnected'}
              />
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
