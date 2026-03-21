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

    track.innerHTML = "";
    indicatorBox.innerHTML = "";

    const group = slider.dataset.group;

    let items = [];
    let index = 1;

    function tryLoad(){

      const img = new Image();
      img.src = `${path}${group}/${index}.${ext}`;

      img.onload = ()=>{
        items.push(img.src);
        index++;
        tryLoad();
      };

      img.onerror = build;

    }

    function build(){

      const count = Math.min(max, items.length);

      if(count === 0){
        track.innerHTML = "<div class='slider-empty'>No data</div>";
        return;
      }

      for(let i=0;i<count;i++){

        const el = document.createElement("img");
        el.src = items[i];
        track.appendChild(el);

        const dot = document.createElement("span");
        if(i===0) dot.classList.add("active");

        indicatorBox.appendChild(dot);
      }

      state.set(slider,0);
      track.dataset.x = 0;

      new SliderEngine(slider);
      update(slider);
    }

    tryLoad();
  }

};
