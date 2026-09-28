/* ===================================================================
   NovelHub — App bootstrap. Included on every page after data.js,
   auth.js, theme.js, ui.js (and the page-specific module, if any).
   =================================================================== */

document.addEventListener('DOMContentLoaded', ()=>{
  UI.renderHeader();
  UI.renderFooter();

  // Global +18 gate helper is used by pages that render novel cards
  // that could route to age-restricted content — implemented per-page.

  // Fire a page-specific init hook if the page defined one.
  if(typeof window.pageInit === 'function'){
    window.pageInit();
  }
});
