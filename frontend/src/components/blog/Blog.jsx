import React, { useState, useMemo, useEffect } from 'react';
import MetaData from '../layout/MetaData';
import { Search, Heart, Eye, Clock, User, ChevronUp } from 'lucide-react';
import styles from './Blog.css';

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [likedPosts, setLikedPosts] = useState([]);

  // Handle scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = [
    { id: 'all', name: 'ທັງໝົດ', icon: '📚' },
    { id: 'tech', name: 'ເທັກໂນໂລຢີ', icon: '💻' },
    { id: 'review', name: 'ລີວິວສິນຄ້າ', icon: '⭐' },
    { id: 'guide', name: 'ຄູ່ມື', icon: '📖' },
    { id: 'news', name: 'ຂ່າວສານ', icon: '📰' }
  ];

  const blogPosts = [
    {
      id: 1,
      title: '10 ລັບທີ່ຕ້ອງຮູ້ກ່ອນຊື້ Laptop ໃໝ່',
      excerpt: 'ຄຳແນະນຳໃນການເລືອກຊື້ Laptop ທີ່ເໝາະສົມກັບການໃຊ້ງານຂອງທ່ານ ແລະ ບັດເລຍບ',
      category: 'guide',
      author: 'ທີມງານ IT HUBB',
      date: '2024-01-15',
      readTime: '5 ນາທີ',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
      views: 1234,
      likes: 89,
      slug: '10-lao-thi-tong-hu-kon-sue-laptop-mai'
    },
    {
      id: 2,
      title: 'ລີວິວ iPhone 15 Pro Max ລາຄາ, ຄຸນສົມບັດ',
      excerpt: 'ທົດລອງໃຊ້ງານຕົວຈິງ iPhone 15 Pro Max ແລະ ບອກທຸກລາຍລະອຽດ',
      category: 'review',
      author: 'ສົມຊາຍ ພົງສະວັນ',
      date: '2024-01-10',
      readTime: '8 ນາທີ',
      image: 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=600&h=400&fit=crop',
      views: 2341,
      likes: 156,
      slug: 'liwiu-iphone-15-pro-max-laka-khun-sombat'
    },
    {
      id: 3,
      title: 'ແນວໂນ້ມເທັກໂນໂລຢີປີ 2024',
      excerpt: 'ສິ່ງທີ່ໜ້າຕື່ນເຕັ້ນໃນໂລກເທັກໂນໂລຢີປີນີ້ ແລະ ອະໄວຍະວະໃໝ່',
      category: 'tech',
      author: 'ດາລາ ວົງສະຫວ່າງ',
      date: '2024-01-08',
      readTime: '6 ນາທີ',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop',
      views: 1876,
      likes: 134,
      slug: 'naew-nom-tech-2024'
    },
    {
      id: 4,
      title: 'ວິທີດູແລ ແລະ ບຳລຸງຮັກສາ Gaming PC',
      excerpt: 'ເຄັດລັບການດູແລ PC Gaming ໃຫ້ອາຍຸຍືນ ແລະ ເຮັດວຽກໄດ້ດີ',
      category: 'guide',
      author: 'ບຸນມີ ໄຊຍະວົງ',
      date: '2024-01-05',
      readTime: '7 ນາທີ',
      image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600&h=400&fit=crop',
      views: 987,
      likes: 67,
      slug: 'withi-du-le-bam-lung-hak-gaming-pc'
    },
    {
      id: 5,
      title: 'ເປີດຕົວ Samsung Galaxy S24 Ultra',
      excerpt: 'Samsung ເປີດຕົວມືຖືລຸ່ນໃໝ່ທີ່ມາພ້ອມຄຸນສົມບັດ AI ທີ່ຫນ້າຕື່ນເຕັ້ນ',
      category: 'news',
      author: 'ທີມງານ IT HUBB',
      date: '2024-01-03',
      readTime: '4 ນາທີ',
      image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&h=400&fit=crop',
      views: 3456,
      likes: 234,
      slug: 'poetua-samsung-galaxy-s24-ultra'
    },
    {
      id: 6,
      title: 'ສຳຫຼວດ MacBook Air M3 ໃໝ່ລ່າສຸດ',
      excerpt: 'ທຸກສິ່ງທີ່ທ່ານຕ້ອງຮູ້ກ່ຽວກັບ MacBook Air ຊິບ M3 ແລະ ສະເປກ',
      category: 'review',
      author: 'ສົມຫຍິງ ພູມມະນີ',
      date: '2024-01-01',
      readTime: '10 ນາທີ',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
      views: 2789,
      likes: 178,
      slug: 'sam-lua-macbook-air-m3-mai-la-sud'
    }
  ];

  const featuredPost = blogPosts[0];

  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const matchCategory = selectedCategory === 'all' || post.category === selectedCategory;
      const matchSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchTerm]);

  const toggleLike = (postId) => {
    setLikedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  return (
    <>
      <MetaData title="ບລັອກ - IT HUBB | ບົດຄວາມເທັກໂນໂລຢີ ແລະ ຄູ່ມື" />

      <div className={styles.blogPage}>
        {/* Hero Section */}
        <section className={styles.blogHero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>📝 ບລັອກເທັກໂນໂລຢີ</h1>
            <p className={styles.heroSubtitle}>
              ຄົ້ນພົບບົດຄວາມ, ລີວິວ, ແລະ ຄູ່ມືການໃຊ້ງານເທັກໂນໂລຢີທີ່ມີປະໂຫຍດ
            </p>

            <div className={styles.searchContainer}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="ຄົ້ນຫາບົດຄວາມ, ລີວິວ, ຫຼື ຄູ່ມື..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className={styles.searchIcon} size={20} />
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className={styles.blogContent}>
          {/* Categories */}
          <div className={styles.categoriesSection}>
            <h2 className={styles.categoriesTitle}>
              <span>🏷️</span>
              <span>ໝວດໝູ່ບົດຄວາມ</span>
            </h2>
            <div className={styles.categoriesGrid}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`${styles.categoryBtn} ${selectedCategory === cat.id ? styles.active : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Featured Post */}
          <div className={styles.featuredSection}>
            <h2 className={styles.sectionTitle}>
              <span>⭐</span>
              <span>ບົດຄວາມແນະນຳ</span>
            </h2>

            <div className={styles.featuredCard}>
              <div className={styles.featuredImage}>
                <img src={featuredPost.image} alt={featuredPost.title} />
              </div>
              <div className={styles.featuredContent}>
                <span className={styles.featuredBadge}>ບົດຄວາມແນະນຳ</span>
                <h3 className={styles.featuredTitle}>{featuredPost.title}</h3>
                <p className={styles.featuredExcerpt}>{featuredPost.excerpt}</p>
                
                <div className={styles.featuredMeta}>
                  <div className={styles.metaItem}>
                    <User size={16} />
                    <span>{featuredPost.author}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Clock size={16} />
                    <span>{featuredPost.readTime}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Eye size={16} />
                    <span>{featuredPost.views.toLocaleString()} ຄັ້ງ</span>
                  </div>
                </div>

                <button className={styles.readMoreBtn}>
                  ອ່ານຕໍ່
                </button>
              </div>
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div>
            <h2 className={styles.sectionTitle}>
              <span>📚</span>
              <span>ບົດຄວາມທັງໝົດ</span>
              <span className={styles.postCount}>
                ({filteredPosts.length} ບົດຄວາມ)
              </span>
            </h2>

            {filteredPosts.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🔍</div>
                <p className={styles.emptyText}>ບໍ່ພົບບົດຄວາມທີ່ຄົ້ນຫາ</p>
                <p className={styles.emptySubtext}>
                  ລອງແປງງົດການຄົ້ນຫາຫຼືເລືອກຫມວດໝູ່ອື່ນ
                </p>
              </div>
            ) : (
              <div className={styles.blogGrid}>
                {filteredPosts.slice(1).map(post => (
                  <div key={post.id} className={styles.blogCard}>
                    <div className={styles.blogImage}>
                      <img src={post.image} alt={post.title} />
                    </div>
                    <div className={styles.blogBody}>
                      <span className={styles.blogCategory}>
                        {categories.find(c => c.id === post.category)?.name}
                      </span>
                      <h3 className={styles.blogTitle}>{post.title}</h3>
                      <p className={styles.blogExcerpt}>{post.excerpt}</p>
                      
                      <div className={styles.blogFooter}>
                        <div className={styles.blogAuthor}>
                          <User size={16} />
                          <span>{post.author}</span>
                        </div>
                        <div className={styles.blogStats}>
                          <div className={styles.statItem}>
                            <Eye size={14} />
                            <span>{post.views.toLocaleString()}</span>
                          </div>
                          <div 
                            className={styles.statItem}
                            onClick={() => toggleLike(post.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <Heart 
                              size={14} 
                              fill={likedPosts.includes(post.id) ? 'currentColor' : 'none'}
                              color={likedPosts.includes(post.id) ? '#ef4444' : 'currentColor'}
                            />
                            <span>{post.likes + (likedPosts.includes(post.id) ? 1 : 0)}</span>
                          </div>
                          <div className={styles.statItem}>
                            <Clock size={14} />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Back to Top Button */}
        <button
          className={`${styles.backToTop} ${showBackToTop ? styles.visible : ''}`}
          onClick={scrollToTop}
          title="ກັບໄປດ້ານເທິງ"
        >
          <ChevronUp size={24} />
        </button>
      </div>
    </>
  );
};

export default Blog;
