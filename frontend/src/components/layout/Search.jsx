import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Search.css';

const Search = () => {
    const [keyword, setKeyword] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved));
            } catch (e) {
                setRecentSearches([]);
            }
        }
    }, []);

    const saveToRecent = (term) => {
        if (!term.trim()) return;
        
        const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const clearRecent = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    const submitHandler = (e) => {
        e.preventDefault();

        if (keyword.trim()) {
            saveToRecent(keyword.trim());
            navigate(`/?keyword=${encodeURIComponent(keyword)}`);
            setIsFocused(false);
            inputRef.current?.blur();
        } else {
            navigate(`/`);
        }
    };

    const handleRecentClick = (term) => {
        setKeyword(term);
        navigate(`/?keyword=${encodeURIComponent(term)}`);
        setIsFocused(false);
    };

    const clearSearch = () => {
        setKeyword("");
        inputRef.current?.focus();
    };

    return (
        <>
            

            <div className="modern-search-container">
                <form className="search-form" onSubmit={submitHandler}>
                    <div className={`search-input-wrapper ${isFocused ? 'focused' : ''}`}>
                        <i className="fas fa-search search-icon-prefix"></i>
                        
                        <input
                            ref={inputRef}
                            type="text"
                            className="search-input"
                            placeholder="ຄົ້ນຫາສິນຄ້າ..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                            aria-label="Search for products"
                        />

                        {keyword && (
                            <button
                                type="button"
                                className="search-clear-btn"
                                onClick={clearSearch}
                                aria-label="Clear search"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        )}

                        <button 
                            type="submit"
                            className="search-submit-btn"
                            aria-label="Search"
                        >
                            <i className="fas fa-search"></i>
                            <span>ຄົ້ນຫາ</span>
                        </button>
                    </div>

                    {/* Dropdown for recent searches and suggestions */}
                    {isFocused && !keyword && (
                        <div className="search-dropdown">
                            {recentSearches.length > 0 ? (
                                <>
                                    <div className="recent-header">
                                        <div className="recent-title">
                                            <i className="fas fa-clock"></i>
                                            ການຄົ້ນຫາລ່າສຸດ
                                        </div>
                                        <button
                                            type="button"
                                            className="clear-all-btn"
                                            onClick={clearRecent}
                                        >
                                            ລຶບທັງໝົດ
                                        </button>
                                    </div>
                                    {recentSearches.map((term, index) => (
                                        <div
                                            key={index}
                                            className="recent-item"
                                            onClick={() => handleRecentClick(term)}
                                        >
                                            <i className="fas fa-history recent-icon"></i>
                                            <span className="recent-text">{term}</span>
                                            <i className="fas fa-arrow-right recent-arrow"></i>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">
                                        <i className="fas fa-search"></i>
                                    </div>
                                    <div className="empty-text">
                                        ຍັງບໍ່ມີປະຫວັດການຄົ້ນຫາ
                                    </div>
                                </div>
                            )}

                            {/* Quick Suggestions */}
                            <div className="quick-suggestions">
                                <div className="suggestion-title">
                                    <i className="fas fa-lightbulb"></i>
                                    ແນະນຳ
                                </div>
                                <div className="suggestion-tags">
                                    <span className="suggestion-tag" onClick={() => handleRecentClick('laptop')}>
                                        💻 Laptop
                                    </span>
                                    <span className="suggestion-tag" onClick={() => handleRecentClick('phone')}>
                                        📱 Phone
                                    </span>
                                    <span className="suggestion-tag" onClick={() => handleRecentClick('headphone')}>
                                        🎧 Headphone
                                    </span>
                                    <span className="suggestion-tag" onClick={() => handleRecentClick('keyboard')}>
                                        ⌨️ Keyboard
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </>
    );
};

export default Search;