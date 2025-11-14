import React from "react";
import { KnowledgeBaseProvider } from "./KnowledgeBase";

export default function AppProviders({ children }) {
  return (
    <KnowledgeBaseProvider>
        {children}
    </KnowledgeBaseProvider>
  );
}