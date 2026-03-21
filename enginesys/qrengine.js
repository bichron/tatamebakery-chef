/* =====================================
   QR ENGINE
===================================== */

export const QREngine = {

loadQRSlider(slider, qrState, updateSLD, SliderEngine){

  delete slider.dataset.swipeBound;

  const track = slider.querySelector(".qr-track");
  const indicatorBox = slider.querySelector(".qr-indicators");

  const group = slider.dataset.group;
  const maxAllowed = parseInt(slider.dataset.max);

  track.innerHTML = "";
  indicatorBox.innerHTML = "";

  let images = [];
  let index = 1;

  function tryLoad(){

    const img = new Image();
    img.src = `assets/qr/${group}/${index}.png`;

    img.onload = ()=>{

      images.push(img.src);
      index++;
      tryLoad();

    };

    img.onerror = build;

  }

  function build(){

    const count = Math.min(maxAllowed, images.length);

    if(count===0){

      track.innerHTML = "<div class='qr-empty'>No QR</div>";
      return;

    }

    for(let i=0;i<count;i++){

      const el = document.createElement("img");
      el.src = images[i];
      track.appendChild(el);

      const dot = document.createElement("span");

      if(i===0) dot.classList.add("active");

      indicatorBox.appendChild(dot);

    }

    qrState.set(slider,0);

    track.dataset.x = 0;

    new SliderEngine(slider);

    updateSLD(slider);

  }

  tryLoad();

},

/* XOÁ TOÀN BỘ - LỖI TRÙNG 2 SWIPE   
   
enableQRSwipe(slider, qrState, updateSLD){

  if(slider.dataset.swipeBound) return;

  slider.dataset.swipeBound="1";

  const track =
    slider.querySelector(".qr-track") ||
    slider.querySelector(".achievement-track") ||
    slider.querySelector(".shop-track");

  let startX=0;
  let dragging=false;

  const STEP = 164;

  slider.addEventListener("touchstart",e=>{

    dragging=true;
    startX=e.touches[0].clientX;

    track.style.transition="none";

  },{passive:true});

  slider.addEventListener("touchmove",e=>{

    if(!dragging) return;

    const baseX=parseFloat(track.dataset.x||0);
    const dx=e.touches[0].clientX-startX;

    track.style.transform=
      `translateX(${baseX+dx}px)`;

  },{passive:true});

slider.addEventListener("touchend",e=>{

  if(!dragging) return;

  dragging=false;

  const baseX=parseFloat(track.dataset.x||0);
  const dx=e.changedTouches[0].clientX-startX;

  const currentX=baseX+dx;

  const total=track.children.length;

  let index=Math.round(-currentX/STEP);

  index=Math.max(0,Math.min(index,total-1));

  const snappedX=-index*STEP;

  track.dataset.x=snappedX;

  qrState.set(slider,index);

  updateSLD(slider);

});

}  block chờ xoá */

   

}   //END CODE MARK HERE
