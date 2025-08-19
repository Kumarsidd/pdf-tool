import { useState, useRef } from 'react';

function FileUploader({ onAddDocument }) {
    const [urlInput, setUrlInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        files.forEach(file => {
            if (file.type === 'application/pdf') {
                const url = URL.createObjectURL(file);
                onAddDocument({
                    name: file.name,
                    url: url
                });
            } else {
                alert(`${file.name} is not a PDF file.`);
            }
        });
        event.target.value = '';
    };

    const handleUrlAdd = async () => {
        if (!urlInput.trim()) {
            alert('Please enter a URL');
            return;
        }

        setIsLoading(true);
        try {
            const fileName = urlInput.split('/').pop() || 'PDF Document';
            onAddDocument({
                name: fileName.includes('.pdf') ? fileName : `${fileName}.pdf`,
                url: urlInput
            });
            setUrlInput('');
        } catch (error) {
            alert('Error adding PDF from URL');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.uploaderContainer}>
            <h2 style={styles.uploaderTitle}>Add PDF Documents</h2>

            <div style={styles.uploaderSection}>
                <div style={styles.uploadArea}>
                    <h3 style={styles.sectionTitle}>Upload Files</h3>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        multiple
                        onChange={handleFileUpload}
                        style={styles.fileInput}
                    />
                    <button
                        onClick={() => fileInputRef.current.click()}
                        style={styles.uploadButton}
                    >
                        Choose PDF Files
                    </button>
                </div>

                <div style={styles.urlArea}>
                    <h3 style={styles.sectionTitle}>Add from URL</h3>
                    <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://example.com/document.pdf"
                        style={styles.urlInput}
                    />
                    <button
                        onClick={handleUrlAdd}
                        disabled={isLoading || !urlInput.trim()}
                        style={{
                            ...styles.urlButton,
                            ...(isLoading || !urlInput.trim() ? styles.disabledButton : {})
                        }}
                    >
                        {isLoading ? 'Adding...' : 'Add PDF'}
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    uploaderContainer: {
        backgroundColor: '#ffffff',
        border: '1px solid #e1e5e9',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    uploaderTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#2c3e50',
        margin: '0 0 20px 0'
    },
    uploaderSection: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px'
    },
    uploadArea: {
        textAlign: 'center'
    },
    urlArea: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    sectionTitle: {
        fontSize: '16px',
        fontWeight: '500',
        color: '#495057',
        marginBottom: '12px'
    },
    fileInput: {
        display: 'none'
    },
    uploadButton: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: '#0056b3'
        }
    },
    urlInput: {
        padding: '10px 12px',
        border: '1px solid #ced4da',
        borderRadius: '6px',
        fontSize: '14px'
    },
    urlButton: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: '#0056b3'
        }
    },
    disabledButton: {
        backgroundColor: '#6c757d',
        cursor: 'not-allowed',
        opacity: '0.6'
    }
};

export default FileUploader;