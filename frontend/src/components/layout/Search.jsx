import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Search = () => {
    const [keyword, setKeyword] = useState("");
    const navigate = useNavigate();

    const submitHandler = (e) => {
        e.preventDefault();

        // Navigate with keyword as a query parameter
        if (keyword.trim()) {
            // Use window.location.pathname to maintain current URL path if any, 
            // but for the search bar, navigating to the root is usually correct.
            navigate(`/?keyword=${encodeURIComponent(keyword)}`);
        } else {
            navigate(`/`);
        }
    }

    return (
        <div className="mb-3">
            <form onSubmit={submitHandler}>
                <div className="input-group">
                    <input
                        type="text"
                        id="search_field"
                        aria-describedby="search_btn"
                        className="form-control"
                        placeholder="Enter Product Name ..."
                        name="keyword"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        aria-label="Search for products"
                    />
                    {/* *** FIX APPLIED HERE: ***
                      Changed className from "btn btn-outline-secondary" to 
                      "btn btn-primary" to ensure visibility. 
                      If the icon still doesn't show, the primary cause is missing Font Awesome CSS.
                    */}
                    <button 
                        id="search_btn" 
                        className="btn btn-primary" 
                        type="submit"
                        aria-label="Search"
                        
                    >
                        {/* The fa fa-search icon requires Font Awesome CSS to be globally imported. */}
                        <i className="fa fa-search" aria-hidden="true" ></i>
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Search;