import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
import KnowledgeBaseConfig from "./src/pages/Layout/KnowledgeBase/KnowledgeBaseConfig";

import { KnowledgeBaseProvider } from "./src/context/KnowledgeBase";
import { Outlet } from "react-router-dom";
import KnowledgeBaseConfigEdit from "./src/pages/Layout/KnowledgeBase/KnowledgeBaseConfigEdit";

const AllRoutes = ({ msalInstance, signOutClickHandler }) => {
  const token = localStorage.getItem("token");
  const lastRoute = localStorage.getItem("lastRoute");

  let initialElement;
  if (token && lastRoute && lastRoute !== "/" && lastRoute !== "/login") {
    initialElement = <Navigate to={lastRoute} replace />;
  } else {
    initialElement = <Login msalInstance={msalInstance} />;
  }

  return (
    <Routes>
      <Route path="/" element={initialElement} />
      <Route path="/login" element={<Login msalInstance={msalInstance} />} />

      <Route path="home"
        element={
          <ProtectedRoute redirectTo="/">
            <Layout signOutClickHandler={signOutClickHandler} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="workflow" element={<Workflow />} />
        <Route path="transaction" element={<Transaction />} />
        <Route path="exploreTools" element={<ExploreTools />} />
        <Route path="uploadData" element={<UploadData />} />
        <Route path="user" element={<User />} />
        <Route path="aicompanymodels" element={<AICompanyModel />} />
        <Route path="aicompanymodelproviders" element={<AICompanyProvider />} />

        <Route path="knowledgebase" element={<KnowledgeBaseProvider><Outlet /></KnowledgeBaseProvider>}>
          <Route index element={<KnowledgeBase />} />
          <Route path=":id" element={<KnowledgeBaseDetails />} />
          <Route path=":id/:typeId" element={<KnowledgeBaseConfig />} />
          <Route path="edit/:kbtype/:kbId" element={<KnowledgeBaseConfigEdit />}/>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AllRoutes;