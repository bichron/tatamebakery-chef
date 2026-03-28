/* =====================================
   GALLERY ENGINE (UNIFIED - JSON DRIVEN)
===================================== */

export const GalleryEngine = {

  load({
    slider,
    path,
    ext = "jpg",
    max = 10,
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
       BUILD SLIDER (FROM PATH)
    ============================ */
    function build(){

      if(!path || !max){
        track.innerHTML = "<div class='slider-empty'>No data</div>";
        return;
      }

      for(let i = 1; i <= max; i++){

        const el = document.createElement("img");
        const src = `${path}${i}.${ext}`;

        el.dataset.src = src;
        el.classList.add("lazy-img");

        // load ảnh đầu tiên ngay
        if(i === 1){
          el.src = src;
          el.dataset.loaded = "1";
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

        // tránh bind lại nhiều lần
        if(!slider.dataset.init){

  if(typeof window.SliderEngine === "function"){
    window.SliderEngine(slider);
  }else{
    console.warn("SliderEngine not found");
  }

  slider.dataset.init = "1";
}

        update?.(slider);

        // 👉 preload ảnh gần (lazy load thông minh)
        const imgs = track.querySelectorAll("img");

        const preload = (index)=>{
          const targets = [
            imgs[index],
            imgs[index+1],
            imgs[index-1],
            imgs[index+2],
            imgs[index-2]
          ];

          targets.forEach(img=>{
            if(img && img.dataset?.src && !img.src){
              img.src = img.dataset.src;
              img.dataset.loaded = "1";
            }
          });
        };

        preload(0);

      });

    }

    // run
    build();
    initSlider();

  }

};
