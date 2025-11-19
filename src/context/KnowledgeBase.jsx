import { createContext, useContext, useState, useEffect } from 'react';
import KnowledgeBaseService from '../services/knowledgeBaseService';

const KnowledgeBaseContext = createContext({
  loaderList: [],
  savedKbList: [],
  loading: false,
  error: null,
  refetch: () => { },
  refetchList: () => { },
  saveNewKB: () => { },
  editKB: () => { },
});

export const useKnowledgeBaseContext = () => {
  const context = useContext(KnowledgeBaseContext);
  if (!context) {
    throw new Error('useKnowledgeBaseContext must be used within a KnowledgeBaseProvider');
  }
  return context;
};

export const KnowledgeBaseProvider = ({ children }) => {
  const [loaderList, setLoaderList] = useState([]);
  const [savedKbList, setSavedKbList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch KB types
  const fetchKnowledgeBase = () => {
    const compid = localStorage.getItem("compid");
    setLoading(true);
    setError(null);

    KnowledgeBaseService.getAllKnowledgeBase(compid)
      .then(res => {
        if (res?.data) {
          setLoaderList(res.data);
        }        
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch knowledge base');
        console.error('Error fetching knowledge base:', err);
      })
      .finally(() => setLoading(false));
  };

  // Fetch saved KB entries
  const fetchKnowledgeBaseList = () => {
    const compid = localStorage.getItem("compid");
    setLoading(true);
    setError(null);

    KnowledgeBaseService.getAllKnowledgeBaseList(compid)
      .then(res => {
        if (res?.data) {
          setSavedKbList(res.data);
        }
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch knowledge base list');
        console.error('Error fetching knowledge base list:', err);
      })
      .finally(() => setLoading(false));
  };

  // Save Knowledge Base
  const saveNewKB = async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const res = await KnowledgeBaseService.saveNewKB(payload);
      fetchKnowledgeBaseList();
      return res;
    } catch (err) {
      setError(err.message || 'Failed to save knowledge base');
      console.error('Error saving KB:', err);
    } finally {
      setLoading(false);
    }
  };

  // Edit Knowledge Base
  const editKB = async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const res = await KnowledgeBaseService.editKB(payload);
      fetchKnowledgeBaseList();
      return res;
    } catch (err) {
      setError(err.message || 'Failed to edit knowledge base');
      console.error('Error editing KB:', err);
    } finally {
      setLoading(false);
    }
  };

  // APIs are now called from components, not on provider mount

  const value = {
    loaderList,
    savedKbList,
    loading,
    error,
    refetch: fetchKnowledgeBase,
    refetchList: fetchKnowledgeBaseList,
    saveNewKB,
    editKB,
  };

  return (
    <KnowledgeBaseContext.Provider value={value}>
      {children}
    </KnowledgeBaseContext.Provider>
  );
};

export default KnowledgeBaseContext;