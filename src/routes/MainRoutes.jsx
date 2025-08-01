import { lazy } from 'react'

// project imports
import MainLayout from '@/layout/MainLayout'
import Loadable from '@/ui-component/loading/Loadable'
import ProtectedRoute from '@/components/ProtectedRoute'

// chatflows routing
const Chatflows = Loadable(lazy(() => import('@/views/chatflows')))

// agents routing
const Agentflows = Loadable(lazy(() => import('@/views/agentflows')))

// marketplaces routing
const Marketplaces = Loadable(lazy(() => import('@/views/marketplaces')))

// apikey routing
const APIKey = Loadable(lazy(() => import('@/views/apikey')))

// tools routing
const Tools = Loadable(lazy(() => import('@/views/tools')))

// assistants routing
const Assistants = Loadable(lazy(() => import('@/views/assistants')))
const OpenAIAssistantLayout = Loadable(lazy(() => import('@/views/assistants/openai/OpenAIAssistantLayout')))
const CustomAssistantLayout = Loadable(lazy(() => import('@/views/assistants/custom/CustomAssistantLayout')))
const CustomAssistantConfigurePreview = Loadable(lazy(() => import('@/views/assistants/custom/CustomAssistantConfigurePreview')))

// credentials routing
const Credentials = Loadable(lazy(() => import('@/views/credentials')))

// variables routing
const Variables = Loadable(lazy(() => import('@/views/variables')))

// documents routing
const Documents = Loadable(lazy(() => import('@/views/docstore')))
const DocumentStoreDetail = Loadable(lazy(() => import('@/views/docstore/DocumentStoreDetail')))
const ShowStoredChunks = Loadable(lazy(() => import('@/views/docstore/ShowStoredChunks')))
const LoaderConfigPreviewChunks = Loadable(lazy(() => import('@/views/docstore/LoaderConfigPreviewChunks')))
const VectorStoreConfigure = Loadable(lazy(() => import('@/views/docstore/VectorStoreConfigure')))
const VectorStoreQuery = Loadable(lazy(() => import('@/views/docstore/VectorStoreQuery')))

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
    path: '/',
    element: (
        <ProtectedRoute>
            <MainLayout />
        </ProtectedRoute>
    ),
    children: [
        {
            path: '/',
            element: <Chatflows />
        },
        {
            path: '/chatflows',
            element: <Chatflows />
        },
        {
            path: '/agentflows',
            element: <Agentflows />
        },
        {
            path: '/marketplaces',
            element: <Marketplaces />
        },
        {
            path: '/apikey',
            element: <APIKey />
        },
        {
            path: '/tools',
            element: <Tools />
        },
        {
            path: '/assistants',
            element: <Assistants />
        },
        {
            path: '/assistants/custom',
            element: <CustomAssistantLayout />
        },
        {
            path: '/assistants/custom/:id',
            element: <CustomAssistantConfigurePreview />
        },
        {
            path: '/assistants/openai',
            element: <OpenAIAssistantLayout />
        },
        {
            path: '/credentials',
            element: <Credentials />
        },
        {
            path: '/variables',
            element: <Variables />
        },
        {
            path: '/document-stores',
            element: <Documents />
        },
        {
            path: '/document-stores/:storeId',
            element: <DocumentStoreDetail />
        },
        {
            path: '/document-stores/chunks/:storeId/:fileId',
            element: <ShowStoredChunks />
        },
        {
            path: '/document-stores/:storeId/:name',
            element: <LoaderConfigPreviewChunks />
        },
        {
            path: '/document-stores/vector/:storeId',
            element: <VectorStoreConfigure />
        },
        {
            path: '/document-stores/vector/:storeId/:docId',
            element: <VectorStoreConfigure />
        },
        {
            path: '/document-stores/query/:storeId',
            element: <VectorStoreQuery />
        }
    ]
}

export default MainRoutes
