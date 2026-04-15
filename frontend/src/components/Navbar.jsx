import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, BookOpen, Code2 } from 'lucide-react';
import { Button } from './ui/Button';

export const Navbar = () => {
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Auth check
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'undefined') {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing user from localStorage', err);
        localStorage.removeItem('user');
      }
    }

    // Initial theme check
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && isDark)) {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setTheme('dark');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-6xl px-4 flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 font-bold text-lg">
          <Code2 className="h-6 w-6 text-primary" />
          <span>DevPortfolio</span>
        </Link>
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link to="/" className="transition-colors hover:text-primary">Home</Link>
          <Link to="/notes" className="transition-colors hover:text-primary flex items-center gap-1">
            <BookOpen className="h-4 w-4" /> Notes Platform
          </Link>
          {user && (
            <Link to="/dashboard" className="transition-colors hover:text-primary">Dashboard</Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="transition-colors hover:text-primary text-primary/80 font-bold border-l border-border pl-6 ml-2">Admin Panel</Link>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={toggleTheme} className="p-2 rounded-md hover:bg-muted transition-colors">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          {user ? (
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-border hidden md:inline-flex">Logout</Button>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm" className="hidden border-border md:inline-flex">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
