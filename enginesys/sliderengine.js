/* =====================================
   SLIDER ENGINE v2
===================================== */

export function SliderEngine(slider, qrState, updateSLD){

  const track =
    slider.querySelector(".qr-track") ||
    slider.querySelector(".achievement-track") ||
    slider.querySelector(".shop-track");

  let dots;

  if(slider.querySelector(".qr-indicators")){
    dots = slider.querySelectorAll(".qr-indicators span");
  }
  else if(slider.querySelector(".achievement-indicators")){
    dots = slider.querySelectorAll(".achievement-indicators span");
  }
  else{
    dots = slider.querySelectorAll(".shop-indicators span");
  }

  const STEP = (track.children[0]?.getBoundingClientRect().width || 150) + 14;

  let startX = 0;
  let baseX = 0;
  let dragging = false;

  function update(index){

    const x = -index * STEP;

    track.dataset.x = x;

    track.style.transition = "transform .35s ease";
    track.style.transform = `translateX(${x}px)`;

    qrState.set(slider,index);

    dots.forEach(d=>d.classList.remove("active"));

    if(dots[index]) dots[index].classList.add("active");

  }

  function start(x){

    dragging = true;

    startX = x;

    baseX = parseFloat(track.dataset.x || 0);

    track.style.transition = "none";

  }

  function move(x){

    if(!dragging) return;

    const dx = x - startX;

    track.style.transform =
      `translateX(${baseX + dx}px)`;

  }

  function end(x){

    if(!dragging) return;

    dragging = false;

    const dx = x - startX;

    const currentX = baseX + dx;

    const total = track.children.length;

    let index = Math.round(-currentX / STEP);

    index = Math.max(0,Math.min(index,total-1));

    update(index);

  }

  slider.addEventListener("touchstart",e=>{
    start(e.touches[0].clientX);
  },{passive:true});

  slider.addEventListener("touchmove",e=>{
    move(e.touches[0].clientX);
  },{passive:true});

  slider.addEventListener("touchend",e=>{
    end(e.changedTouches[0].clientX);
  });

  slider.addEventListener("mousedown",e=>{
    start(e.clientX);
  });

  window.addEventListener("mousemove",e=>{
    move(e.clientX);
  });

  window.addEventListener("mouseup",e=>{
    end(e.clientX);
  });

}
