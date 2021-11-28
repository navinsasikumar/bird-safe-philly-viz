import * as React from 'react';
import { siteTitle } from './constants';

export default function Header() {
  return (
    <header className="z-50">
      <nav className="flex items-center justify-between p-6 bg-gray-700">
        <div className="text-lg text-white">{siteTitle}</div>
      </nav>
    </header>
  );
}
