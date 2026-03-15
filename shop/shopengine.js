
/* ===========================
   SHOP ENGINE
=========================== */

import { AppState } from "../core/state.js";
import { validateProduct } from "./productvalidator.js";
import { logError } from "../core/logger.js";

export const ShopEngine = {

  async loadProducts(){

    if(AppState.products.length) return;

    try{

      const res = await fetch("data/product.json");

      const data = await res.json();

      const products = data.products || [];
      const groups = data.groups || [];

      AppState.products = products.filter(validateProduct);
      AppState.shopGroups = groups;
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

  },
  getGroups(){

    return AppState.shopGroups || [];

  }

};
