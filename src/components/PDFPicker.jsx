import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs`;

function PDFPicker({ fileUrl, fileName, onPageSelect, onRemove }) {

    console.log(fileName)
    const [numPages, setNumPages] = useState(null);
    const [selectedPages, setSelectedPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomedPage, setZoomedPage] = useState(0);
    const pageIndicatorsRef = useRef(null);

    const onLoadSuccess = ({ numPages }) => setNumPages(numPages);

    const togglePage = (index) => {
        const newPages = selectedPages.includes(index)
            ? selectedPages.filter((p) => p !== index)
            : [...selectedPages, index];

        setSelectedPages(newPages);
        onPageSelect(fileUrl, newPages);
    };

    const selectAllPages = () => {
        const allPages = Array.from({ length: numPages }, (_, i) => i);
        setSelectedPages(allPages);
        onPageSelect(fileUrl, allPages);
    };

    const removeAllPages = () => {
        setSelectedPages([]);
        onPageSelect(fileUrl, []);
    };

    const nextPage = () => {
        if (currentPage < (numPages - 1)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToPage = (pageIndex) => {
        setCurrentPage(pageIndex);
    };

    const openZoom = (pageIndex = currentPage) => {
        setZoomedPage(pageIndex);
        setIsZoomed(true);
        document.body.style.overflow = 'hidden';
    };

    const closeZoom = () => {
        setIsZoomed(false);
        document.body.style.overflow = 'unset';
    };

    const zoomNextPage = () => {
        if (zoomedPage < numPages - 1) {
            setZoomedPage(zoomedPage + 1);
        }
    };

    const zoomPrevPage = () => {
        if (zoomedPage > 0) {
            setZoomedPage(zoomedPage - 1);
        }
    };

    const handleZoomKeyDown = (e) => {
        if (e.key === 'Escape') {
            closeZoom();
        } else if (e.key === 'ArrowRight') {
            zoomNextPage();
        } else if (e.key === 'ArrowLeft') {
            zoomPrevPage();
        }
    };

    useEffect(() => {
        if (isZoomed) {
            document.addEventListener('keydown', handleZoomKeyDown);
            return () => document.removeEventListener('keydown', handleZoomKeyDown);
        }
    }, [isZoomed, zoomedPage, numPages]);

    // FIXED: Auto-scroll to keep current page indicator visible without jumping to end
    useEffect(() => {
        if (pageIndicatorsRef.current && numPages > 0) {
            const container = pageIndicatorsRef.current;
            const activeButton = container.children[currentPage];
            if (activeButton) {
                const containerWidth = container.offsetWidth;
                const buttonLeft = activeButton.offsetLeft;
                const buttonWidth = activeButton.offsetWidth;
                const scrollLeft = container.scrollLeft;

                // Only scroll if button is actually outside the visible area
                const isVisible = buttonLeft >= scrollLeft &&
                    (buttonLeft + buttonWidth) <= (scrollLeft + containerWidth);

                if (!isVisible) {
                    // Scroll to show the button with some padding, but don't center it
                    const targetScroll = buttonLeft - 50; // 50px padding from left
                    container.scrollTo({
                        left: Math.max(0, targetScroll),
                        behavior: 'smooth'
                    });
                }
            }
        }
    }, [currentPage, numPages]);

    if (!numPages) {
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <h3 style={styles.title}>{fileName}</h3>
                    <button
                        onClick={() => onRemove(fileUrl)}
                        style={styles.removeDocButton}
                        title="Remove PDF"
                    >
                        ×
                    </button>
                </div>
                <div style={styles.loadingContainer}>
                    <Document file={fileUrl} onLoadSuccess={onLoadSuccess}>
                        <div style={styles.loading}>Loading PDF...</div>
                    </Document>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <style>
                {`
                    .page-indicators-scroll::-webkit-scrollbar {
                        height: 6px;
                    }
                    .page-indicators-scroll::-webkit-scrollbar-track {
                        background: #f1f3f4;
                        border-radius: 3px;
                    }
                    .page-indicators-scroll::-webkit-scrollbar-thumb {
                        background: #c1c8cd;
                        border-radius: 3px;
                    }
                    .page-indicators-scroll::-webkit-scrollbar-thumb:hover {
                        background: #a8b2b9;
                    }
                    .clickable-page:hover .zoom-hint {
                        opacity: 1;
                    }
                    .clickable-page:hover {
                        transform: scale(1.02);
                    }
                `}
            </style>
            <div style={styles.header}>
                <h3 style={styles.title}>{fileName}</h3>
                <div style={styles.stats}>
                    {selectedPages.length} of {numPages} pages selected
                </div>
                <button
                    onClick={() => onRemove(fileUrl)}
                    style={styles.removeDocButton}
                    title="Remove PDF"
                >
                    ×
                </button>
            </div>

            <div style={styles.controls}>
                <button
                    onClick={selectAllPages}
                    style={styles.selectButton}
                >
                    Select All Pages
                </button>
                <button
                    onClick={removeAllPages}
                    style={styles.removeButton}
                    disabled={selectedPages.length === 0}
                >
                    Remove All Pages
                </button>
            </div>

            <div style={styles.carouselContainer}>
                <Document file={fileUrl} onLoadSuccess={onLoadSuccess}>
                    <div style={styles.carousel}>
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 0}
                            style={{
                                ...styles.navButton,
                                ...styles.prevButton,
                                ...(currentPage === 0 ? styles.disabledButton : {})
                            }}
                        >
                            ‹
                        </button>

                        <div style={styles.pageContainer}>
                            <div style={styles.pageWrapper}>
                                <div
                                    style={styles.clickablePageContainer}
                                    className="clickable-page"
                                    onClick={() => openZoom(currentPage)}
                                    title="Click to zoom"
                                >
                                    <Page
                                        pageNumber={currentPage + 1}
                                        width={300}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        style={styles.page}
                                    />
                                    <div style={styles.zoomHint} className="zoom-hint">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                                            <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z" />
                                        </svg>
                                    </div>
                                </div>
                                <div style={styles.pageOverlay}>
                                    <label style={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={selectedPages.includes(currentPage)}
                                            onChange={() => togglePage(currentPage)}
                                            style={styles.checkbox}
                                        />
                                        <span style={styles.checkboxText}>
                                            {selectedPages.includes(currentPage) ? 'Selected' : 'Select'} Page {currentPage + 1}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={nextPage}
                            disabled={currentPage === numPages - 1}
                            style={{
                                ...styles.navButton,
                                ...styles.nextButton,
                                ...(currentPage === numPages - 1 ? styles.disabledButton : {})
                            }}
                        >
                            ›
                        </button>
                    </div>
                </Document>

                <div style={styles.pagination}>
                    <span style={styles.pageInfo}>
                        Page {currentPage + 1} of {numPages}
                    </span>
                    <div
                        style={styles.pageIndicators}
                        ref={pageIndicatorsRef}
                        className="page-indicators-scroll"
                    >
                        {Array.from({ length: numPages }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToPage(index)}
                                style={{
                                    ...styles.pageIndicator,
                                    ...(index === currentPage ? styles.activeIndicator : {}),
                                    ...(selectedPages.includes(index) ? styles.selectedIndicator : {})
                                }}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Zoom Modal */}
            {isZoomed && (
                <div style={styles.zoomModal} onClick={closeZoom}>
                    <div style={styles.zoomContent} onClick={(e) => e.stopPropagation()}>
                        <button style={styles.closeButton} onClick={closeZoom} title="Close (Esc)">
                            ×
                        </button>

                        <div style={styles.zoomNavigation}>
                            <button
                                style={{
                                    ...styles.zoomNavButton,
                                    ...styles.zoomPrevButton,
                                    ...(zoomedPage === 0 ? styles.zoomDisabledButton : {})
                                }}
                                onClick={zoomPrevPage}
                                disabled={zoomedPage === 0}
                                title="Previous page (←)"
                            >
                                ‹
                            </button>

                            <div style={styles.zoomedPageContainer}>
                                <Document file={fileUrl}>
                                    <Page
                                        pageNumber={zoomedPage + 1}
                                        width={Math.min(window.innerWidth * 0.8, 800)}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                    />
                                </Document>
                                <div style={styles.zoomPageInfo}>
                                    Page {zoomedPage + 1} of {numPages}
                                    {selectedPages.includes(zoomedPage) && (
                                        <span style={styles.selectedBadge}>✓ Selected</span>
                                    )}
                                </div>
                            </div>

                            <button
                                style={{
                                    ...styles.zoomNavButton,
                                    ...styles.zoomNextButton,
                                    ...(zoomedPage === numPages - 1 ? styles.zoomDisabledButton : {})
                                }}
                                onClick={zoomNextPage}
                                disabled={zoomedPage === numPages - 1}
                                title="Next page (→)"
                            >
                                ›
                            </button>
                        </div>

                        <div style={styles.zoomControls}>
                            <button
                                style={{
                                    ...styles.zoomSelectButton,
                                    ...(selectedPages.includes(zoomedPage) ? styles.zoomDeselectButton : {})
                                }}
                                onClick={() => togglePage(zoomedPage)}
                            >
                                {selectedPages.includes(zoomedPage) ? 'Deselect Page' : 'Select Page'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        backgroundColor: '#ffffff',
        border: '1px solid #e1e5e9',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '2px solid #f8f9fa',
        paddingBottom: '16px'
    },
    title: {
        margin: '0',
        fontSize: '20px',
        fontWeight: '600',
        color: '#2c3e50',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: '60%'
    },
    stats: {
        fontSize: '14px',
        color: '#6c757d',
        backgroundColor: '#f8f9fa',
        padding: '6px 12px',
        borderRadius: '20px',
        fontWeight: '500'
    },
    controls: {
        display: 'flex',
        gap: '12px',
        marginBottom: '24px'
    },
    selectButton: {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: '#218838'
        }
    },
    removeButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: '#c82333'
        },
        ':disabled': {
            backgroundColor: '#6c757d',
            cursor: 'not-allowed',
            opacity: '0.6'
        }
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px'
    },
    loading: {
        fontSize: '16px',
        color: '#6c757d'
    },
    carouselContainer: {
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        overflow: 'hidden'
    },
    carousel: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: '20px'
    },
    navButton: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        fontSize: '24px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        fontWeight: 'bold'
    },
    prevButton: {
        marginRight: '20px'
    },
    nextButton: {
        marginLeft: '20px'
    },
    disabledButton: {
        backgroundColor: '#6c757d',
        cursor: 'not-allowed',
        opacity: '0.6'
    },
    pageContainer: {
        flex: '1',
        display: 'flex',
        justifyContent: 'center',
        minHeight: '400px'
    },
    pageWrapper: {
        position: 'relative',
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    },
    clickablePageContainer: {
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
        ':hover': {
            transform: 'scale(1.02)'
        }
    },
    zoomHint: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '50%',
        width: '30px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: '0',
        transition: 'opacity 0.2s ease'
    },
    page: {
        display: 'block'
    },
    pageOverlay: {
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '12px'
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    },
    checkbox: {
        marginRight: '8px',
        width: '16px',
        height: '16px',
        cursor: 'pointer'
    },
    checkboxText: {
        userSelect: 'none'
    },
    pagination: {
        backgroundColor: 'white',
        padding: '16px',
        borderTop: '1px solid #dee2e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px'
    },
    pageInfo: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#495057'
    },
    pageIndicators: {
        display: 'flex',
        gap: '4px',
        overflowX: 'auto',
        overflowY: 'hidden',
        maxWidth: '500px',
        padding: '4px 0',
        scrollbarWidth: 'thin',
        scrollbarColor: '#cbd5e0 #f7fafc'
    },
    pageIndicator: {
        backgroundColor: '#e9ecef',
        border: '1px solid #ced4da',
        color: '#495057',
        width: '32px',
        height: '32px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        flexShrink: 0,
        whiteSpace: 'nowrap'
    },
    activeIndicator: {
        backgroundColor: '#007bff',
        color: 'white',
        borderColor: '#007bff'
    },
    selectedIndicator: {
        backgroundColor: '#28a745',
        color: 'white',
        borderColor: '#28a745'
    },
    // Zoom Modal Styles
    zoomModal: {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '1000',
        padding: '20px'
    },
    zoomContent: {
        position: 'relative',
        maxWidth: '90vw',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    closeButton: {
        position: 'absolute',
        top: '-50px',
        right: '0',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: 'white',
        border: 'none',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        fontSize: '24px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s ease',
        ':hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.3)'
        }
    },
    zoomNavigation: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
    },
    zoomNavButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: 'white',
        border: 'none',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        fontSize: '32px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        fontWeight: 'bold'
    },
    zoomPrevButton: {},
    zoomNextButton: {},
    zoomDisabledButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        cursor: 'not-allowed',
        opacity: '0.5'
    },
    zoomedPageContainer: {
        position: 'relative',
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    },
    zoomPageInfo: {
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    selectedBadge: {
        backgroundColor: '#28a745',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600'
    },
    zoomControls: {
        marginTop: '20px'
    },
    zoomSelectButton: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease'
    },
    zoomDeselectButton: {
        backgroundColor: '#dc3545'
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    removeDocButton: {
        backgroundColor: 'transparent',
        color: '#dc3545',
        border: 'none',
        fontSize: '24px',
        fontWeight: 'bold',
        cursor: 'pointer',
        padding: '4px 8px',
        borderRadius: '4px',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: '#f8f9fa'
        }
    }
};

export default PDFPicker;