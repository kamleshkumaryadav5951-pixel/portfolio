import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, Save, X, AlertCircle, 
  CheckCircle2, Loader2, Package, Tag, IndianRupee, 
  FileText, ExternalLink, Upload
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const AdminDashboard = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    isFree: true,
    url: '',
    tags: ''
  });

  const axiosConfig = {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/notes`, axiosConfig);
      setNotes(res.data);
    } catch (err) {
      setError('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      price: 0,
      isFree: true,
      url: '',
      tags: ''
    });
    setSelectedFile(null);
    setIsEditing(null);
    setShowAddForm(false);
  };

  const createFormData = () => {
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    if (selectedFile) {
      data.append('file', selectedFile);
    }
    return data;
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = createFormData();
      await axios.post(`${API_URL}/api/notes`, data, {
        headers: { 
          ...axiosConfig.headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess('Note added successfully!');
      fetchNotes();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (id) => {
    setLoading(true);
    try {
      const data = createFormData();
      await axios.put(`${API_URL}/api/notes/${id}`, data, {
        headers: { 
          ...axiosConfig.headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess('Note updated successfully!');
      setIsEditing(null);
      fetchNotes();
    } catch (err) {
      setError('Failed to update note');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await axios.delete(`${API_URL}/api/notes/${id}`, axiosConfig);
      setSuccess('Note deleted!');
      fetchNotes();
    } catch (err) {
      setError('Failed to delete note');
    }
  };

  const startEdit = (note) => {
    setFormData({
      title: note.title,
      description: note.description,
      category: note.category,
      price: note.price,
      isFree: note.isFree,
      url: note.url || '',
      tags: Array.isArray(note.tags) ? note.tags.join(', ') : note.tags
    });
    setIsEditing(note._id);
    setShowAddForm(false);
  };

  if (loading && notes.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold flex items-center gap-3">
            <Package className="h-10 w-10 text-primary" /> Admin Panel
          </h1>
          <p className="text-muted-foreground mt-2">Manage your DSA notes and marketplace content</p>
        </div>
        <Button 
          onClick={() => { setShowAddForm(!showAddForm); setIsEditing(null); }}
          className="gap-2 shadow-lg shadow-primary/20"
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddForm ? 'Cancel' : 'Add New Note'}
        </Button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3 font-medium"
          >
            <AlertCircle className="h-5 w-5" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto hover:opacity-70"><X className="h-4 w-4" /></button>
          </motion.div>
        )}
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 flex items-center gap-3 font-medium"
          >
            <CheckCircle2 className="h-5 w-5" />
            {success}
            <button onClick={() => setSuccess(null)} className="ml-auto hover:opacity-70"><X className="h-4 w-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(showAddForm || isEditing) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-12 bg-card border border-border rounded-2xl overflow-hidden shadow-xl"
          >
            <form onSubmit={isEditing ? (e) => { e.preventDefault(); handleUpdateNote(isEditing); } : handleAddNote} className="p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
                {isEditing ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {isEditing ? 'Edit Note' : 'Create New Note'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold opacity-70">Note Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Backtracking Masterclass"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold opacity-70">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g. Algorithms"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    required
                  />
                </div>

                <div className="space-y-2 col-span-full">
                  <label className="text-sm font-semibold opacity-70">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Brief overview of the note content..."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold opacity-70">Price (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      disabled={formData.isFree}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold opacity-70 flex items-center gap-2">
                    <Upload className="h-4 w-4" /> Note File (PDF/Image)
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 rounded-xl border border-dashed border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <p className="text-[10px] text-muted-foreground italic">Or provide a manual URL below</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold opacity-70">Direct URL (Optional)</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="url"
                      name="url"
                      value={formData.url}
                      onChange={handleInputChange}
                      placeholder="https://..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold opacity-70">Tags (comma separated)</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="recursion, dynamic programming, intermediate"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="isFree"
                    name="isFree"
                    checked={formData.isFree}
                    onChange={handleInputChange}
                    className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="isFree" className="font-bold cursor-pointer select-none">Mark as Free Note</label>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Button type="submit" className="gap-2" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isEditing ? 'Update Note' : 'Publish Note'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="p-4 font-bold">Title</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Price</th>
                <th className="p-4 font-bold">Links</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {notes.map((note) => (
                <tr key={note._id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-medium">{note.title}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider">
                      {note.category}
                    </span>
                  </td>
                  <td className="p-4">
                    {note.isFree ? (
                      <span className="text-green-500 font-bold text-sm">Free</span>
                    ) : (
                      <span className="text-amber-500 font-bold text-sm">Paid</span>
                    )}
                  </td>
                  <td className="p-4 font-semibold">
                    {note.isFree ? '₹0' : `₹${note.price}`}
                  </td>
                  <td className="p-4">
                    <a href={note.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 group">
                      View <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => startEdit(note)}
                        className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteNote(note._id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {notes.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-muted-foreground font-medium">
                    No notes found. Click "Add New Note" to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
