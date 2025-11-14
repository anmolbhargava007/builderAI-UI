import { createContext, useContext } from 'react';

// Create a context with default values
const FlowContext = createContext({
  agentList: [],
  teamList: [],
  llmList: [],
  toolList: [],
  kbSubTypeList: [],
  connectorList: [],
  addAgentNode: () => {},
});

// Custom hook to use the flow context
export const useFlowContext = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlowContext must be used within a FlowProvider');
  }
  return context;
};

// Provider component
export const FlowProvider = ({ children, value }) => {
  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
};

export default FlowContext;
