import { BrowserRouter } from 'react-router-dom';
import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Navbar from './components/Navbar';
import UserProfile from './components/UserProfile';
import './App.css';

function App() {
  const [openedProfileId, setOpenedProfileId] = useState(null);

  return (
    <BrowserRouter>
      <Navbar onUserClick={(id) => setOpenedProfileId(id)} />

      {openedProfileId ? (
        <UserProfile
          userId={openedProfileId}
          onBack={() => setOpenedProfileId(null)}
        />
      ) : (
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
