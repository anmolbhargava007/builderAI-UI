import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "./src/pages/Layout/Layout";
import Login from "./src/pages/Login/Login";
import Home from "./src/pages/Layout/Home/Home";
import Workflow from "./src/pages/Layout/Workflow/Workflow";
import ExploreTools from "./src/pages/Layout/ExploreTools/ExploreTools";
import Transaction from "./src/pages/Layout/Transaction/Transaction";
import User from "./src/pages/User/User";
import UploadData from "./src/pages/Layout/UploadData/UploadData";
import AICompanyModel from "./src/pages/AIModel/AICompanyModel";
import AICompanyProvider from "./src/pages/AIModel/AICompanyProvider";
import KnowledgeBase from "./src/pages/Layout/KnowledgeBase/KnowledgeBase";
import KnowledgeBaseDetails from "./src/pages/Layout/KnowledgeBase/KnowledgeBaseDetails";
import { KnowledgeBaseProvider } from "./src/context/KnowledgeBase";

  const AllRoutes = ({ msalInstance, signOutClickHandler }) => {

    const token = localStorage.getItem("token");
    const lastRoute = localStorage.getItem("lastRoute");

    // Compute only once
    let initialElement;
    if (token && lastRoute && lastRoute !== "/" && lastRoute !== "/login") {
      initialElement = <Navigate to={lastRoute} replace />;
    } else {
      initialElement = <Login msalInstance={msalInstance} />;
    }

    return (
      <KnowledgeBaseProvider>
        <Routes>
          <Route path="/" element={initialElement} />
          <Route path="/login" element={<Login msalInstance={msalInstance} />} />
          <Route path="home" element={ <ProtectedRoute redirectTo={"/"}> <Layout signOutClickHandler={signOutClickHandler} /> </ProtectedRoute>}>
            <Route path="" element={<Home />} />
            <Route path="workflow" element={<Workflow />} />
            <Route path="transaction" element={<Transaction/>}/>
            <Route path="exploreTools" element={<ExploreTools/>} />
            <Route path="uploadData" element={<UploadData/>} />
            <Route path="user" element={<User/>} />
            <Route path="aicompanymodels" element={<AICompanyModel/>} />
            <Route path="aicompanymodelproviders" element={<AICompanyProvider/>} />

            {/* New routes */}
            <Route path="knowledgebase" element={<KnowledgeBase />} />
            <Route path="knowledgebase/:id" element={<KnowledgeBaseDetails />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </KnowledgeBaseProvider>
    );
  };

  export default AllRoutes;