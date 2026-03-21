/* =====================================
   GALLERY ENGINE (UNIFIED)
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

      // 🔒 tránh loop vô hạn
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
       BUILD SLIDER
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
        el.src = items[i];
        track.appendChild(el);

        const dot = document.createElement("span");
        if(i === 0) dot.classList.add("active");

        indicatorBox.appendChild(dot);
      }

      // init state
      state.set(slider, 0);
      track.dataset.x = 0;

      /* ===========================
         SAFE INIT (FIX STEP BUG)
      ============================ */

      const firstImg = track.querySelector("img");

      function initSlider(){
        // 🔒 tránh bind nhiều lần
        if(slider.dataset.bound) return;
        slider.dataset.bound = "1";

        // đảm bảo layout đã render
        requestAnimationFrame(()=>{
          new SliderEngine(slider);
          update(slider);
        });
      }

      if(firstImg){

        // ✅ FIX: ảnh cache
        if(firstImg.complete){
          initSlider();
        }else{
          firstImg.onload = initSlider;
        }

      }else{
        initSlider();
      }
    }

    tryLoad();
  }

};
