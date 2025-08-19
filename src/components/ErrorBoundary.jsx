import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error Boundary caught an error:', error, errorInfo);
        }
    }

    handleRefresh = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return <ErrorFallback
                error={this.state.error}
                errorInfo={this.state.errorInfo}
                onRefresh={this.handleRefresh}
                onGoHome={this.handleGoHome}
            />;
        }

        return this.props.children;
    }
}

const ErrorFallback = ({ error, errorInfo, onRefresh, onGoHome }) => {
    return (
        <div className="error-boundary-container">
            <div className="error-boundary-content">
                <div className="floating-elements">
                    <div className="floating-element">⚠️</div>
                    <div className="floating-element">🔧</div>
                    <div className="floating-element">📄</div>
                    <div className="floating-element">💥</div>
                </div>

                <div className="error-icon">⚠️</div>
                <div className="error-code">Oops!</div>
                <h1 className="error-title">Something went wrong</h1>
                <p className="error-message">
                    We encountered an unexpected error while processing your request.
                    Don't worry, your data is safe and our team has been notified.
                </p>

                <div className="error-actions">
                    <button onClick={onRefresh} className="btn-primary">
                        🔄 Try Again
                    </button>
                    <button onClick={onGoHome} className="btn-secondary">
                        🏠 Go Home
                    </button>
                </div>

                {process.env.NODE_ENV === 'development' && error && (
                    <details className="error-details">
                        <summary className="error-details-summary">
                            🐛 Technical Details (Development Only)
                        </summary>
                        <div className="error-stack">
                            <strong>Error:</strong> {error.toString()}
                            <br />
                            <strong>Component Stack:</strong>
                            <pre>{errorInfo?.componentStack}</pre>
                        </div>
                    </details>
                )}

                <p className="help-text">
                    If the problem persists, please contact our support team with the error details.
                </p>
            </div>
        </div>
    );
};

export default ErrorBoundary;