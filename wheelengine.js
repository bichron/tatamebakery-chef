/* =====================================
   WHEEL ENGINE v2
   Apple-style cylinder wheel
===================================== */

class WheelEngine{

constructor(cfg){

this.mask=document.querySelector(cfg.mask);
this.container=this.mask?.querySelector(".wheel-container");
this.wheel=this.mask?.querySelector(".wheel");
this.items=this.mask?.querySelectorAll(".wheel-item");

if(!this.mask || !this.items.length) return;

this.index=cfg.startIndex||0;
this.radius=cfg.radius||80;
this.onChange=cfg.onChange||null;

this.total=this.items.length;
this.angleStep=360/this.total;

this.velocity=0;
this.startX=0;

this.init();

}

init(){

this.layout();
this.update();
this.bind();

}

layout(){

this.items.forEach((el,i)=>{

const angle=i*this.angleStep;

el.style.transform=`
translate(-50%,-50%)
rotateY(${angle}deg)
translateZ(${this.radius}px)
`;

});

}

update(){

this.items.forEach((el,i)=>{

const angle=(i-this.index)*this.angleStep;

el.style.transform=`
translate(-50%,-50%)
rotateY(${angle}deg)
translateZ(${this.radius}px)
`;

const rad=angle*Math.PI/180;
const isBack=Math.cos(rad)<0;

const text=el.querySelector("span");

if(text) text.style.opacity=isBack?".45":"1";

el.classList.toggle("active",i===this.index);

});

if(this.onChange) this.onChange(this.index);

}

bind(){

let startX=0;
let startTime=0;

this.mask.addEventListener("touchstart",e=>{

startX=e.touches[0].clientX;
startTime=Date.now();

},{passive:true});

this.mask.addEventListener("touchend",e=>{

const dx=e.changedTouches[0].clientX-startX;
const dt=Date.now()-startTime;

if(Math.abs(dx)<25) return;

const speed=dx/dt;

this.velocity=speed*8;

this.spin();

});

this.items.forEach((el,i)=>{

el.addEventListener("click",()=>{

this.index=i;
this.update();

});

});

}

spin(){

if(Math.abs(this.velocity)<0.01) return;

if(this.velocity>0){

this.index=(this.index-1+this.total)%this.total;

}else{

this.index=(this.index+1)%this.total;

}

this.update();

this.velocity*=0.75;

requestAnimationFrame(()=>this.spin());

}

go(i){

this.index=i;
this.update();

}

}