/* =====================================
   WHEEL ENGINE v4
   Core + Controllers
===================================== */

/* =====================================
   CORE WHEEL ENGINE
===================================== */

export class WheelEngine {

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

this.layout();
this.update();
this.bind();

}

/* LAYOUT */

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

/* UPDATE ROTATION */

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
text.style.opacity = isBack ? ".35" : "1";
}

});

if(this.onChange) this.onChange(this.index);

}

/* TOUCH CONTROL */

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

/* NAVIGATION */

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


/* =====================================
   WHEEL CONTROLLERS
===================================== */

export function initQRWheel(state){

state.qrWheel = new WheelEngine({

mask:"#qrPopup .wheel-mask",
radius:80,

onChange:(index)=>{

document
.querySelectorAll("#qrPopup .qr-panel")
.forEach((p,i)=>{

p.classList.toggle("active", i===index);

});

}

});

}


export function initAchievementWheel(state){

state.achievementWheel = new WheelEngine({

mask:"#achievementPopup .wheel-mask",
radius:80,

onChange:(index)=>{

document
.querySelectorAll("#achievementPopup .achievement-panel")
.forEach((p,i)=>{

p.classList.toggle("active", i===index);

});

}

});

}


export function initShopWheel(state){

requestAnimationFrame(()=>{

state.shopWheel = new WheelEngine({

mask:"#shopPopup .wheel-mask",
radius:80,

onChange:(index)=>{

document
.querySelectorAll("#shopPanels .shop-panel")
.forEach((p,i)=>{

p.classList.toggle("active", i===index);

});

}

});

document
.querySelectorAll("#shopPanels .shop-panel")
.forEach((p,i)=>{

p.classList.toggle("active", i===0);

});

});

}
