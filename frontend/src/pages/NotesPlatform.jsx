import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Lock, Unlock, FileText, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';
import axios from 'axios';

export const NotesPlatform = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);

  useEffect(() => {
    // Load Razorpay Script dynamically
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);

    // Fetch notes from custom running backend
    axios.get('${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/notes')
      .then(res => {
        setNotes(res.data);
        setFilteredNotes(res.data);
      })
      .catch(err => console.error("Error fetching notes:", err));
  }, []);

  useEffect(() => {
    setFilteredNotes(
      notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, notes]);

  const handleBuy = async (note) => {
    try {
      // 1. Create order on backend (dummy user ID bypassed for test simplicity, usually requires JWT auth header here)
      // Because we haven't built the Login UI fully to store a JWT yet, we will mock the auth token header if API needs it.
      // But let's assume we pass a pseudo-call for demonstration:
      const { data: order } = await axios.post('${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/payments/create-order', 
        { noteId: note._id },
        { headers: { Authorization: "Bearer MOCK_TOKEN" } } // This will 401 fail due to auth middleware if no valid token
      ).catch(err => {
         alert("Please login first! (backend /api/payments requires valid JWT but Login UI is pending)");
         throw err;
      });

      // 2. Open Razorpay Checktout interface
      const options = {
        key: 'rzp_test_SdJxvjzcDkCRnh', // Enter the Key ID generated from the Dashboard
        amount: order.amount,
        currency: "INR",
        name: "DevPortfolio Notes",
        description: `Purchase: ${note.title}`,
        order_id: order.id,
        handler: async function (response) {
          // 3. Verify Payment
          try {
            await axios.post('${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/payments/verify-payment', {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
            }, { headers: { Authorization: "Bearer MOCK_TOKEN" } });
            
            alert('Payment Successful & Verified! Note unlocked.');
          } catch(err) {
            alert('Signature verification failed');
          }
        },
        theme: {
          color: "#3b82f6"
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
       console.error("Payment flow interrupted");
    }
  };

  const handleRead = (note) => {
    if (note.url) {
      window.open(note.url, '_blank');
    } else {
      alert("Note content not available yet!");
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 min-h-screen">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold mb-4">DSA & System Design Notes</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          High-quality, curated notes to help you crack technical interviews and build scalable systems.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search notes, categories..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4" /> Category Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {filteredNotes.map((note, index) => (
          <motion.div 
            key={note.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all"
          >
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                  {note.category}
                </span>
                {note.isFree ? (
                  <Unlock className="h-5 w-5 text-green-500" />
                ) : (
                  <Lock className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{note.title}</h3>
              <div className="flex gap-2 flex-wrap mb-4">
                {note.tags.map(tag => (
                  <span key={tag} className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">#{tag}</span>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between">
              <div className="font-semibold">
                {note.isFree ? <span className="text-green-500">Free</span> : <span>₹{note.price}</span>}
              </div>
              {note.isFree ? (
                <Button size="sm" className="gap-2" onClick={() => handleRead(note)}>
                  <FileText className="h-4 w-4" /> Read Now
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="gap-2 border-primary/50 hover:bg-primary hover:text-primary-foreground" onClick={() => handleBuy(note)}>
                  <Lock className="h-4 w-4" /> Buy Note
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
