import React, { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const WaterMark = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [watermarkText, setWatermarkText] = useState('WATERMARK');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [inputMode, setInputMode] = useState('file'); // 'file' or 'url'
  const [watermarkOptions, setWatermarkOptions] = useState({
    fontSize: 50,
    opacity: 0.3,
    rotation: 45,
    color: '#ff0000'
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setError('');
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 1, g: 0, b: 0 };
  };

  const fetchPdfFromUrl = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    } catch (error) {
      throw new Error(`Error fetching PDF from URL: ${error.message}`);
    }
  };

  const addWatermarkToPdf = async () => {
    if (!watermarkText.trim()) {
      setError('Please enter watermark text');
      return;
    }

    if (inputMode === 'file' && !pdfFile) {
      setError('Please select a PDF file');
      return;
    }

    if (inputMode === 'url' && !pdfUrl.trim()) {
      setError('Please enter a PDF URL');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      let pdfBytes;

      if (inputMode === 'file') {
        pdfBytes = await pdfFile.arrayBuffer();
      } else {
        pdfBytes = await fetchPdfFromUrl(pdfUrl);
      }

      const pdfDoc = await PDFDocument.load(pdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();

      const { r, g, b } = hexToRgb(watermarkOptions.color);

      pages.forEach((page) => {
        const { width, height } = page.getSize();

        // Calculate position for center placement
        const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, watermarkOptions.fontSize);
        const x = (width - textWidth) / 2;
        const y = height / 2;

        page.drawText(watermarkText, {
          x: x,
          y: y,
          size: watermarkOptions.fontSize,
          font: helveticaFont,
          color: rgb(r, g, b),
          opacity: watermarkOptions.opacity,
          rotate: {
            type: 'degrees',
            angle: watermarkOptions.rotation,
          },
        });
      });

      const watermarkedPdfBytes = await pdfDoc.save();

      // Download the watermarked PDF
      const blob = new Blob([watermarkedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'watermarked-document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      setError(`Error processing PDF: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="pdf-watermark-container">
      <header className="pdf-watermark-header">
        <h1 className="pdf-watermark-title">PDF Watermark Tool</h1>
        <p className="pdf-watermark-subtitle">
          Add custom watermarks to your PDF documents with full control over appearance
        </p>
      </header>

      <div className="watermark-card">
        {/* Input Mode Selection */}
        <div className="input-mode-section">
          <h3 className="section-title">Choose Input Method</h3>
          <div className="radio-group">
            <label
              className={`radio-option ${inputMode === 'file' ? 'active' : ''}`}
              onClick={() => setInputMode('file')}
            >
              <input
                type="radio"
                value="file"
                checked={inputMode === 'file'}
                onChange={(e) => setInputMode(e.target.value)}
              />
              📁 Upload PDF File
            </label>
            <label
              className={`radio-option ${inputMode === 'url' ? 'active' : ''}`}
              onClick={() => setInputMode('url')}
            >
              <input
                type="radio"
                value="url"
                checked={inputMode === 'url'}
                onChange={(e) => setInputMode(e.target.value)}
              />
              🌐 PDF from URL
            </label>
          </div>
        </div>

        {/* File Upload Section */}
        {inputMode === 'file' && (
          <div className="upload-section">
            <h3 className="section-title">Upload Your PDF</h3>
            <div className={`file-upload-area ${pdfFile ? 'has-file' : ''}`}>
              <div className="upload-icon">📄</div>
              <div className="upload-text">
                {pdfFile ? 'File Selected!' : 'Click to browse or drag & drop'}
              </div>
              <div className="upload-subtext">
                {pdfFile ? '' : 'PDF files only, up to 50MB'}
              </div>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="file-input"
              />
              {pdfFile && (
                <div className="file-info">
                  📋 {pdfFile.name}
                </div>
              )}
            </div>
          </div>
        )}

        {/* URL Input Section */}
        {inputMode === 'url' && (
          <div className="url-section">
            <h3 className="section-title">PDF URL</h3>
            <div className="url-input-group">
              <input
                type="url"
                placeholder="https://example.com/document.pdf"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                className="url-input"
              />
            </div>
          </div>
        )}

        {/* Watermark Configuration */}
        <div className="watermark-config-section">
          <h3 className="section-title">Watermark Settings</h3>

          <div className="watermark-controls">
            <div className="form-field full-width">
              <label className="field-label">Watermark Text</label>
              <input
                type="text"
                placeholder="Enter your watermark text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="text-input"
              />
            </div>

            <div className="control-group">
              <div className="form-field">
                <label className="field-label">Font Size</label>
                <div className="range-control">
                  <input
                    type="range"
                    min="10"
                    max="500"
                    value={watermarkOptions.fontSize}
                    onChange={(e) => setWatermarkOptions({
                      ...watermarkOptions,
                      fontSize: parseInt(e.target.value)
                    })}
                    className="range-input"
                  />
                  <span className="range-value">{watermarkOptions.fontSize}px</span>
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">Opacity</label>
                <div className="range-control">
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={watermarkOptions.opacity}
                    onChange={(e) => setWatermarkOptions({
                      ...watermarkOptions,
                      opacity: parseFloat(e.target.value)
                    })}
                    className="range-input"
                  />
                  <span className="range-value">{watermarkOptions.opacity}</span>
                </div>
              </div>
            </div>

            <div className="control-group">
              <div className="form-field">
                <label className="field-label">Rotation</label>
                <div className="range-control">
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={watermarkOptions.rotation}
                    onChange={(e) => setWatermarkOptions({
                      ...watermarkOptions,
                      rotation: parseInt(e.target.value)
                    })}
                    className="range-input"
                  />
                  <span className="range-value">{watermarkOptions.rotation}°</span>
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">Color</label>
                <input
                  type="color"
                  value={watermarkOptions.color}
                  onChange={(e) => setWatermarkOptions({
                    ...watermarkOptions,
                    color: e.target.value
                  })}
                  className="color-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-alert">
            ⚠️ {error}
          </div>
        )}

        {/* Process Button */}
        <button
          onClick={addWatermarkToPdf}
          disabled={isProcessing}
          className={`watermark-process-btn ${isProcessing ? 'processing' : ''}`}
        >
          {isProcessing ? (
            <>
              <span className="process-spinner"></span>
              Processing Watermark...
            </>
          ) : (
            <>
              ✨ Add Watermark & Download
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WaterMark;