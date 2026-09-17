'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { ProductData } from '@/lib/markdown';
import { siteConfig } from '@/site.config';

interface ProductListProps {
  initialProducts: ProductData[];
}

/** Strip HTML tags and return plain text excerpt */
function getExcerpt(html: string, maxLen = 80): string {
  const plain = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return plain.length > maxLen ? plain.slice(0, maxLen) + '…' : plain;
}

function ProductModal({
  product,
  onClose,
}: {
  product: ProductData;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      {/* Panel — single scrollable container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--base-surface)',
          border: '1px solid var(--subtle-border)',
          borderRadius: '12px',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '75vh',
          overflowY: 'auto',
          position: 'relative',
          padding: '20px 20px 28px',
        }}
      >
        {/* Close — sticky so it stays visible while scrolling */}
        <button
          onClick={onClose}
          aria-label="关闭"
          style={{
            position: 'sticky',
            top: 0,
            float: 'right',
            marginLeft: '8px',
            fontSize: '15px',
            color: 'var(--secondary-ink)',
            padding: '2px',
            lineHeight: 1,
          }}
        >
          <i className="ri-close-line" />
        </button>

        {/* Meta: date · category [· archived] */}
        <div style={{
          fontSize: '11px',
          color: 'var(--secondary-ink)',
          fontFamily: 'ui-monospace, SFMono-Regular, monospace',
          letterSpacing: '0.02em',
          marginBottom: '6px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <time dateTime={product.date}>{product.date.replace(/-/g, '.')}</time>
          <span style={{ opacity: 0.35 }}>·</span>
          <span style={{ fontFamily: 'var(--font-inter), PingFang SC, sans-serif' }}>{product.category}</span>
          {product.status === 'archived' && (
            <>
              <span style={{ opacity: 0.35 }}>·</span>
              <span>{siteConfig.labels.archivedProduct}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '14px',
          fontWeight: 600,
          lineHeight: 1.45,
          marginBottom: '16px',
          paddingRight: '24px',
        }}>
          {product.title}
        </h2>

        {/* Cover image (from frontmatter) */}
        {product.image && (
          <img
            src={product.image}
            alt={product.title}
            style={{
              width: '100%',
              height: '160px',
              objectFit: 'cover',
              borderRadius: '6px',
              marginBottom: '16px',
              display: 'block',
            }}
          />
        )}

        {/* Full markdown content */}
        <div className="markdown-content" dangerouslySetInnerHTML={{ __html: product.contentHtml }} />
      </div>
    </div>
  );
}


export default function ProductList({ initialProducts }: ProductListProps) {
  const [activeCategory, setActiveCategory] = useState<string>(siteConfig.labels.allCategories);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDark, setIsDark] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);

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

  const closeModal = useCallback(() => setSelectedProduct(null), []);

  return (
    <div>
      {/* ── Header ── */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '20px',
        marginBottom: '36px',
        borderBottom: '1px solid var(--subtle-border)',
        gap: '16px',
      }}>
        {/* Logo */}
        <button
          onClick={() => setActiveCategory(siteConfig.labels.allCategories)}
          style={{ padding: 0, flexShrink: 0 }}
        >
          <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.01em', color: 'var(--primary-ink)' }}>
            {siteConfig.title}
          </span>
        </button>

        {/* Category text nav — plain text, no pills */}
        <nav aria-label="分类筛选" style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          flex: 1,
          justifyContent: 'center',
        }}>
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: 0,
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--primary-ink)' : 'var(--secondary-ink)',
                  whiteSpace: 'nowrap',
                  opacity: 1,
                  transition: 'color 0.15s ease',
                }}
              >
                {cat}
              </button>
            );
          })}
        </nav>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="切换主题"
          style={{
            fontSize: '17px',
            color: 'var(--secondary-ink)',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <i className={isDark ? 'ri-sun-line' : 'ri-moon-line'}></i>
        </button>
      </header>

      {/* ── Intro ── */}
      <div style={{ marginBottom: '36px' }}>
        <p className="dimmed" style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
          {siteConfig.subtitle}
        </p>
        <p style={{ fontSize: '14px', color: 'var(--secondary-ink)', margin: 0 }}>
          {siteConfig.description}
        </p>
      </div>

      {/* ── Product List ── */}
      <section>
        {filteredProducts.length === 0 ? (
          <p className="dimmed" style={{ fontSize: '14px' }}>{siteConfig.labels.noProducts}</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {paginatedProducts.map((product) => {
              const isArchived = product.status === 'archived';
              const excerpt = getExcerpt(product.contentHtml, 80);

              return (
                <li key={product.id}>
                  <article
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedProduct(product)}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedProduct(product)}
                    style={{
                      display: 'flex',
                      gap: '20px',
                      alignItems: 'flex-start',
                      padding: '18px 0',
                      borderBottom: '1px solid var(--subtle-border)',
                      opacity: isArchived ? 0.45 : 1,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = isArchived ? '0.3' : '0.7'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = isArchived ? '0.45' : '1'; }}
                  >
                    {/* Date */}
                    <time
                      dateTime={product.date}
                      style={{
                        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                        fontSize: '12px',
                        color: 'var(--secondary-ink)',
                        whiteSpace: 'nowrap',
                        minWidth: '80px',
                        paddingTop: '2px',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {product.date.replace(/-/g, '.')}
                    </time>

                    {/* Title + excerpt */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <h2 style={{ fontSize: '15px', fontWeight: 600 }}>
                          {product.title}
                        </h2>
                        {isArchived && (
                          <span style={{
                            fontSize: '11px',
                            padding: '1px 7px',
                            borderRadius: '999px',
                            border: '1px solid var(--subtle-border)',
                            color: 'var(--secondary-ink)',
                            fontWeight: 400,
                          }}>
                            {siteConfig.labels.archivedProduct}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--secondary-ink)', margin: 0, lineHeight: 1.6 }}>
                        {excerpt}
                      </p>
                    </div>

                    {/* Category + thumbnail */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                      <span style={{ fontSize: '12px', color: 'var(--secondary-ink)', whiteSpace: 'nowrap' }}>
                        {product.category}
                      </span>
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.title}
                          style={{
                            width: '64px',
                            height: '64px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            display: 'block',
                            margin: 0,
                          }}
                        />
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <nav style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '24px',
          marginTop: '48px',
        }}>
          <button
            onClick={() => {
              setCurrentPage(p => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === 1}
            style={{
              fontSize: '14px',
              color: 'var(--secondary-ink)',
              opacity: currentPage === 1 ? 0.3 : 1,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            {siteConfig.labels.previousPage}
          </button>
          <span style={{ fontSize: '13px', color: 'var(--secondary-ink)' }}>
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => {
              setCurrentPage(p => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === totalPages}
            style={{
              fontSize: '14px',
              color: 'var(--secondary-ink)',
              opacity: currentPage === totalPages ? 0.3 : 1,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            {siteConfig.labels.nextPage}
          </button>
        </nav>
      )}

      {/* ── Modal ── */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={closeModal} />
      )}
    </div>
  );
}
