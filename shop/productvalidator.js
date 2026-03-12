
/* ===========================
   PRODUCT VALIDATOR
=========================== */

export function validateProduct(p){

  if(!p) return false;

  if(!p.name) return false;

  if(!p.price) return false;

  if(!p.image) return false;

  return true;

}
