import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Book, ShoppingBag, Download, 
  ExternalLink, Loader2, FileText, ChevronRight 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import axios from 'axios';
import { Link } from 'react-router-dom';

export const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(res.data);
      } catch (err) {
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-500 font-bold mb-4">{error}</p>
        <Link to="/login">
          <Button>Return to Login</Button>
        </Link>
      </div>
    );
  }

  const purchasedNotes = userData?.purchasedNotes || [];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row gap-8 mb-12 items-start">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-80 bg-card border border-border rounded-3xl p-8 shadow-sm"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <User className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">{userData.name}</h2>
            <p className="text-muted-foreground text-sm mb-4">{userData.email}</p>
            <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-xs font-bold uppercase tracking-wider">
              {userData.role} Account
            </div>
          </div>
          
          <div className="mt-8 space-y-4">
             <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Joined</span>
                <span className="font-semibold">{new Date(userData.createdAt).toLocaleDateString()}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Purchased Notes</span>
                <span className="font-semibold">{purchasedNotes.length}</span>
             </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <div className="flex-1 space-y-8 w-full">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-extrabold flex items-center gap-2">
              <ShoppingBag className="h-8 w-8 text-primary" /> Library
            </h1>
            <Link to="/notes">
              <Button variant="outline" size="sm">Browse More</Button>
            </Link>
          </div>

          {purchasedNotes.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {purchasedNotes.map((note) => (
                <motion.div
                  key={note._id}
                  layout
                  className="flex gap-4 p-5 bg-card border border-border rounded-2xl hover:border-primary/50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg truncate pr-2">{note.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-1 mb-3">{note.category}</p>
                    <div className="flex gap-2">
                      <a 
                        href={note.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button size="sm" className="w-full gap-2">
                          <ExternalLink className="h-4 w-4" /> Open Note
                        </Button>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-16 rounded-3xl border-2 border-dashed border-border flex flex-col items-center text-center">
              <Book className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-xl font-bold mb-2">No purchased notes yet</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                Start your learning journey by exploring our collection of high-quality DSA and System Design resources.
              </p>
              <Link to="/notes">
                <Button className="gap-2">
                  Browse Notes <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
