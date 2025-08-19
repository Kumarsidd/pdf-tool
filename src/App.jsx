import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import path from './path';
import Home from './pages/Home';
import PDFMerger from './pages/PDFMerger';
import WaterMark from './pages/WaterMark';
import Header from './components/Header';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import DummyError from './pages/DummyError';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Header />
        <main className="main-content">
          <Routes>
            <Route path={path.home} element={<Home />} />
            <Route path={path.pdfMerge} element={<PDFMerger />} />
            <Route path={path.pdfWatermark} element={<WaterMark />} />
            <Route path={path.dummyError} element={<DummyError />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </Router>
    </ErrorBoundary>
  );
}

export default App;