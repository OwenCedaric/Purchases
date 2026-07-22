'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { ProductData } from '@/lib/markdown';
import { siteConfig } from '@/site.config';

interface ProductListProps {
  initialProducts: ProductData[];
}

export default function ProductList({ initialProducts }: ProductListProps) {
  const [activeCategory, setActiveCategory] = useState<string>(siteConfig.labels.allCategories);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);
    if (nextIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(initialProducts.map((p) => p.category));
    cats.delete('满分推荐'); 
    return [siteConfig.labels.allCategories, ...Array.from(cats)];
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      if (product.category === '满分推荐') return false; 
      if (activeCategory === siteConfig.labels.allCategories) return true;
      return product.category === activeCategory;
    });
  }, [initialProducts, activeCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  const totalPages = Math.ceil(filteredProducts.length / siteConfig.pagination.pageSize);
  
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * siteConfig.pagination.pageSize,
    currentPage * siteConfig.pagination.pageSize
  );

  return (
    <div>
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '32px 0 16px 0',
        marginBottom: '64px'
      }}>
        <button 
          onClick={() => setActiveCategory(siteConfig.labels.allCategories)}
          style={{ cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {siteConfig.logoIconSvg && (
            <span 
              style={{ width: '22px', height: '22px', display: 'flex', color: 'var(--primary-ink)' }} 
              dangerouslySetInnerHTML={{ __html: siteConfig.logoIconSvg }} 
            />
          )}
          <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '0.05em', color: 'var(--primary-ink)' }}>{siteConfig.logo}</span>
        </button>

        <nav aria-label="Main navigation" style={{ 
          display: 'flex', 
          gap: '24px', 
          flexWrap: 'nowrap',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}>
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: isActive ? 'var(--primary-ink)' : 'var(--secondary-ink)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '14px',
                  letterSpacing: '0.1em',
                  whiteSpace: 'nowrap',
                  textDecoration: isActive ? 'underline' : 'none',
                  textUnderlineOffset: '6px'
                }}
              >
                {cat}
              </button>
            );
          })}
        </nav>

        <button 
          onClick={toggleTheme}
          aria-label="切换主题"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            color: 'var(--primary-ink)',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.7,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
        >
          <i className={isDark ? 'ri-sun-line' : 'ri-moon-line'}></i>
        </button>
      </header>

      {/* Prologue Section (Title + Epigraph) */}
      <div className="dual-column" style={{ marginBottom: '64px', alignItems: 'flex-start' }}>
        {/* Left: Title Area */}
        <div style={{ flex: '1' }}>
           <p className="dimmed" style={{ marginBottom: '12px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{siteConfig.subtitle}</p>
           <h1 style={{ marginBottom: '16px', fontSize: 'clamp(28px, 4vw, 36px)', lineHeight: '1.3' }}>{siteConfig.title}</h1>
           <p className="dimmed" style={{ margin: 0, fontSize: '15px' }}>{siteConfig.description}</p>
        </div>
        
        {/* Right: Epigraph Area */}
        <div style={{ flex: '1', borderLeft: '1px solid var(--subtle-border)', paddingLeft: '32px', marginTop: '24px' }}>
         <div className="epigraph" style={{ margin: 0, fontSize: '15px', lineHeight: '1.8', color: 'var(--secondary-ink)' }}>
          {siteConfig.epigraph.map((line, idx) => (
            <p key={idx} style={{ margin: 0, marginBottom: idx !== siteConfig.epigraph.length -1 ? '12px' : 0 }}>
              {line}
            </p>
          ))}
         </div>
        </div>
      </div>

      <hr />

      {/* Main Content Section */}
      <section>
        {filteredProducts.length === 0 ? (
          <p className="dimmed" style={{ textAlign: 'center' }}>{siteConfig.labels.noProducts}</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {paginatedProducts.map((product, index) => {
              const isHero = currentPage === 1 && index === 0;
              const isArchived = product.status === 'archived';

              return (
                <li key={product.id}>
                  <article 
                    className="post-list-item" 
                    style={{ 
                      marginBottom: '120px',
                      opacity: isArchived ? 0.6 : 1,
                      transition: 'opacity 0.2s ease'
                    }}
                  >
                    
                    <header style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
                      {/* Left Metadata Column */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', minWidth: '88px' }}>
                        <time dateTime={product.date} style={{ 
                          fontFamily: 'monospace', 
                          color: 'var(--secondary-ink)', 
                          fontSize: '13px', 
                          whiteSpace: 'nowrap',
                          letterSpacing: '0.05em'
                        }}>
                          {product.date.replace(/-/g, '.')}
                        </time>
                        <span className="dimmed" style={{ fontSize: '12px', letterSpacing: '0.1em' }}>{product.category}</span>
                      </div>

                      {/* Right Title Column */}
                      <div style={{ flex: 1 }}>
                        <h2 style={{ 
                          marginTop: '0', 
                          marginBottom: '0', 
                          fontSize: isHero ? 'clamp(28px, 4vw, 36px)' : undefined,
                          color: isArchived ? 'var(--secondary-ink)' : 'inherit',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          flexWrap: 'wrap'
                        }}>
                          {product.title}
                          {isArchived && (
                            <span style={{ 
                              fontSize: '12px', 
                              padding: '2px 8px', 
                              backgroundColor: 'var(--subtle-border)', 
                              color: 'var(--secondary-ink)',
                              borderRadius: '4px',
                              letterSpacing: '0.05em',
                              fontWeight: 400
                            }}>
                              {siteConfig.labels.archivedProduct}
                            </span>
                          )}
                        </h2>
                      </div>
                    </header>

                    {isHero && product.image ? (
                      <>
                        <img src={product.image} alt={product.title} className="cover-image" style={{ borderRadius: '8px', filter: isArchived ? 'grayscale(100%)' : 'none' }} />
                        <div className="markdown-content" dangerouslySetInnerHTML={{ __html: product.contentHtml }} />
                      </>
                    ) : product.image ? (
                      <div className="dual-column">
                        <div className="markdown-content" dangerouslySetInnerHTML={{ __html: product.contentHtml }} />
                        <div>
                          <img src={product.image} alt={product.title} className="cover-image" style={{ marginBottom: 0, borderRadius: '8px', filter: isArchived ? 'grayscale(100%)' : 'none' }} />
                        </div>
                      </div>
                    ) : (
                      <div className="markdown-content" dangerouslySetInnerHTML={{ __html: product.contentHtml }} />
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {totalPages > 1 && (
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '64px', borderTop: '1px solid var(--subtle-border)', paddingTop: '24px' }}>
          <button 
            onClick={() => {
              setCurrentPage(p => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === 1}
            style={{ opacity: currentPage === 1 ? 0.3 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            {siteConfig.labels.previousPage}
          </button>
          <span className="dimmed" style={{ fontSize: '14px' }}>
            {currentPage} / {totalPages}
          </span>
          <button 
            onClick={() => {
              setCurrentPage(p => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === totalPages}
            style={{ opacity: currentPage === totalPages ? 0.3 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            {siteConfig.labels.nextPage}
          </button>
        </nav>
      )}
    </div>
  );
}
