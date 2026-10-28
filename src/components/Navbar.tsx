import React from 'react';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate }) => {
  const isGallery = currentRoute === '/' || currentRoute === '';
  const isBrandKit = currentRoute.startsWith('/edit');

  return (
    <nav id="main-nav">
      <a
        href="#/"
        className="nav-logo"
        id="nav-logo"
        onClick={(e) => {
          e.preventDefault();
          onNavigate('/');
        }}
      >
        <span className="logo-icon">▶</span>
        <span className="logo-text">
          Motion Reel <span className="logo-accent">Studio</span>
        </span>
      </a>
      <div className="nav-links">
        <a
          href="#/"
          className={`nav-link ${isGallery ? 'active' : ''}`}
          id="nav-gallery"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/');
          }}
        >
          Templates
        </a>
        <a
          href="#/edit/kinetic-text"
          className={`nav-link ${isBrandKit ? 'active' : ''}`}
          id="nav-brand"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/edit/kinetic-text');
          }}
        >
          Brand Kit
        </a>
      </div>
    </nav>
  );
};
