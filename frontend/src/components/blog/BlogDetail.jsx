import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  useGetBlogDetailsQuery, 
  useLikeBlogMutation, 
  useAddCommentMutation,
  useGetRelatedBlogsQuery 
} from '../redux/api/blogApi';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import MetaData from '../layout/MetaData';
import { toast } from 'react-hot-toast';

const BlogDetail = () => {
  const { id } = useParams();
  const { user } = useSelector(state => state.auth);
  const [commentText, setCommentText] = useState('');
  
  const { data, isLoading, error } = useGetBlogDetailsQuery(id);
  const [likeBlog] = useLikeBlogMutation();
  const [addComment] = useAddCommentMutation();

  const blog = data?.blog || data; 

  const handleLike = async () => {
    if (!user) {
      toast.error('ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ');
      return;
    }
    try {
      await likeBlog(id).unwrap();
      toast.success('ຖືກໃຈສຳເລັດ');
    } catch (err) {
      toast.error('ບໍ່ສາມາດຖືກໃຈໄດ້');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ');
      return;
    }
    if (commentText.trim()) {
      try {
        await addComment({ id, text: commentText }).unwrap();
        setCommentText('');
        toast.success('ສົ່ງຄວາມຄິດເຫັນສຳເລັດ');
      } catch (err) {
        toast.error('ບໍ່ສາມາດສົ່ງຄວາມຄິດເຫັນໄດ້');
      }
    }
  };

  const formatDate = (date) => {
    try {
      if (!date) return '';
      const result = formatDistanceToNow(new Date(date), { 
        addSuffix: true 
      });
      
      // แปลงข้อความภาษาอังกฤษเป็นภาษาลาว
      const translations = {
        'less than a minute ago': 'ກວ່າ 1 ນາທີ',
        'minute ago': 'ນາທີ',
        'minutes ago': 'ນາທີ',
        'hour ago': 'ຊົ່ວໂມງ',
        'hours ago': 'ຊົ່ວໂມງ',
        'day ago': 'ມື້',
        'days ago': 'ມື້',
        'week ago': 'ອາທິດ',
        'weeks ago': 'ອາທິດ',
        'month ago': 'ເດືອນ',
        'months ago': 'ເດືອນ',
        'year ago': 'ປີ',
        'years ago': 'ປີ',
        'ago': 'ຜ່ານມາ'
      };
      
      let translated = result;
      for (const [en, lo] of Object.entries(translations)) {
        translated = translated.replace(new RegExp(en, 'g'), lo);
      }
      return translated;
    } catch (e) {
      return 'ບໍ່ນານມານີ້';
    }
  };

  if (isLoading) return <BlogDetailSkeleton />;
  if (error) return <BlogDetailError error={error} />;
  if (!blog && !isLoading) return <BlogNotFound />;
  
  const isLiked = blog?.likes?.some(like => (like.user || like) === user?._id);

  return (
    <>
      <MetaData title={`${blog?.title || 'ບົດຄວາມ'} - ບລັອກເທັກໂນໂລຢີ`} />
      <style>{`
        .blog-detail-container {
          max-width: 70%;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          font-family: "Noto Sans Lao", "Phetsarath OT", sans-serif;
        }

        .blog-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .category-section {
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .category-badge {
          display: inline-block;
          padding: 0.5rem 1.25rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 25px;
          font-size: 0.875rem;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .publish-date {
          color: #718096;
          font-size: 0.9rem;
        }

        .blog-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 1.5rem;
          line-height: 1.3;
          background: linear-gradient(135deg, #1e293b 0%, #4a5568 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .author-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .author-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #e2e8f0;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .author-info {
          text-align: left;
        }

        .author-name {
          margin: 0;
          font-size: 1.1rem;
          color: #2d3748;
          font-weight: 600;
        }

        .author-email {
          margin: 0;
          font-size: 0.875rem;
          color: #718096;
        }

        .blog-image-container {
          margin-bottom: 3rem;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .blog-image {
          width: 100%;
          height: auto;
          display: block;
          transition: transform 0.3s ease;
        }

        .blog-image:hover {
          transform: scale(1.02);
        }

        .blog-image-placeholder {
          width: 100%;
          height: 400px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 6rem;
          color: #cbd5e0;
        }

        .blog-content {
          font-size: 1.15rem;
          line-height: 1.9;
          color: #2d3748;
          margin-bottom: 3rem;
        }

        .blog-content h1, .blog-content h2, .blog-content h3, 
        .blog-content h4, .blog-content h5, .blog-content h6 {
          color: #1e293b;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .blog-content p {
          margin-bottom: 1.5rem;
        }

        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 1.5rem 0;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .blog-content blockquote {
          border-left: 4px solid #667eea;
          margin: 1.5rem 0;
          padding: 1rem 1.5rem;
          background: rgba(102, 126, 234, 0.05);
          border-radius: 0 12px 12px 0;
          font-style: italic;
        }

        .blog-content code {
          background: #f8fafc;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }

        .blog-content pre {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1.5rem 0;
        }

        .tags-container {
          margin-bottom: 2rem;
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .tag-item {
          background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%);
          color: #4a5568;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .tag-item:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transform: translateY(-2px);
        }

        .engagement-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 0;
          border-top: 2px solid #edf2f7;
          border-bottom: 2px solid #edf2f7;
          margin-bottom: 3rem;
        }

        .like-btn {
          border: none;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          color: #4a5568;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .like-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .like-btn.liked {
          background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
          color: #dc3545;
        }

        .stats-info {
          display: flex;
          gap: 2rem;
          color: #718096;
          font-size: 0.95rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .comments-section {
          background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%);
          padding: 2rem;
          border-radius: 20px;
          margin-bottom: 3rem;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .comments-title {
          margin-bottom: 1.5rem;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
        }

        .comment-form {
          margin-bottom: 2rem;
        }

        .comment-textarea {
          width: 100%;
          padding: 1rem;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          margin-bottom: 1rem;
          font-size: 1rem;
          outline: none;
          resize: vertical;
          min-height: 100px;
          transition: border-color 0.3s ease;
        }

        .comment-textarea:focus {
          border-color: #667eea;
        }

        .submit-comment-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .submit-comment-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
        }

        .login-prompt {
          text-align: center;
          padding: 2rem;
          border: 2px dashed #e2e8f0;
          border-radius: 12px;
          margin-bottom: 2rem;
          background: white;
        }

        .login-link {
          color: #667eea;
          font-weight: 600;
          text-decoration: none;
        }

        .login-link:hover {
          text-decoration: underline;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .comment-item {
          display: flex;
          gap: 1rem;
        }

        .comment-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e2e8f0;
        }

        .comment-content {
          flex: 1;
          background: white;
          padding: 1rem 1.5rem;
          border-radius: 0 15px 15px 15px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .comment-author {
          margin: 0 0 0.5rem 0;
          color: #2d3748;
          font-weight: 600;
        }

        .comment-text {
          margin: 0;
          color: #4a5568;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .comment-time {
          font-size: 0.75rem;
          color: #a0aec0;
          margin-top: 0.5rem;
          display: block;
        }

        .related-section {
          margin-top: 4rem;
        }

        .related-title {
          margin-bottom: 2rem;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .related-card {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          text-decoration: none;
          color: inherit;
        }

        .related-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
          border-color: #667eea;
        }

        .related-card-title {
          margin: 0 0 0.75rem 0;
          font-size: 1.1rem;
          color: #1e293b;
          line-height: 1.4;
          font-weight: 600;
        }

        .related-card-excerpt {
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 1rem;
          line-height: 1.6;
          height: 3.6rem;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }

        .related-read-more {
          color: #667eea;
          font-weight: 600;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .skeleton-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }

        .skeleton-header {
          margin-bottom: 2rem;
        }

        .skeleton-title {
          height: 3rem;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .skeleton-content {
          height: 400px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 16px;
          margin-bottom: 2rem;
        }

        .error-container {
          text-align: center;
          padding: 4rem 2rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .error-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.3;
        }

        .error-title {
          color: #dc3545;
          margin-bottom: 0.5rem;
        }

        .error-message {
          color: #718096;
          margin-bottom: 2rem;
        }

        .retry-btn, .back-link {
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          cursor: pointer;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .retry-btn:hover, .back-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
        }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 768px) {
          .blog-detail-container {
            padding: 1.5rem 1rem;
          }

          .blog-title {
            font-size: 2rem;
          }

          .engagement-section {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .related-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {isLoading && <BlogDetailSkeleton />}
      {error && <BlogDetailError error={error} />}
      {!blog && !isLoading && <BlogNotFound />}
      
      {blog && !isLoading && (
        <div className="blog-detail-container">
          {/* Header & Meta */}
          <div className="blog-header">
            <div className="category-section">
              <span className="category-badge">
                {blog.category === 'tech' ? '💻' :
                 blog.category === 'review' ? '⭐' :
                 blog.category === 'guide' ? '📖' : '📰'}
                {blog.category === 'tech' ? ' ເທັກໂນໂລຢີ' :
                 blog.category === 'review' ? ' ລີວິວ' :
                 blog.category === 'guide' ? ' ຄູ່ມື' : ' ຂ່າວສານ'}
              </span>
              <span className="publish-date">
                <i className="far fa-calendar"></i>
                {formatDate(blog.createdAt)}
              </span>
            </div>
            
            <h1 className="blog-title">{blog.title}</h1>
            
            <div className="author-section">
              <img 
                src={blog.author?.avatar?.url || '/images/default_avatar.jpg'} 
                alt={blog.author?.name || 'Admin'} 
                className="author-avatar"
              />
              <div className="author-info">
                <h4 className="author-name">{blog.author?.name || 'Admin'}</h4>
                <p className="author-email">{blog.author?.email || 'ຜູ້ຂຽນ'}</p>
              </div>
            </div>
          </div>

          {/* Main Image */}
          <div className="blog-image-container">
            {blog.image?.url || blog.image ? (
              <img 
                src={blog.image?.url || blog.image} 
                alt={blog.title} 
                className="blog-image"
              />
            ) : (
              <div className="blog-image-placeholder">
                {blog.category === 'tech' ? '💻' :
                 blog.category === 'review' ? '⭐' :
                 blog.category === 'guide' ? '📖' : '📰'}
              </div>
            )}
          </div>

          {/* Content Body */}
          <div className="blog-content">
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="tags-container">
              {blog.tags.map(tag => (
                <span key={tag} className="tag-item">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Like & Views */}
          <div className="engagement-section">
            <button 
              onClick={handleLike}
              className={`like-btn ${isLiked ? 'liked' : ''}`}
            >
              <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
              <span>{blog.likes?.length || 0} ຖືກໃຈ</span>
            </button>

            <div className="stats-info">
              <span className="stat-item">
                <i className="far fa-eye"></i>
                {blog.views?.toLocaleString() || 0} ຄັ້ງ
              </span>
              <span className="stat-item">
                <i className="far fa-comment"></i>
                {blog.comments?.length || 0} ຄວາມຄິດເຫັນ
              </span>
              <span className="stat-item">
                <i className="far fa-clock"></i>
                {blog.readTime || '5 ນາທີ'}
              </span>
            </div>
          </div>

          {/* Comments Section */}
          <div className="comments-section">
            <h3 className="comments-title">
              <i className="far fa-comments"></i>
              ຄວາມຄິດເຫັນ ({blog.comments?.length || 0})
            </h3>
            
            {user ? (
              <form onSubmit={handleComment} className="comment-form">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="ແບ່ງປັນຄວາມຄິດເຫັນຂອງທ່ານ..."
                  className="comment-textarea"
                  rows="4"
                />
                <button type="submit" className="submit-comment-btn">
                  <i className="far fa-paper-plane"></i>
                  ສົ່ງຄວາມຄິດເຫັນ
                </button>
              </form>
            ) : (
              <div className="login-prompt">
                <p>
                  ກະລຸນາ<Link to="/login" className="login-link">ເຂົ້າສູ່ລະບົບ</Link> 
                  ເພື່ອແບ່ງປັນຄວາມຄິດເຫັນ
                </p>
              </div>
            )}

            <div className="comments-list">
              {blog.comments?.map(comment => (
                <div key={comment._id} className="comment-item">
                  <img 
                    src={comment.user?.avatar?.url || '/images/default_avatar.jpg'} 
                    alt={comment.user?.name} 
                    className="comment-avatar"
                  />
                  <div className="comment-content">
                    <h5 className="comment-author">{comment.user?.name}</h5>
                    <p className="comment-text">{comment.text}</p>
                    <span className="comment-time">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <RelatedBlogs currentBlogId={id} />
        </div>
      )}
    </>
  );
};

// Sub-Components
const RelatedBlogs = ({ currentBlogId }) => {
  const { data: relatedData } = useGetRelatedBlogsQuery(currentBlogId);
  const relatedBlogs = relatedData?.blogs || relatedData;

  if (!relatedBlogs || relatedBlogs.length === 0) return null;

  return (
    <div className="related-section">
      <h3 className="related-title">
        <i className="far fa-bookmark"></i>
        ບົດຄວາມທີ່ກ່ຽວຂ້ອງ
      </h3>
      <div className="related-grid">
        {relatedBlogs.slice(0, 3).map(blog => (
          <Link key={blog._id} to={`/blog/${blog.slug || blog._id}`} className="related-card">
            <h4 className="related-card-title">{blog.title}</h4>
            <p className="related-card-excerpt">{blog.excerpt}</p>
            <span className="related-read-more">
              ອ່ານຕໍ່ <i className="fas fa-arrow-right"></i>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

const BlogDetailSkeleton = () => (
  <div className="skeleton-container">
    <div className="skeleton-header">
      <div className="skeleton-title"></div>
      <div className="skeleton-author"></div>
    </div>
    <div className="skeleton-image"></div>
    <div className="skeleton-content"></div>
    <div className="skeleton-footer"></div>
  </div>
);

const BlogDetailError = ({ error }) => (
  <div className="error-container">
    <div className="error-icon">🔌</div>
    <h3 className="error-title">ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດບົດຄວາມ</h3>
    <p className="error-message">{error?.data?.message || 'ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີບເວີໄດ້'}</p>
    <Link to="/blogs" className="back-link">
      <i className="fas fa-arrow-left"></i>
      ກັບໄປຫນ້າບລັອກ
    </Link>
  </div>
);

const BlogNotFound = () => (
  <div className="error-container">
    <div className="error-icon">🔍</div>
    <h3 className="error-title">ບໍ່ພົບບົດຄວາມ</h3>
    <p className="error-message">ບົດຄວາມທີ່ທ່ານຊອກຫາບໍ່ມີຢູ່ໃນລະບົບ</p>
    <Link to="/blogs" className="back-link">
      <i className="fas fa-arrow-left"></i>
      ກັບໄປຫນ້າບລັອກ
    </Link>
  </div>
);

export default BlogDetail;