/* =====================================
   GALLERY ENGINE (UNIFIED - JSON DRIVEN)
===================================== */

export const GalleryEngine = {

  load({
    slider,
    products,
    update,
    SliderEngine
  }){

    const track = slider.querySelector(".slider-track");
    const indicatorBox = slider.querySelector(".slider-indicators");

    if(!track || !indicatorBox) return;

    // reset UI
    track.innerHTML = "";
    indicatorBox.innerHTML = "";

    /* ===========================
       BUILD SLIDER
    ============================ */
    function build(){

  // no data
  if(!path || !max){
    track.innerHTML = "<div class='slider-empty'>No data</div>";
    return;
  }

  for(let i = 1; i <= max; i++){

    const el = document.createElement("img");

    const src = `${path}${i}.${ext || "jpg"}`;

    el.dataset.src = src;
    el.classList.add("lazy-img");

    // load ảnh đầu tiên
    if(i === 1){
      el.src = src;
    }

    track.appendChild(el);

    // indicator
    const dot = document.createElement("span");
    if(i === 1) dot.classList.add("active");
    indicatorBox.appendChild(dot);
  }

  // reset position
  track.dataset.x = 0;
}

      /* ===========================
         INIT SLIDER
      ============================ */
      function initSlider(){
        requestAnimationFrame(()=>{
          new SliderEngine(slider);
          update(slider);
        });
      }

      initSlider();
    }

    build();
  }

};
