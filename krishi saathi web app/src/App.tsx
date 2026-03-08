import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ScanCrop from './pages/ScanCrop';
import CropDiary from './pages/CropDiary';
import SahayakChat from './pages/SahayakChat';
import MandiVoice from './pages/MandiVoice';
import PestWarning from './pages/PestWarning';
import LunarCalendar from './pages/LunarCalendar';
import { LanguageProvider } from './context/LanguageContext';
import { AppProvider } from './context/AppContext';
import AppTour from './components/AppTour';

function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <AppTour />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/home" replace />} />
              <Route path="home" element={<Home />} />
              <Route path="scan" element={<ScanCrop />} />
              <Route path="diary" element={<CropDiary />} />
              <Route path="sahayak-chat" element={<SahayakChat />} />
              <Route path="mandi-voice" element={<MandiVoice />} />
              <Route path="pest-warning" element={<PestWarning />} />
              <Route path="lunar-calendar" element={<LunarCalendar />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </LanguageProvider>
  );
}

export default App;
