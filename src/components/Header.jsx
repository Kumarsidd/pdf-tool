import React from 'react'
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const navLinks = [
    { to: "/pdf-merge", label: "PDFMerge" },
    { to: "/pdf-watermark", label: "Watermark" },
    { to: "/pdf-remove-pages", label: "Remove Pages" },
    { to: "/pdf-split", label: "Split PDF" },
    { to: "/pdf-compress", label: "Compress PDF" },
    { to: "/pdf-convert", label: "Convert PDF" }
  ];

  return (
    <header className="header">
      <div className="container">
        <div className="nav-brand">
          <h2><Link to="/">PDFTools</Link></h2>
        </div>
        <nav className="nav-menu">
          {navLinks.map((link) => (
            <Link
              to={link.to}
              className={`${location.pathname === link.to ? 'active' : ''}`}
              key={link.to}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header >
  )
}

export default Header