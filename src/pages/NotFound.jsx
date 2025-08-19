import React from 'react'
import path from '../path'

const NotFound = () => {
    return (
        <div class="not-found-container">
            <div class="not-found-content">
                <div class="floating-elements">
                    <div class="floating-element">📄</div>
                    <div class="floating-element">🔍</div>
                    <div class="floating-element">❓</div>
                    <div class="floating-element">⚠️</div>
                </div>

                <div class="not-found-icon">🔍</div>
                <div class="error-code">404</div>
                <h1 class="error-title">Page Not Found</h1>
                <p class="error-message">
                    Oops! The page you're looking for seems to have vanished into thin air.
                    Don't worry, our PDF tools are still working perfectly!
                </p>

                <div class="not-found-actions">
                    <a href={path.home} class="btn-primary">
                        🏠 Back to Home
                    </a>
                    <a href={path.home} class="btn-secondary">
                        🛠️ Browse Tools
                    </a>
                </div>

                <p class="help-text">
                    Need help? Try searching for what you need or contact our support team.
                </p>
            </div>
        </div>
    )
}

export default NotFound