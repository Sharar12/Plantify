/* ==========================================================================
 * Specialist Q&A Desk Page
 * ==========================================================================
 * Allows plant specialists (and admins) to view and respond to customer
 * questions about plants. Each question card shows:
 *   - Left column: Full plant details (image, name, price, stock, description, care tips)
 *   - Right column: Customer question with reply textarea or existing answer
 * Includes filtering by status (all/pending/answered), category, and search.
 * ========================================================================== */
'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Plant } from '@/types/plant';

interface Question {
  id: number;
  customer_id: number;
  specialist_id: number | null;
  question: string;
  answer: string | null;
  customer: { id: number; name: string };
  specialist: { id: number; name: string } | null;
  plant: Plant;
  created_at: string;
}

export default function SpecialistQA() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [replies, setReplies] = useState<{ [key: number]: string }>({});
  const [submitting, setSubmitting] = useState<{ [key: number]: boolean }>({});

  // Filter States
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'answered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.role !== 'specialist' && parsedUser.role !== 'admin') {
        window.location.href = '/';
      }
    } else {
      window.location.href = '/login';
    }
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/questions`);
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (questionId: number) => {
    const answer = replies[questionId];
    if (!answer || !answer.trim()) {
      alert('Please enter an answer');
      return;
    }

    setSubmitting(prev => ({ ...prev, [questionId]: true }));
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/questions/${questionId}/answer`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            answer, 
            user_id: user.id 
          }),
        }
      );

      if (res.ok) {
        setReplies(prev => {
          const newReplies = { ...prev };
          delete newReplies[questionId];
          return newReplies;
        });
        fetchQuestions();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to submit answer');
      }
    } catch (err) {
      alert('An error occurred while submitting the answer');
    } finally {
      setSubmitting(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const getImageSrc = (img: string) =>
    img?.startsWith('http')
      ? img
      : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${img}`;

  // Dynamically compute unique categories from questions list
  const categories = ['all', ...Array.from(new Set(questions.map(q => q.plant?.category).filter(Boolean)))];

  // Client-side Filtering
  const filteredQuestions = questions.filter(q => {
    // Status Filter
    if (statusFilter === 'pending' && q.answer) return false;
    if (statusFilter === 'answered' && !q.answer) return false;

    // Category Filter
    if (categoryFilter !== 'all' && q.plant?.category?.toLowerCase() !== categoryFilter.toLowerCase()) return false;

    // Search Query (matches plant name, scientific name, customer name, or question text)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchPlant = q.plant?.name?.toLowerCase().includes(query) || q.plant?.scientific_name?.toLowerCase().includes(query);
      const matchCustomer = q.customer?.name?.toLowerCase().includes(query);
      const matchQuestion = q.question?.toLowerCase().includes(query);
      return matchPlant || matchCustomer || matchQuestion;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
          </div>
          <p className="text-sm text-gray-400 uppercase tracking-widest font-light animate-pulse">
            Loading Questions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50/20 to-white font-['Inter',sans-serif] antialiased">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-50/30 via-transparent to-transparent pointer-events-none" />
      
      <Header user={user} onLogout={handleLogout} />

      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-extralight text-gray-900 tracking-tight">
            Customer <span className="text-emerald-600">Q&A Desk</span>
          </h1>
          <p className="text-gray-400 font-light mt-2">
            Respond to customer inquiries with complete plant profiles and guidelines at your fingertips
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-3xl p-6 shadow-sm mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-2xl border border-gray-100 max-w-sm w-full md:w-auto">
            {(['all', 'pending', 'answered'] as const).map((tab) => {
              const count = questions.filter(q => {
                if (tab === 'pending') return !q.answer;
                if (tab === 'answered') return q.answer;
                return true;
              }).length;

              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`flex-1 md:flex-none px-4 py-2 text-xs font-light rounded-xl transition-all duration-300 capitalize flex items-center justify-center gap-1.5 ${
                    statusFilter === tab
                      ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100/80 font-medium'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <span>{tab === 'all' ? 'All' : tab === 'pending' ? 'Pending' : 'Answered'}</span>
                  <span className={`px-1.5 py-0.5 text-[9px] rounded-full ${statusFilter === tab ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 justify-end">
            {/* Search input */}
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search plant, question, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-light text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all duration-300"
              />
            </div>

            {/* Category Filter */}
            <div className="relative w-full sm:max-w-xs">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-light text-gray-700 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all duration-300 appearance-none capitalize cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.filter(c => c !== 'all').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>

        </div>

        {/* Filter Counts Summary */}
        <div className="mb-4 px-2 flex justify-between items-center text-xs text-gray-400 font-light">
          <span>Showing {filteredQuestions.length} of {questions.length} Questions</span>
          {(statusFilter !== 'all' || searchQuery || categoryFilter !== 'all') && (
            <button 
              onClick={() => {
                setStatusFilter('all');
                setSearchQuery('');
                setCategoryFilter('all');
              }}
              className="text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="space-y-8">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <p className="text-gray-400 font-light">No matching questions found</p>
              <p className="text-sm text-gray-300 font-light mt-1">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <div 
                key={q.id} 
                className="bg-white border border-gray-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-0"
              >
                {/* Left Column: Full Plant Card Details */}
                <div className="lg:col-span-4 bg-gray-50/50 border-r border-gray-100 p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                      {q.plant?.category || 'Plant'}
                    </span>
                    
                    <div className="relative group w-full h-48 rounded-2xl overflow-hidden bg-white border border-gray-100 flex items-center justify-center p-4">
                      {q.plant?.thumbnail ? (
                        <img 
                          src={getImageSrc(q.plant.thumbnail)} 
                          alt={q.plant.name} 
                          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-6xl opacity-20">🌿</span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-medium text-gray-900 leading-tight">
                        {q.plant?.name}
                      </h3>
                      <p className="text-xs italic text-gray-400 font-light mt-0.5">
                        {q.plant?.scientific_name}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="bg-white border border-gray-100 rounded-xl p-2.5">
                        <span className="text-gray-400 font-light block">Price</span>
                        <span className="font-semibold text-gray-800">TK.{q.plant?.price}</span>
                      </div>
                      <div className="bg-white border border-gray-100 rounded-xl p-2.5">
                        <span className="text-gray-400 font-light block">Stock</span>
                        <span className="font-semibold text-gray-800">{q.plant?.stock} left</span>
                      </div>
                    </div>

                    {q.plant?.description && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium block">Description</span>
                        <p className="text-xs text-gray-500 font-light line-clamp-3 leading-relaxed">
                          {q.plant.description}
                        </p>
                      </div>
                    )}

                    {q.plant?.care_tips && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium block">Care Instructions</span>
                        <p className="text-xs text-gray-500 font-light line-clamp-3 leading-relaxed">
                          {q.plant.care_tips}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100/80 mt-4 flex items-center justify-between">
                    <a 
                      href={`/plant/${q.plant?.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-light flex items-center gap-1 group/link"
                    >
                      View full plant page
                      <svg className="w-3.5 h-3.5 transform group-hover/link:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Right Column: Q&A Interaction */}
                <div className="lg:col-span-8 p-6 md:p-8 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                          {q.customer?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{q.customer?.name}</p>
                          <p className="text-xs text-gray-400 font-light">
                            Asked on {new Date(q.created_at).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <span className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full ${q.answer ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'}`}>
                        {q.answer ? 'Resolved' : 'Pending Reply'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="text-xs uppercase tracking-widest text-emerald-600 font-semibold">Customer Question</span>
                      </div>
                      <p className="text-gray-800 font-light text-lg leading-relaxed pl-3.5 border-l-2 border-emerald-100">
                        {q.question}
                      </p>
                    </div>

                    {/* Answer Response area */}
                    {q.answer ? (
                      <div className="bg-emerald-50/30 border border-emerald-100/50 rounded-2xl p-5 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          <span className="text-xs uppercase tracking-widest text-emerald-700 font-semibold">Your Response</span>
                        </div>
                        <p className="text-gray-700 font-light text-sm leading-relaxed pl-3.5 border-l-2 border-emerald-200">
                          {q.answer}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-light text-right mt-1">
                          Answered by {q.specialist?.name || 'Specialist'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span className="text-xs uppercase tracking-widest text-amber-600 font-semibold">Write an Answer</span>
                        </div>
                        <textarea
                          value={replies[q.id] || ''}
                          onChange={(e) => setReplies(prev => ({ ...prev, [q.id]: e.target.value }))}
                          placeholder="Provide custom advice, tips, or troubleshooting details for this plant..."
                          rows={4}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700 placeholder-gray-300 text-sm font-light focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 resize-none shadow-inner"
                        />
                        <button
                          onClick={() => handleReply(q.id)}
                          disabled={submitting[q.id]}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-light rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 flex items-center gap-2"
                        >
                          {submitting[q.id] ? 'Sending...' : 'Send Answer'}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
