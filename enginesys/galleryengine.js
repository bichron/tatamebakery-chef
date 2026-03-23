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
      if(!products || products.length === 0){
        track.innerHTML = "<div class='slider-empty'>No data</div>";
        return;
      }

      products.forEach((product, i)=>{

        const el = document.createElement("img");

        // ✅ FULL JSON PATH (chuẩn hoá toàn hệ thống)
        const src = product.img;

        el.dataset.src = src;
        el.classList.add("lazy-img");

        // load ảnh đầu tiên ngay
        if(i === 0){
          el.src = src;
        }

        track.appendChild(el);

        // indicator
        const dot = document.createElement("span");
        if(i === 0) dot.classList.add("active");
        indicatorBox.appendChild(dot);
      });

      // reset position
      track.dataset.x = 0;

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
