/* =====================================
   GALLERY ENGINE (UNIFIED - LAZY LOAD)
===================================== */

export const GalleryEngine = {

  load({
    slider,
    products,
    update,
    SliderEngine,
    path = "assets/shop"
  }){

    const track = slider.querySelector(".slider-track");
    const indicatorBox = slider.querySelector(".slider-indicators");

    if(!track || !indicatorBox) return;

    track.innerHTML = "";
    indicatorBox.innerHTML = "";

    /* ===========================
       BUILD SLIDER (LAZY)
    ============================ */
    function build(){

      if(!products || products.length === 0){
        track.innerHTML = "<div class='slider-empty'>No data</div>";
        return;
      }

      products.forEach((product, i)=>{

        const el = document.createElement("img");

        // ✅ xử lý path an toàn
        let src = product.img;

        if(!src.startsWith("http") && !src.startsWith("assets")){
          src = `${path}/${product.img}`;
        }

        el.dataset.src = src;
        el.classList.add("lazy-img");

        // load ảnh đầu tiên ngay
        if(i === 0){
          el.src = src;
        }

        track.appendChild(el);

        const dot = document.createElement("span");
        if(i === 0) dot.classList.add("active");
        indicatorBox.appendChild(dot);
      });

      const imgs = track.querySelectorAll("img");

      /* ===========================
         PRELOAD SMART (NEXT + NEXT2)
      ============================ */

      function preload(index){
        if(imgs[index] && imgs[index].dataset?.src && !imgs[index].src){
          imgs[index].src = imgs[index].dataset.src;
        }
      }

      // preload 1 và 2
      preload(1);
      preload(2);

      /* ===========================
         STATE + INIT
      ============================ */

      track.dataset.x = 0;

      function initSlider(){
        requestAnimationFrame(()=>{
          new SliderEngine(slider);
          update(slider);
        });
      }

      initSlider();

      /* ===========================
         HOOK PRELOAD KHI SLIDE
      ============================ */

      slider.addEventListener("slideChange", (e)=>{
        const i = e.detail?.index ?? 0;

        preload(i + 1);
        preload(i + 2);
      });

    }

    // ❗ QUAN TRỌNG: phải gọi
    build();
  }

};
