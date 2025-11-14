import { createContext, useContext } from 'react';

// Create a context with default values
const KnowledgeBaseContext = createContext({
  loaderList: [],
  setLoaderList: () => {},
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
export const KnowledgeBaseProvider = ({ children, value }) => {
  return (
    <KnowledgeBaseContext.Provider value={value}>
      {children}
    </KnowledgeBaseContext.Provider>
  );
};

export default KnowledgeBaseContext;