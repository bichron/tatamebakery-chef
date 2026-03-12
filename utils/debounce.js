
/* ===========================
   DEBOUNCE UTILITY
=========================== */

export function debounce(fn,delay=50){

  let t;

  return function(...args){

    clearTimeout(t);

    t = setTimeout(()=>{

      fn.apply(this,args);

    },delay);

  }

}
