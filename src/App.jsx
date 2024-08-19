import { Route, Routes } from 'react-router-dom'
import './App.css'
import QRGenerator from './components/QRGenerator/QRGenerator'
import CameraComponent from './components/CameraComponent/CameraComponent'
import GalleryComponent from './components/GalleryComponent/GalleryComponent'

function App() {

  return (
    <>
    <Routes>
      <Route path='/qrgenerator' element={<QRGenerator/>}/>
      <Route path='/camera/:id' element={<CameraComponent/>}/>
      <Route path='/gallery/:id' element={<GalleryComponent/>}/>
    </Routes>
    </>
  )
}

export default App
