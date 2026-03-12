
/* ===========================
   DOM CACHE
=========================== */

export const DOM = {};

export function cacheDOM(selectors){

  Object.keys(selectors).forEach(key=>{
    DOM[key] = document.querySelector(selectors[key]);
  });

}
