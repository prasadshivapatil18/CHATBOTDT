import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit3, Check, X, Search, ShieldCheck } from 'lucide-react';
import type { KnowledgeArticle } from '../types';
import { api } from '../services/api';
import { NeoButton } from './ui/NeoButton';
import { NeoBadge } from './ui/NeoBadge';
import { NeoInput } from './ui/NeoInput';

export const KnowledgeManager: React.FC = () => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Form states
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('shipping');
  const [keywords, setKeywords] = useState<string>('');
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    fetchArticles();
  }, [searchQuery]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const data = await api.getKnowledgeArticles(searchQuery);
      setArticles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      if (editingArticle) {
        await api.updateKnowledgeArticle(editingArticle.id, {
          title,
          category,
          keywords,
          content,
        });
      } else {
        await api.createKnowledgeArticle({
          title,
          category,
          keywords,
          content,
          is_verified: true,
        });
      }
      resetForm();
      fetchArticles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this verified policy article?')) return;
    try {
      await api.deleteKnowledgeArticle(id);
      fetchArticles();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (art: KnowledgeArticle) => {
    setEditingArticle(art);
    setTitle(art.title);
    setCategory(art.category);
    setKeywords(art.keywords);
    setContent(art.content);
    setIsCreating(true);
  };

  const resetForm = () => {
    setEditingArticle(null);
    setTitle('');
    setCategory('shipping');
    setKeywords('');
    setContent('');
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#FFE156]" />
            STORE KNOWLEDGE BASE
          </h3>
          <p className="text-xs font-bold text-stone-600">
            Ground truth documentation used by SIDEKICK AI to answer customer inquiries without hallucinations.
          </p>
        </div>

        <NeoButton
          variant="yellow"
          size="sm"
          onClick={() => {
            resetForm();
            setIsCreating(true);
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Add New Article</span>
        </NeoButton>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter knowledge articles by keywords..."
          className="w-full pl-9 pr-4 py-2.5 bg-white text-xs font-bold border-[3px] border-[#171717] rounded-[4px] shadow-[3px_3px_0_#171717] focus:outline-none"
        />
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
      </div>

      {/* Create / Edit Form Drawer */}
      {isCreating && (
        <form onSubmit={handleSave} className="p-5 bg-white border-[3px] border-[#171717] rounded-[6px] shadow-[6px_6px_0_#171717] space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-black text-sm uppercase">
              {editingArticle ? 'Edit Policy Article' : 'Create New Ground Truth Policy'}
            </h4>
            <button type="button" onClick={resetForm} className="font-black hover:text-[#FF6B6B]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NeoInput
              label="ARTICLE TITLE"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Return Policy for Electronics"
              required
            />
            <div>
              <label className="block text-xs font-black uppercase mb-1">CATEGORY</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-white border-[3px] border-[#171717] rounded-[4px] font-bold text-xs shadow-[3px_3px_0_#171717] focus:outline-none"
              >
                <option value="shipping">Shipping & Delivery</option>
                <option value="returns">Returns & Refunds</option>
                <option value="warranty">Warranty & Repairs</option>
                <option value="payments">Billing & Payments</option>
                <option value="cancellations">Cancellations</option>
                <option value="policies">General Policies</option>
              </select>
            </div>
          </div>

          <NeoInput
            label="RETRIEVAL KEYWORDS (COMMA-SEPARATED)"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g. return, refund, 30 days, damaged box"
          />

          <div>
            <label className="block text-xs font-black uppercase mb-1">GROUNDED POLICY CONTENT</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
              placeholder="Enter exact verified policy terms..."
              className="w-full p-3 bg-white border-[3px] border-[#171717] rounded-[4px] shadow-[3px_3px_0_#171717] font-medium text-xs focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <NeoButton type="submit" variant="yellow" size="sm">
              <Check className="w-4 h-4" />
              <span>{editingArticle ? 'Update Article' : 'Publish Article'}</span>
            </NeoButton>
            <NeoButton type="button" variant="white" size="sm" onClick={resetForm}>
              Cancel
            </NeoButton>
          </div>
        </form>
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-12 font-black text-xs uppercase animate-pulse">
            Loading Knowledge Base...
          </div>
        ) : articles.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white border-[3px] border-[#171717] rounded-[4px] font-bold text-stone-500">
            No articles match your query. Click "Add New Article" to expand knowledge.
          </div>
        ) : (
          articles.map((art) => (
            <div
              key={art.id}
              className="p-4 bg-white border-[3px] border-[#171717] rounded-[4px] shadow-[4px_4px_0_#171717] flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <NeoBadge variant="lime" className="text-[10px]">
                    <ShieldCheck className="w-3 h-3 mr-0.5" />
                    VERIFIED • {art.category.toUpperCase()}
                  </NeoBadge>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => startEdit(art)}
                      className="p-1 text-stone-600 hover:text-black hover:bg-stone-100 rounded"
                      title="Edit Article"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(art.id)}
                      className="p-1 text-[#FF6B6B] hover:bg-red-50 rounded"
                      title="Delete Article"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h4 className="font-black text-base">{art.title}</h4>
                <p className="text-xs font-medium text-stone-700 line-clamp-3">
                  {art.content}
                </p>
              </div>

              {art.keywords && (
                <div className="mt-3 pt-2 border-t text-[11px] font-mono text-stone-500 truncate">
                  Keywords: {art.keywords}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
