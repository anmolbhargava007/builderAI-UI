import { createContext, useContext, useState, useEffect } from 'react';
import KnowledgeBaseService from '../services/knowledgeBaseService';

// Create a context with default values
const KnowledgeBaseContext = createContext({
  loaderList: [],
  loading: false,
  error: null,
  refetch: () => {},
});

// Custom hook to use the KB context
export const useKnowledgeBaseContext = () => {
  const context = useContext(KnowledgeBaseContext);
  if (!context) {
    throw new Error('useKnowledgeBaseContext must be used within a KnowledgeBaseProvider');
  }
  return context;
};

// Provider component
export const KnowledgeBaseProvider = ({ children }) => {
  const [loaderList, setLoaderList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchKnowledgeBase = () => {
    const compid = localStorage.getItem("compid");
    setLoading(true);
    setError(null);
    
    KnowledgeBaseService.getAllKnowledgeBase(compid)
      .then(res => {
        if (res?.data?.data) {
          setLoaderList(res.data.data);
        }
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch knowledge base');
        console.error('Error fetching knowledge base:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchKnowledgeBase();
  }, []);

  const value = {
    loaderList,
    loading,
    error,
    refetch: fetchKnowledgeBase,
  };

  return (
    <KnowledgeBaseContext.Provider value={value}>
      {children}
    </KnowledgeBaseContext.Provider>
  );
};

export default KnowledgeBaseContext;