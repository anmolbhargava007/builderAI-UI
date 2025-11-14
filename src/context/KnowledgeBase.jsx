// context/KnowledgeBase.tsx

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import KnowledgeBaseService from "../services/knowledgeBaseService";

// localStorage keys
const KB_TYPES_KEY = "kb_types_cache";
const KB_LIST_KEY = "kb_list_cache";

const KnowledgeBaseContext = createContext(null);

export const useKnowledgeBaseContext = () => {
  const ctx = useContext(KnowledgeBaseContext);
  if (!ctx) throw new Error("useKnowledgeBaseContext must be used within KnowledgeBaseProvider");
  return ctx;
};

export const KnowledgeBaseProvider = ({ children }) => {
  const compid = localStorage.getItem("compid");

  // --- MASTER STATES ---
  const [kbTypes, setKbTypes] = useState([]);        // loaderList
  const [kbList, setKbList] = useState([]);          // savedKbList
  const [selectedKB, setSelectedKB] = useState(null); // for details page
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- LOAD FROM LOCALSTORAGE FIRST (Instant UI) ---
  useEffect(() => {
    const cachedTypes = localStorage.getItem(KB_TYPES_KEY);
    const cachedList = localStorage.getItem(KB_LIST_KEY);

    if (cachedTypes) setKbTypes(JSON.parse(cachedTypes));
    if (cachedList) setKbList(JSON.parse(cachedList));
  }, []);

  // -------------------------
  //  FETCH KB TYPES (Loader)
  // -------------------------
  const fetchKbTypes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await KnowledgeBaseService.getAllKnowledgeBase(compid);

      if (res?.data) {
        setKbTypes(res.data);
        localStorage.setItem(KB_TYPES_KEY, JSON.stringify(res.data));
      }
    } catch (err) {
      setError(err.message || "Failed to fetch Knowledge Base types");
      console.error("KB Types Error:", err);
    } finally {
      setLoading(false);
    }
  }, [compid]);

  // ---------------------------------
  //  FETCH SAVED KB INSTANCES (List)
  // ---------------------------------
  const fetchKbList = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await KnowledgeBaseService.getAllKnowledgeBaseList(compid);

      if (res?.data) {
        setKbList(res.data);
        localStorage.setItem(KB_LIST_KEY, JSON.stringify(res.data));
      }
    } catch (err) {
      setError(err.message || "Failed to fetch Knowledge Base list");
      console.error("KB List Error:", err);
    } finally {
      setLoading(false);
    }
  }, [compid]);

  // ----------------------------
  //  SAVE NEW KB ENTRY
  // ----------------------------
  const saveNewKB = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const res = await KnowledgeBaseService.saveNewKB(payload);

      // update state instantly
      await fetchKbList();
      return res;
    } catch (err) {
      setError(err.message || "Failed to save KB");
      console.error("Save KB Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchKbList]);

  // ----------------------------
  //  EDIT KB ENTRY
  // ----------------------------
  const editKB = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const res = await KnowledgeBaseService.editKB(payload);

      await fetchKbList();
      return res;
    } catch (err) {
      setError(err.message || "Failed to edit KB");
      console.error("Edit KB Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchKbList]);

  // ------------------------------------------------------------------
  //  SELECT KB FOR DETAILS PAGE (NO API CALL — USE EXISTING CACHED LIST)
  // ------------------------------------------------------------------
  const selectKB = useCallback((kbId) => {
    const kb = kbList.find((item) => item.id === kbId) || null;
    setSelectedKB(kb);
  }, [kbList]);

  // ------------------------------------
  //  INITIAL FETCH (Runs once on mount)
  // ------------------------------------
  useEffect(() => {
    fetchKbTypes();
    fetchKbList();
  }, [fetchKbTypes, fetchKbList]);

  // ---------------------------------
  //  VALUE EXPOSED TO COMPONENTS
  // ---------------------------------
  const value = {
    // STATE
    kbTypes,
    kbList,
    selectedKB,

    // STATUS
    loading,
    error,

    // ACTIONS
    refreshKbTypes: fetchKbTypes,
    refreshKbList: fetchKbList,
    saveNewKB,
    editKB,
    selectKB,
  };

  return (
    <KnowledgeBaseContext.Provider value={value}>
      {children}
    </KnowledgeBaseContext.Provider>
  );
};