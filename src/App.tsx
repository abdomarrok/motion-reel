import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Gallery } from './components/Gallery';
import { Editor } from './components/Editor';

function parseHash(hash: string): { path: string; param: string | null } {
  const clean = hash.replace(/^#/, '') || '/';
  const parts = clean.split('/').filter(Boolean);

  if (parts.length === 0) return { path: '/', param: null };
  if (parts.length === 1) return { path: `/${parts[0]}`, param: null };
  return { path: `/${parts[0]}`, param: parts.slice(1).join('/') };
}

export const App: React.FC = () => {
  const [currentHash, setCurrentHash] = useState<string>(() => window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (to: string) => {
    const target = to.startsWith('#') ? to : `#${to.startsWith('/') ? '' : '/'}${to}`;
    window.location.hash = target;
  };

  const { path, param } = parseHash(currentHash);

  return (
    <div id="app">
      <Navbar currentRoute={currentHash.replace(/^#/, '') || '/'} onNavigate={navigate} />

      <main id="content">
        {path === '/edit' && param ? (
          <Editor templateId={param} onBack={() => navigate('/')} />
        ) : (
          <Gallery onSelectTemplate={(templateId) => navigate(`/edit/${templateId}`)} />
        )}
      </main>
    </div>
  );
};

export default App;
