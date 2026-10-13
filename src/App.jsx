import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import Home from './pages/Home.jsx'
import NewAnalysis from './pages/NewAnalysis.jsx'
import GuardarAnalisis from './pages/GuardarAnalisis.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="nuevo-analisis" element={<NewAnalysis />} />
        <Route path="Analisis Guardados" element={<GuardarAnalisis />}/>
        {/* Ruta futura: "ayuda" */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
