import { useNavigate } from 'react-router-dom';
import path from '../path';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>All Your PDF Needs in One Place</h1>
            <p>Powerful, fast, and secure PDF tools to merge, watermark, edit, and manage your documents with ease.</p>
          </div>
          <div className="hero-image">
            <div className="pdf-preview">
              <div className="pdf-icon">📄</div>
              <div className="tools-floating">
                <span className="tool-badge">Merge</span>
                <span className="tool-badge">Watermark</span>
                <span className="tool-badge">Edit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2>Powerful PDF Tools</h2>
            <p>Everything you need to work with PDF documents efficiently</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon merge">🔗</div>
              <h3>PDF Merge</h3>
              <p>Combine multiple PDF files into a single document quickly and easily. Maintain quality and formatting.</p>
              <button className="btn-outline" onClick={() => navigate(path.pdfMerge)}>Try Merge</button>
            </div>

            <div className="feature-card">
              <div className="feature-icon watermark">💧</div>
              <h3>PDF Watermark</h3>
              <p>Add text or image watermarks to protect your documents. Customize position, opacity, and style.</p>
              <button className="btn-outline" onClick={() => navigate(path.pdfWatermark)}>Add Watermark</button>
            </div>

            <div className="feature-card">
              <div className="feature-icon remove">✂️</div>
              <h3>Remove Pages</h3>
              <p>Delete unwanted pages from your PDF documents. Select specific pages or ranges to remove.</p>
              <button className="btn-outline" onClick={() => navigate(path.pdfRemovePages)}>Remove Pages</button>
            </div>

            <div className="feature-card">
              <div className="feature-icon split">📑</div>
              <h3>PDF Split</h3>
              <p>Split large PDF files into smaller documents. Extract specific pages or split by page ranges.</p>
              <button className="btn-outline" onClick={() => navigate(path.pdfSplit)}>Split PDF</button>
            </div>

            <div className="feature-card">
              <div className="feature-icon compress">🗜️</div>
              <h3>PDF Compress</h3>
              <p>Reduce file size without losing quality. Perfect for sharing and storage optimization.</p>
              <button className="btn-outline" onClick={() => navigate(path.pdfCompress)}>Compress PDF</button>
            </div>

            <div className="feature-card">
              <div className="feature-icon convert">🔄</div>
              <h3>PDF Convert</h3>
              <p>Convert PDFs to various formats like Word, Excel, PowerPoint, and images. Fast and accurate.</p>
              <button className="btn-outline" onClick={() => navigate(path.pdfConvert)}>Convert PDF</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home;