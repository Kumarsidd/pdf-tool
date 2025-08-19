import { useState } from 'react';

import mergePDFs from '../utils/merge';
import PDFPicker from '../components/PdfPicker';
import FileUploader from '../components/FileUpload';

function PDFMerger() {
    const [selectedPagesMap, setSelectedPagesMap] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [documents, setDocuments] = useState([]);

    const handleAddDocument = (doc) => {
        setDocuments(prev => [...prev, doc]);
    };

    const handlePageSelect = (fileUrl, selectedPages) => {
        setSelectedPagesMap((prev) => ({
            ...prev,
            [fileUrl]: selectedPages,
        }));
    };

    const handleMerge = async () => {
        const sources = Object.entries(selectedPagesMap)
            .filter(([_, pages]) => pages.length > 0)
            .map(([url, pages]) => ({ url, pages }));

        if (sources.length === 0) {
            alert("No pages selected!");
            return;
        }

        setIsLoading(true);
        try {
            await mergePDFs(sources);
        } catch (error) {
            console.error('Error merging PDFs:', error);
            alert('Error occurred while merging PDFs. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveDocument = (url) => {
        setDocuments(prev => prev.filter(doc => doc.url !== url));
        setSelectedPagesMap(prev => {
            const newMap = { ...prev };
            delete newMap[url];
            return newMap;
        });

        // Clean up blob URLs to prevent memory leaks
        if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    };

    const handleRemoveAllDocuments = () => {
        // Clean up all blob URLs
        documents.forEach(doc => {
            if (doc.url.startsWith('blob:')) {
                URL.revokeObjectURL(doc.url);
            }
        });

        setDocuments([]);
        setSelectedPagesMap({});
    };

    const totalSelectedPages = Object.values(selectedPagesMap).reduce(
        (total, pages) => total + pages.length,
        0
    );

    return (
        <div className="pdf-merger-container">
            <header className="pdf-merger-header">
                <h1 className="pdf-merger-title">PDF Merger Tool</h1>
                <p className="pdf-merger-subtitle">
                    Select pages from your PDFs and merge them into a single document
                </p>
            </header>

            <div className="pdf-stats">
                <div className="pdf-stat-card">
                    <div className="pdf-stat-number">{documents.length}</div>
                    <div className="pdf-stat-label">Documents Available</div>
                </div>
                <div className="pdf-stat-card">
                    <div className="pdf-stat-number">{totalSelectedPages}</div>
                    <div className="pdf-stat-label">Pages Selected</div>
                </div>
            </div>

            <FileUploader onAddDocument={handleAddDocument} />

            {documents.length > 0 && (
                <div className="remove-all-section">
                    <button
                        onClick={handleRemoveAllDocuments}
                        className="remove-all-button"
                    >
                        Remove All Documents
                    </button>
                </div>
            )}

            <div className="documents-section">
                {documents.map((doc) => (
                    <PDFPicker
                        key={doc.url}
                        fileUrl={doc.url}
                        fileName={doc.name}
                        onPageSelect={handlePageSelect}
                        onRemove={handleRemoveDocument}
                    />
                ))}
            </div>

            <div className="action-section">
                <button
                    onClick={handleMerge}
                    disabled={totalSelectedPages === 0 || isLoading}
                    className={`merge-button ${totalSelectedPages === 0 || isLoading ? 'disabled-button' : ''}`}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner"></span>
                            Merging PDFs...
                        </>
                    ) : (
                        `Merge ${totalSelectedPages} Selected Pages`
                    )}
                </button>

                {totalSelectedPages === 0 && (
                    <p className="help-text">
                        Select at least one page from any document to enable merging
                    </p>
                )}
            </div>
        </div>
    );
}

export default PDFMerger;