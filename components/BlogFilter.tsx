"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

type Post = any;
type Category = { id: string | number; title: string };

export default function BlogFilter({ posts, categories }: { posts: Post[], categories: Category[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredPosts = activeCategory === 'all' 
    ? posts 
    : posts.filter(post => {
        const postCategories = post.category || [];
        return postCategories.some((c: any) => (c.title || c) === activeCategory);
      });

  return (
    <div className="w-full">
      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
        <button
          onClick={() => setActiveCategory('all')}
          className={twMerge(
            "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer",
            activeCategory === 'all' 
              ? "bg-[#3B2D2A] text-[#F9F8F6] shadow-md scale-105" 
              : "bg-white/50 text-[#3B2D2A]/70 hover:bg-white hover:text-[#3B2D2A] border border-[#3B2D2A]/10 hover:-translate-y-0.5"
          )}
        >
          全部文章
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.title)}
            className={twMerge(
              "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer",
              activeCategory === cat.title 
                ? "bg-[#3B2D2A] text-[#F9F8F6] shadow-md scale-105" 
                : "bg-white/50 text-[#3B2D2A]/70 hover:bg-white hover:text-[#3B2D2A] border border-[#3B2D2A]/10 hover:-translate-y-0.5"
            )}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {/* Posts Grid with Framer Motion */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14"
      >
        <AnimatePresence mode="popLayout">
          {filteredPosts.map((post) => {
            const postCategories = post.category || [];
            const primaryCategory = postCategories[0]?.title || postCategories[0] || '';
            const seriesTag = post.series ? `連載：${post.series}` : '';

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                key={post.id}
              >
                <Link 
                  href={`/post/${post.slug || post.id}`} 
                  className="group flex flex-col h-full"
                >
                  <div className="w-full aspect-[4/5] bg-stone-200 overflow-hidden mb-5 rounded-sm shadow-sm relative">
                    <img 
                      src={post.heroImage?.url || `https://picsum.photos/seed/${post.id}/600/800`} 
                      alt={post.heroImage?.alt || post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>
                  
                  <div className="text-xs font-bold text-[#3B2D2A]/60 mb-3 tracking-widest flex items-center gap-2 flex-wrap">
                    {primaryCategory && <span className="text-amber-700/90">{primaryCategory}</span>}
                    {(primaryCategory && seriesTag) && <span>•</span>}
                    {seriesTag && <span>{seriesTag}</span>}
                  </div>
                  
                  <h3 className="text-2xl font-serif text-[#3B2D2A] mb-3 group-hover:text-amber-800 transition-colors leading-[1.3]">
                    {post.title}
                  </h3>
                  
                  {post.excerpt && (
                    <p className="text-stone-600 text-sm leading-relaxed line-clamp-2 font-sans mt-auto">
                      {post.excerpt}
                    </p>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filteredPosts.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="w-full text-center py-20 text-[#3B2D2A]/50 font-serif text-xl tracking-widest"
        >
          這個分類目前還沒有文章喔。
        </motion.div>
      )}
    </div>
  );
}
