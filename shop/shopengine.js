
/* ===========================
   SHOP ENGINE
=========================== */

import { AppState } from "./state.js";
import { validateProduct } from "./productvalidator.js";
import { logError } from "./logger.js";

export const ShopEngine = {

  async loadProducts(){

    if(AppState.products.length) return;

    try{

      const res = await fetch("data/product.json");

      const data = await res.json();

      const list = data.products || [];

      AppState.products = list.filter(validateProduct);

      console.log("Products loaded:",AppState.products);

    }catch(err){

      logError("ShopEngine.loadProducts",err);

    }

  },

  setGroup(group){

    AppState.shopGroup = group;

  },

  getProducts(){

    if(!AppState.shopGroup) return AppState.products;

    return AppState.products.filter(p=>p.group === AppState.shopGroup);

  }

};
