/**
 * Navigation Component
 * Reusable navigation bar with mobile menu support and automatic active page detection
 */

(function() {
  'use strict';

  if (typeof window.Utils === 'undefined' || typeof window.Utils.escapeHTML !== 'function') {
    throw new Error('Navigation requires utils.js (Utils.escapeHTML). Load utils.js before this script.');
  }

  const escapeHTML = Utils.escapeHTML;
  const sanitizeUrl = Utils.sanitizeUrl;

  let _dropdownInitialized = false;

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
          { text: 'How I design features people come back for', href: 'case-studies/features-users-return.html' }
        ]
      }
    ]
  };

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
   * Resolve nav link href for current page location (so links work from subfolders e.g. case-studies/)
   * @param {string} href - Link href from config
   * @param {string} currentPage - Current page path from getCurrentPage()
   * @returns {string} Resolved href for use in anchor
   */
  function getResolvedHref(href, currentPage) {
    const inSubfolder = currentPage.includes('/');
    if (!inSubfolder) return href;
    if (href === 'index.html' || href === '') return '../index.html';
    if (href.startsWith('case-studies/')) return href.replace('case-studies/', '');
    return '../' + href;
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
      const resolvedHref = getResolvedHref(item.href, currentPage);
      return `
        <li>
          <a href="${escapeHTML(sanitizeUrl(resolvedHref))}" class="${activeClass}">${escapeHTML(item.text)}</a>
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
   * Generate desktop navigation links HTML (with dropdown submenus)
   * @param {string} currentPage - Current page filename
   * @returns {string} Desktop navigation HTML string
   */
  function generateDesktopLinksHTML(currentPage) {
    return navConfig.links.map((link, index) => {
      const hasSubmenuItems = hasSubmenu(link);
      const isActive = isActiveLink(link.href, currentPage);
      const isSubmenuItemActive = hasSubmenuItems ? isSubmenuActive(link.submenu, currentPage) : false;
      const activeClass = (isActive || isSubmenuItemActive) ? 'active' : '';
      const parentId = `nav-item-${index}`;
      
      if (hasSubmenuItems) {
        const submenuHTML = generateSubmenuHTML(link.submenu, parentId, currentPage);
        const escapedText = escapeHTML(link.text);
        const escapedHref = escapeHTML(sanitizeUrl(getResolvedHref(link.href, currentPage)));
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
        const escapedHref = escapeHTML(sanitizeUrl(getResolvedHref(link.href, currentPage)));
        return `
          <li>
            <a href="${escapedHref}" class="${activeClass}">${escapedText}</a>
          </li>
        `;
      }
    }).join('');
  }

  /**
   * Generate mobile navigation links HTML (flattened - no accordion needed)
   * Exposes all links including case studies immediately to reduce interaction cost
   * @param {string} currentPage - Current page filename
   * @returns {string} Mobile navigation HTML string
   */
  function generateMobileLinksHTML(currentPage) {
    const links = [];
    
    navConfig.links.forEach(link => {
      const hasSubmenuItems = hasSubmenu(link);
      
      if (hasSubmenuItems) {
        // Add section label for grouped items (e.g., "Case Studies")
        links.push(`
          <li class="nav-mobile-section-label" aria-hidden="true">
            <span>${escapeHTML(link.text)}</span>
          </li>
        `);
        
        // Flatten submenu items directly into the nav
        link.submenu.forEach(subItem => {
          const isActive = isActiveLink(subItem.href, currentPage);
          const activeClass = isActive ? 'active' : '';
          const resolvedHref = getResolvedHref(subItem.href, currentPage);
          links.push(`
            <li class="nav-mobile-submenu-item">
              <a href="${escapeHTML(sanitizeUrl(resolvedHref))}" class="${activeClass}">${escapeHTML(subItem.text)}</a>
            </li>
          `);
        });
      } else {
        const isActive = isActiveLink(link.href, currentPage);
        const activeClass = isActive ? 'active' : '';
        const resolvedHref = getResolvedHref(link.href, currentPage);
        links.push(`
          <li>
            <a href="${escapeHTML(sanitizeUrl(resolvedHref))}" class="${activeClass}">${escapeHTML(link.text)}</a>
          </li>
        `);
      }
    });
    
    return links.join('');
  }

  /**
   * Generate navigation HTML
   * @returns {string} Navigation HTML string
   */
  function generateNavigationHTML() {
    const currentPage = getCurrentPage();
    const logoHref = getResolvedHref(navConfig.logoHref, currentPage);
    
    // Generate logo
    const logoHTML = `
      <div class="logo">
        <a href="${escapeHTML(sanitizeUrl(logoHref))}">${escapeHTML(navConfig.logo)}</a>
      </div>
    `;
    
    // Generate desktop navigation links (with dropdown submenus)
    const desktopLinksHTML = generateDesktopLinksHTML(currentPage);
    
    // Generate mobile navigation links (flattened for better UX)
    const mobileLinksHTML = generateMobileLinksHTML(currentPage);
    
    // Generate "Menu" button for mobile using secondary button styling for consistency
    // Text-based button is more discoverable than hamburger icon for non-tech-savvy users
    const menuButtonHTML = `
      <button class="nav-toggle btn btn-secondary" aria-label="Toggle navigation menu" aria-expanded="false" data-text-open="Menu" data-text-close="Close">Menu</button>
    `;
    
    // Navigation structure following standard practice:
    // - header contains only logo and menu button (elements in normal document flow)
    // - nav-overlay and nav are siblings to header (fixed/absolute positioned elements outside header)
    // This ensures header height is determined by its content, preventing clipping issues
    return `
      <header>
        ${logoHTML}
        ${menuButtonHTML}
      </header>
      <div class="nav-overlay"></div>
      <nav>
        <ul class="nav-desktop">
          ${desktopLinksHTML}
        </ul>
        <ul class="nav-mobile">
          ${mobileLinksHTML}
        </ul>
      </nav>
    `;
  }

  /**
   * Initialize mobile submenu functionality
   * Note: Mobile nav is now flattened (no accordion), so this only handles
   * edge cases where desktop nav elements might receive mobile-width clicks
   * (e.g., during resize). The main mobile nav uses .nav-mobile which has
   * no nested submenus.
   */
  function initMobileSubmenu() {
    // Mobile navigation is now flattened - no accordion behavior needed
    // Desktop submenu elements (.nav-item-has-submenu) are hidden on mobile
    // This function is kept for backwards compatibility but is effectively a no-op
  }

  /**
   * Initialize desktop dropdown functionality
   */
  function initDropdownMenu() {
    if (_dropdownInitialized) return;

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
    _dropdownInitialized = true;
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
   * Uses secondary button styling with "Menu"/"Close" text for consistency
   */
  function initMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('nav');
    const overlay = document.querySelector('.nav-overlay');
    const body = document.body;
    
    if (!toggle || !nav) return;
    
    /**
     * Update the toggle button text based on menu state
     * @param {boolean} isOpen - Whether the menu is open
     */
    function updateToggleText(isOpen) {
      toggle.textContent = isOpen ? toggle.dataset.textClose : toggle.dataset.textOpen;
    }
    
    function closeMenu() {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('nav-open');
      if (overlay) overlay.classList.remove('active');
      body.classList.remove('nav-menu-open');
      updateToggleText(false);
      
      // Close all submenus when main menu closes (for desktop dropdown cleanup)
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
      updateToggleText(true);
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
    
    // Close menu when clicking on any nav link (mobile nav is now flat, no accordion)
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        // Close menu on any link click on mobile
        if (window.innerWidth <= 768) {
          closeMenu();
        }
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
