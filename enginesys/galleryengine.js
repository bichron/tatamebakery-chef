/* =====================================
   GALLERY ENGINE (UNIFIED - LAZY LOAD)
===================================== */

export const GalleryEngine = {

  load({
    slider,
    state,
    update,
    SliderEngine,
    path,
    ext = "png",
    max = 10
  }){

    const track = slider.querySelector(".slider-track");
    const indicatorBox = slider.querySelector(".slider-indicators");

    if(!track || !indicatorBox) return;

    // reset
    track.innerHTML = "";
    indicatorBox.innerHTML = "";

    const group = slider.dataset.group;

    let items = [];
    let index = 1;

    /* ===========================
       LOAD IMAGE (RECURSIVE)
    ============================ */
    function tryLoad(){

      if(index > max){
        build();
        return;
      }

      const img = new Image();
      img.src = `${path}${group}/${index}.${ext}`;

      img.onload = ()=>{
        items.push(img.src);
        index++;
        tryLoad();
      };

      img.onerror = build;
    }

    /* ===========================
       BUILD SLIDER (LAZY)
    ============================ */
    function build(){

      const count = Math.min(max, items.length);

      if(count === 0){
        track.innerHTML = "<div class='slider-empty'>No data</div>";
        return;
      }

      // render images + dots
      for(let i=0;i<count;i++){

        const el = document.createElement("img");

        // 👉 lazy load
        el.dataset.src = items[i];
        el.classList.add("lazy-img");

        // ✅ load ảnh đầu tiên ngay (fix layout + swipe)
        if(i === 0){
          el.src = items[i];
        }

        track.appendChild(el);

        const dot = document.createElement("span");
        if(i === 0) dot.classList.add("active");

        indicatorBox.appendChild(dot);
      }

      // init state
      state.set(slider, 0);
      track.dataset.x = 0;

      /* ===========================
         SAFE INIT (NO WAIT IMAGE)
      ============================ */
      function initSlider(){
        requestAnimationFrame(()=>{
          new SliderEngine(slider);
          update(slider);
        });
      }

      // 👉 luôn init ngay (không đợi image)
      initSlider();
    }

    tryLoad();
  }

};
