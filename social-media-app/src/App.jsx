import { BrowserRouter } from 'react-router-dom';
import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
