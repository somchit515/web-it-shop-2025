import React from 'react'
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

function SideMenu({menuItems}) {

   


    const location = useLocation();

    const [activeMenuItem, setActiveMenuItem] = useState(location.pathname);

    const handleMenuItemsClick = (menuItemsUrl) => {
        setActiveMenuItem(menuItemsUrl);
    }

  return (
    <div className="list-group mt-5 pl-4">
        {menuItems?.map((menuItems, index) =>(

            <Link
              key={index}
              to={menuItems.url}
              className={`fw-bold list-group-item list-group-item-action ${activeMenuItem.includes(menuItems.url) ? "active" : ""}`}

              onClick={() => handleMenuItemsClick(menuItems.url)}
              aria-current = {activeMenuItem.includes(menuItems.url) ? "true" : "false"}
            >
              <i className={`${menuItems.icon} fa-fw pe-2`}></i> {menuItems.name}
            </Link>

        ))}
      
      
    </div>

  )
}

export default SideMenu
