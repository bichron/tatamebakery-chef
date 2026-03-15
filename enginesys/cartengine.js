
/* ===========================
   CART ENGINE
=========================== */

import { AppState } from "../core/state.js";

export const CartEngine = {

  add(id){

    if(!AppState.cart[id]){

      AppState.cart[id] = 1;

    }else{

      AppState.cart[id]++;

    }

  },

  remove(id){

    if(!AppState.cart[id]) return;

    AppState.cart[id]--;

    if(AppState.cart[id] <= 0){

      delete AppState.cart[id];

    }

  },

  clear(){

    AppState.cart = {};

  },

  getItems(){

    return AppState.cart;

  }

};
