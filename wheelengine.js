/* =====================================
   WHEEL ENGINE v3
   Stable cylinder wheel
===================================== */

class WheelEngine {

constructor(cfg){

this.mask = document.querySelector(cfg.mask);
this.container = this.mask?.querySelector(".wheel-container");
this.wheel = this.mask?.querySelector(".wheel");
this.items = [...this.mask?.querySelectorAll(".wheel-item")];

if(!this.mask || !this.items.length) return;

this.index = cfg.startIndex || 0;
this.radius = cfg.radius || 80;
this.onChange = cfg.onChange || null;

this.total = this.items.length;
this.angleStep = 360 / this.total;

this.startX = 0;

this.layout();
this.update();
this.bind();

}

/* ===========================
   LAYOUT (RUN ONCE)
=========================== */

layout(){

this.items.forEach((el,i)=>{

const angle = i * this.angleStep;

el.style.transform = `
translate(-50%,-50%)
rotateY(${angle}deg)
translateZ(${this.radius}px)
`;

});

}

/* ===========================
   UPDATE WHEEL ROTATION
=========================== */

update(){

const rot = -this.index * this.angleStep;

this.wheel.style.transform = `rotateY(${rot}deg)`;

this.items.forEach((el,i)=>{

el.classList.toggle("active",i===this.index);

const angle = (i-this.index) * this.angleStep;
const rad = angle * Math.PI / 180;

const isBack = Math.cos(rad) < 0;

const text = el.querySelector("span");
if(text){

  if(i === this.index){
    text.style.opacity = "1";
  }else{
    text.style.opacity = isBack ? ".25" : ".6";
  }

}

});

if(this.onChange) this.onChange(this.index);

}

/* ===========================
   TOUCH CONTROL
=========================== */

bind(){

let startX = 0;

this.mask.addEventListener("touchstart",e=>{

startX = e.touches[0].clientX;

},{passive:true});

this.mask.addEventListener("touchend",e=>{

const dx = e.changedTouches[0].clientX - startX;

if(Math.abs(dx) < 25) return;

if(dx > 0){
this.prev();
}else{
this.next();
}

});

this.items.forEach((el,i)=>{

el.addEventListener("click",()=>{
this.go(i);
});

});

}

/* ===========================
   NAVIGATION
=========================== */

next(){

this.index = (this.index + 1) % this.total;
this.update();

}

prev(){

this.index = (this.index - 1 + this.total) % this.total;
this.update();

}

go(i){

this.index = i;
this.update();

}

}
