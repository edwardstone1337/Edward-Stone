/**
 * Navigation Component
 * Reusable navigation bar with mobile menu support and automatic active page detection
 */

(function() {
  'use strict';

  // Navigation configuration
  const navConfig = {
    logo: 'Edward Stone',
    logoHref: 'index.html',
    links: [
      { text: 'Home', href: 'index.html' },
      { 
        text: 'Case Studies', 
        href: '#',
        submenu: [
          { text: 'Increasing conversion rates', href: 'case-studies/increasing-conversion-rates.html' },
          { text: 'How I design features users come back for', href: 'case-studies/features-users-return.html' },
          { text: 'How I reduced support enquiries', href: 'case-studies/reduced-support-enquiries.html' }
        ]
      }
    ]
  };

  // Use shared Utils.escapeHTML (requires utils.js to be loaded first)
  const escapeHTML = Utils.escapeHTML;

  /**
   * Get the current page path from the URL
   * @returns {string} Current page path relative to root
   */
  function getCurrentPage() {
    const path = window.location.pathname;
    
    // Remove leading slash and get relative path
    let relativePath = path.replace(/^\//, '');
    
    // Handle root path
    if (relativePath === '' || relativePath === '/') {
      return 'index.html';
    }
    
    // If path doesn't end with .html, assume it's a directory and add index.html
    // Otherwise return the path as-is (handles nested paths like case-studies/page.html)
    if (!relativePath.endsWith('.html') && !relativePath.includes('.')) {
      return relativePath + '/index.html';
    }
    
    return relativePath;
  }

  /**
   * Check if a link has submenu items
   * @param {Object} link - Link configuration object
   * @returns {boolean}
   */
  function hasSubmenu(link) {
    return link.submenu && Array.isArray(link.submenu) && link.submenu.length > 0;
  }

  /**
   * Check if a link href matches the current page
   * @param {string} href - Link href attribute
   * @param {string} currentPage - Current page filename
   * @returns {boolean}
   */
  function isActiveLink(href, currentPage) {
    // Handle hash links (like # for home)
    if (href === '#' || href === '') {
      return currentPage === 'index.html' || currentPage === '';
    }
    
    // Normalize paths - remove leading slash if present
    const normalizedHref = href.replace(/^\//, '');
    const normalizedCurrent = currentPage.replace(/^\//, '');
    
    return normalizedHref === normalizedCurrent;
  }

  /**
   * Check if any submenu item is active
   * @param {Array} submenu - Array of submenu items
   * @param {string} currentPage - Current page filename
   * @returns {boolean}
   */
  function isSubmenuActive(submenu, currentPage) {
    if (!submenu || !Array.isArray(submenu)) return false;
    return submenu.some(item => isActiveLink(item.href, currentPage));
  }

  /**
   * Generate submenu HTML
   * @param {Array} submenu - Array of submenu items
   * @param {string} parentId - Unique ID for the parent item
   * @param {string} currentPage - Current page filename
   * @returns {string} Submenu HTML string
   */
  function generateSubmenuHTML(submenu, parentId, currentPage) {
    if (!submenu || !Array.isArray(submenu) || submenu.length === 0) {
      return '';
    }

    const submenuItems = submenu.map(item => {
      const isActive = isActiveLink(item.href, currentPage);
      const activeClass = isActive ? 'active' : '';
      return `
        <li>
          <a href="${escapeHTML(item.href)}" class="${activeClass}">${escapeHTML(item.text)}</a>
        </li>
      `;
    }).join('');

    return `
      <ul class="nav-submenu" id="${parentId}-submenu" role="menu">
        ${submenuItems}
      </ul>
    `;
  }

  /**
   * Generate navigation HTML
   * @returns {string} Navigation HTML string
   */
  function generateNavigationHTML() {
    const currentPage = getCurrentPage();
    
    // Generate logo
    const logoHTML = `
      <div class="logo">
        <a href="${escapeHTML(navConfig.logoHref)}">${escapeHTML(navConfig.logo)}</a>
      </div>
    `;
    
    // Generate navigation links
    const linksHTML = navConfig.links.map((link, index) => {
      const hasSubmenuItems = hasSubmenu(link);
      const isActive = isActiveLink(link.href, currentPage);
      const isSubmenuItemActive = hasSubmenuItems ? isSubmenuActive(link.submenu, currentPage) : false;
      const activeClass = (isActive || isSubmenuItemActive) ? 'active' : '';
      const parentId = `nav-item-${index}`;
      
      if (hasSubmenuItems) {
        const submenuHTML = generateSubmenuHTML(link.submenu, parentId, currentPage);
        const escapedText = escapeHTML(link.text);
        const escapedHref = escapeHTML(link.href);
        return `
          <li class="nav-item-has-submenu">
            <a href="${escapedHref}" 
               class="${activeClass}" 
               id="${parentId}"
               aria-haspopup="true" 
               aria-expanded="false"
               aria-label="${escapedText}, submenu">
              ${escapedText}
              <span class="nav-arrow" aria-hidden="true">⌄</span>
            </a>
            ${submenuHTML}
          </li>
        `;
      } else {
        const escapedText = escapeHTML(link.text);
        const escapedHref = escapeHTML(link.href);
        return `
          <li>
            <a href="${escapedHref}" class="${activeClass}">${escapedText}</a>
          </li>
        `;
      }
    }).join('');
    
    // Generate hamburger button for mobile
    const hamburgerHTML = `
      <button class="nav-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    `;
    
    // Complete navigation structure
    return `
      <header>
        ${logoHTML}
        ${hamburgerHTML}
        <div class="nav-overlay"></div>
        <nav>
          <ul>
            ${linksHTML}
          </ul>
        </nav>
      </header>
    `;
  }

  /**
   * Initialize mobile submenu functionality
   */
  function initMobileSubmenu() {
    const submenuParents = document.querySelectorAll('.nav-item-has-submenu > a');
    
    submenuParents.forEach(parent => {
      parent.addEventListener('click', function(e) {
        // Only prevent default if we're on mobile/tablet
        if (window.innerWidth <= 768) {
          e.preventDefault();
          e.stopPropagation();
          
          const parentLi = parent.closest('.nav-item-has-submenu');
          const submenu = parentLi.querySelector('.nav-submenu');
          const isExpanded = parent.getAttribute('aria-expanded') === 'true';
          
          // Close all other submenus
          submenuParents.forEach(otherParent => {
            if (otherParent !== parent) {
              otherParent.setAttribute('aria-expanded', 'false');
              const otherLi = otherParent.closest('.nav-item-has-submenu');
              const otherSubmenu = otherLi.querySelector('.nav-submenu');
              if (otherSubmenu) {
                otherSubmenu.classList.remove('nav-submenu-open');
              }
            }
          });
          
          // Toggle current submenu
          if (isExpanded) {
            parent.setAttribute('aria-expanded', 'false');
            if (submenu) {
              submenu.classList.remove('nav-submenu-open');
            }
          } else {
            parent.setAttribute('aria-expanded', 'true');
            if (submenu) {
              submenu.classList.add('nav-submenu-open');
            }
          }
        }
      });
    });
  }

  /**
   * Initialize desktop dropdown functionality
   */
  function initDropdownMenu() {
    const submenuParents = document.querySelectorAll('.nav-item-has-submenu > a');
    
    submenuParents.forEach(parent => {
      const parentLi = parent.closest('.nav-item-has-submenu');
      const submenu = parentLi.querySelector('.nav-submenu');
      
      if (!submenu) return;
      
      // Desktop: hover to open
      let hoverTimeout;
      
      parentLi.addEventListener('mouseenter', function() {
        if (window.innerWidth > 768) {
          clearTimeout(hoverTimeout);
          parent.setAttribute('aria-expanded', 'true');
          submenu.classList.add('nav-dropdown-open');
        }
      });
      
      parentLi.addEventListener('mouseleave', function() {
        if (window.innerWidth > 768) {
          hoverTimeout = setTimeout(() => {
            parent.setAttribute('aria-expanded', 'false');
            submenu.classList.remove('nav-dropdown-open');
          }, 150);
        }
      });
      
      // Desktop: click to toggle (alternative interaction)
      parent.addEventListener('click', function(e) {
        if (window.innerWidth > 768) {
          e.preventDefault();
          e.stopPropagation();
          
          const isExpanded = parent.getAttribute('aria-expanded') === 'true';
          
          // Close all other dropdowns
          submenuParents.forEach(otherParent => {
            if (otherParent !== parent) {
              otherParent.setAttribute('aria-expanded', 'false');
              const otherLi = otherParent.closest('.nav-item-has-submenu');
              const otherSubmenu = otherLi.querySelector('.nav-submenu');
              if (otherSubmenu) {
                otherSubmenu.classList.remove('nav-dropdown-open');
              }
            }
          });
          
          // Toggle current dropdown
          if (isExpanded) {
            parent.setAttribute('aria-expanded', 'false');
            submenu.classList.remove('nav-dropdown-open');
          } else {
            parent.setAttribute('aria-expanded', 'true');
            submenu.classList.add('nav-dropdown-open');
          }
        }
      });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
      if (window.innerWidth > 768) {
        const clickedInside = e.target.closest('.nav-item-has-submenu');
        if (!clickedInside) {
          submenuParents.forEach(parent => {
            parent.setAttribute('aria-expanded', 'false');
            const parentLi = parent.closest('.nav-item-has-submenu');
            const submenu = parentLi.querySelector('.nav-submenu');
            if (submenu) {
              submenu.classList.remove('nav-dropdown-open');
            }
          });
        }
      }
    });
  }

  /**
   * Initialize keyboard navigation for submenus
   */
  function handleKeyboardNavigation() {
    const submenuParents = document.querySelectorAll('.nav-item-has-submenu > a');
    
    submenuParents.forEach(parent => {
      parent.addEventListener('keydown', function(e) {
        const parentLi = parent.closest('.nav-item-has-submenu');
        const submenu = parentLi.querySelector('.nav-submenu');
        if (!submenu) return;
        
        const submenuLinks = Array.from(submenu.querySelectorAll('a'));
        const isExpanded = parent.getAttribute('aria-expanded') === 'true';
        
        switch(e.key) {
          case 'Enter':
          case ' ':
            e.preventDefault();
            if (isExpanded) {
              parent.setAttribute('aria-expanded', 'false');
              submenu.classList.remove('nav-dropdown-open');
              submenu.classList.remove('nav-submenu-open');
            } else {
              parent.setAttribute('aria-expanded', 'true');
              if (window.innerWidth > 768) {
                submenu.classList.add('nav-dropdown-open');
              } else {
                submenu.classList.add('nav-submenu-open');
              }
              // Focus first submenu item
              if (submenuLinks.length > 0) {
                submenuLinks[0].focus();
              }
            }
            break;
            
          case 'ArrowDown':
            e.preventDefault();
            if (!isExpanded) {
              parent.setAttribute('aria-expanded', 'true');
              if (window.innerWidth > 768) {
                submenu.classList.add('nav-dropdown-open');
              } else {
                submenu.classList.add('nav-submenu-open');
              }
            }
            if (submenuLinks.length > 0) {
              submenuLinks[0].focus();
            }
            break;
            
          case 'Escape':
            if (isExpanded) {
              e.preventDefault();
              parent.setAttribute('aria-expanded', 'false');
              submenu.classList.remove('nav-dropdown-open');
              submenu.classList.remove('nav-submenu-open');
              parent.focus();
            }
            break;
        }
      });
      
      // Handle keyboard navigation within submenu
      const parentLi = parent.closest('.nav-item-has-submenu');
      const submenu = parentLi.querySelector('.nav-submenu');
      if (submenu) {
        const submenuLinks = Array.from(submenu.querySelectorAll('a'));
        
        submenuLinks.forEach((link, index) => {
          link.addEventListener('keydown', function(e) {
            switch(e.key) {
              case 'ArrowDown':
                e.preventDefault();
                const nextIndex = (index + 1) % submenuLinks.length;
                submenuLinks[nextIndex].focus();
                break;
                
              case 'ArrowUp':
                e.preventDefault();
                const prevIndex = (index - 1 + submenuLinks.length) % submenuLinks.length;
                if (prevIndex === submenuLinks.length - 1) {
                  parent.focus();
                } else {
                  submenuLinks[prevIndex].focus();
                }
                break;
                
              case 'Escape':
                e.preventDefault();
                parent.setAttribute('aria-expanded', 'false');
                submenu.classList.remove('nav-dropdown-open');
                submenu.classList.remove('nav-submenu-open');
                parent.focus();
                break;
            }
          });
        });
      }
    });
  }

  /**
   * Initialize mobile menu functionality
   */
  function initMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('nav');
    const overlay = document.querySelector('.nav-overlay');
    const body = document.body;
    
    if (!toggle || !nav) return;
    
    function closeMenu() {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('nav-open');
      if (overlay) overlay.classList.remove('active');
      body.classList.remove('nav-menu-open');
      
      // Close all submenus when main menu closes
      const submenuParents = document.querySelectorAll('.nav-item-has-submenu > a');
      submenuParents.forEach(parent => {
        parent.setAttribute('aria-expanded', 'false');
        const parentLi = parent.closest('.nav-item-has-submenu');
        const submenu = parentLi.querySelector('.nav-submenu');
        if (submenu) {
          submenu.classList.remove('nav-submenu-open');
        }
      });
    }
    
    function openMenu() {
      toggle.setAttribute('aria-expanded', 'true');
      nav.classList.add('nav-open');
      if (overlay) overlay.classList.add('active');
      body.classList.add('nav-menu-open');
    }
    
    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      
      if (isExpanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });
    
    // Close menu when clicking on overlay
    if (overlay) {
      overlay.addEventListener('click', closeMenu);
    }
    
    // Close menu when clicking on a link (but not submenu parent links on mobile)
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        // Don't close if it's a submenu parent on mobile
        if (window.innerWidth <= 768 && link.closest('.nav-item-has-submenu')) {
          return;
        }
        closeMenu();
      });
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
        closeMenu();
      }
    });
  }

  /**
   * Initialize the navigation component
   * @param {string} containerId - ID of the container element (default: 'nav-container')
   */
  function initNavigation(containerId = 'nav-container') {
    const container = document.getElementById(containerId);
    
    if (!container) {
      console.warn(`Navigation container with ID "${containerId}" not found.`);
      return;
    }
    
    // Generate and inject navigation HTML
    container.innerHTML = generateNavigationHTML();
    
    // Initialize all navigation functionality after DOM is ready
    function initAllNavigation() {
      initMobileMenu();
      initMobileSubmenu();
      initDropdownMenu();
      handleKeyboardNavigation();
    }
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAllNavigation);
    } else {
      initAllNavigation();
    }
  }

  // Auto-initialize if container exists, or export for manual initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      if (document.getElementById('nav-container')) {
        initNavigation();
      }
    });
  } else {
    if (document.getElementById('nav-container')) {
      initNavigation();
    }
  }

  // Export for manual initialization if needed
  window.Navigation = {
    init: initNavigation
  };

})();
