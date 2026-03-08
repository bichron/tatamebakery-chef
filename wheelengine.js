/* =====================================
   WHEEL ENGINE v1.0
   reusable 3D cylinder wheel
===================================== */

class WheelEngine{

  constructor(config){

    this.container = document.querySelector(config.container);
    this.items = this.container?.querySelectorAll(config.item) || [];

    this.onChange = config.onChange || null;

    this.index = config.startIndex || 0;

    this.total = this.items.length;
    this.angleStep = this.total ? 360 / this.total : 0;

    this.radius = config.radius || 80;

    this.swipe = config.swipe ?? true;

    if(!this.container || !this.items.length) return;

    this.init();
  }

  init(){

    this.update();

    if(this.swipe) this.bindSwipe();

    this.items.forEach((el,i)=>{
      el.addEventListener("click",()=>{
        this.index = i;
        this.update();
      });
    });

  }

  update(){

    this.items.forEach((el,i)=>{

      const angle = (i - this.index) * this.angleStep;

      el.style.transform = `
        translate(-50%,-50%)
        rotateY(${angle}deg)
        translateZ(${this.radius}px)
      `;

      const rad = angle * Math.PI / 180;
      const isBack = Math.cos(rad) < 0;

      const text = el.querySelector("span");

      if(text){
        text.style.opacity = isBack ? ".45" : "1";
      }

      el.classList.toggle("active", i === this.index);

    });

    if(this.onChange){
      this.onChange(this.index);
    }

  }

  bindSwipe(){

    let startX = 0;

    this.container.addEventListener("touchstart",e=>{
      startX = e.touches[0].clientX;
    },{passive:true});

    this.container.addEventListener("touchend",e=>{

      const diff = e.changedTouches[0].clientX - startX;

      if(Math.abs(diff) < 30) return;

      this.index =
        diff < 0
          ? (this.index + 1) % this.total
          : (this.index - 1 + this.total) % this.total;

      this.update();

    });

  }

  go(i){
    this.index = i;
    this.update();
  }

}