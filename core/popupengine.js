
/* ===========================
   POPUP ENGINE
=========================== */

import { AppState } from "./state.js";

export const Popup = {

  open(id){

    document.querySelectorAll(".popup").forEach(p=>{
      p.classList.remove("show");
    });

    const el = document.getElementById(id);

    if(!el) return;

    el.classList.add("show");

    AppState.activePopup = id;

  },

  close(id){

    const el = document.getElementById(id);

    if(!el) return;

    el.classList.remove("show");

    if(AppState.activePopup === id){

      AppState.activePopup = null;

    }

  },

  closeAll(){

    document.querySelectorAll(".popup").forEach(p=>{
      p.classList.remove("show");
    });

    AppState.activePopup = null;

  }

};
