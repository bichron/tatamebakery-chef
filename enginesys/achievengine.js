/* =====================================
   ACHIEVEMENT GALLERY ENGINE
===================================== */

export const AchievEngine = {

loadAchievementSlider(slider, qrState, updateQR, SliderEngine){

  delete slider.dataset.swipeBound;

  const track = slider.querySelector(".achievement-track");
  const indicatorBox = slider.querySelector(".achievement-indicators");

  const group = slider.dataset.group;
  const maxAllowed = parseInt(slider.dataset.max);

  track.innerHTML="";
  indicatorBox.innerHTML="";

  let images=[];
  let index=1;

  function tryLoad(){

    const img=new Image();

    img.src=`assets/achievement/${group}/${index}.jpg`;

    img.onload=()=>{
      images.push(img.src);
      index++;
      tryLoad();
    };

    img.onerror=build;

  }

  function build(){

    const count=Math.min(maxAllowed,images.length);

    for(let i=0;i<count;i++){

      const el=document.createElement("img");
      el.src=images[i];

      track.appendChild(el);

      const dot=document.createElement("span");

      if(i===0) dot.classList.add("active");

      indicatorBox.appendChild(dot);

    }

    qrState.set(slider,0);

    track.dataset.x = 0;

    new SliderEngine(slider, qrState, updateQR);

    updateQR(slider);

  }

  tryLoad();

}

}
