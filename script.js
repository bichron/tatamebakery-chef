import { WheelEngine } from "./enginesys/wheelengine.js";
import { QREngine } from "./enginesys/qrengine.js";
import { generateQRCode } from "./enginesys/qrgenerate.js";
import { AchievEngine } from "./enginesys/achievengine.js";
let shopData = []
let shopGroups = []
window.addEventListener("DOMContentLoaded", async()=>{
  await loadProductData();
  buildShopUI();
  
/* ===========================
   ELEMENTS
=========================== */

const phone = document.getElementById("phone");
const qrPopup = document.getElementById("qrPopup");

const zoom = document.getElementById("qrZoom");
const zoomImg = document.getElementById("qrZoomImg");

const VIEWER_UNLOCK_CODE = "093777";

const sliderState = new Map();

let qrWheel;
let achievementWheel;
let shopWheel;

let activePopup=null;

let sessionTimer=null;
let wrongAttempts=0;


/* ===========================
   SCALE CARD
=========================== */
const wrapper = document.querySelector(".wrapper");
function scaleCard(){

  const scale = Math.min(innerWidth/360, innerHeight/700);

  wrapper.style.transform = `scale(${scale})`;

}

scaleCard();
phone.classList.add("loaded");

window.addEventListener(
  "resize",
  ()=>requestAnimationFrame(scaleCard)
);


/* ===========================
   THEME
=========================== */

function toggleTheme(){

  document.body.classList.toggle("light");

  localStorage.setItem(
    "theme",
    document.body.classList.contains("light")
      ? "light"
      : "dark"
  );

}

window.toggleTheme = toggleTheme;

if(localStorage.getItem("theme")==="light"){
  document.body.classList.add("light");
}


/* ===========================
   DEVICE ORIENTATION
=========================== */

if(window.DeviceOrientationEvent){

  window.addEventListener("deviceorientation",e=>{

    const x = e.gamma / 40;
    const y = e.beta / 40;

    phone.style.rotate = `${-y}deg ${x}deg`;

  });

}


/* ===========================
   NFC ANIMATION
=========================== */

const params = new URLSearchParams(location.search);

if(params.has("nfc")){

  phone.animate(
    [{transform:"scale(.95)"},{transform:"scale(1)"}],
    {duration:800,easing:"ease-out"}
  );

}


/* ===========================
   QR WHEEL
=========================== */

function initQRWheel(){

  qrWheel = new WheelEngine({

    mask:"#qrPopup .wheel-mask",

    radius:110,

    onChange:(index)=>{

      document
      .querySelectorAll("#qrPopup .qr-panel")
      .forEach((p,i)=>{

        p.classList.toggle("active", i===index);

      });

    }

  });

}


/* ===========================
   ACHIEVEMENT WHEEL
=========================== */

function initAchievementWheel(){

  achievementWheel = new WheelEngine({

    mask:"#achievementPopup .wheel-mask",

    radius:120,

    onChange:(index)=>{

      document
      .querySelectorAll("#achievementPopup .achievement-panel")
      .forEach((p,i)=>{

        p.classList.toggle("active", i===index);

      });

    }

  });

}

/* ===========================
   SLIDER ENGINE V2
=========================== */

function SliderEngine(slider){

  const track =
    slider.querySelector(".qr-track") ||
    slider.querySelector(".achievement-track") ||
    slider.querySelector(".shop-track");
  
  if(!track) return; // ⭐ FIX QUAN TRỌNG
  
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

    sliderState.set(slider,index);

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


  /* TOUCH */

  slider.addEventListener("touchstart",e=>{
    start(e.touches[0].clientX);
  },{passive:true});

  slider.addEventListener("touchmove",e=>{
    move(e.touches[0].clientX);
  },{passive:true});

  slider.addEventListener("touchend",e=>{
    end(e.changedTouches[0].clientX);
  });


  /* MOUSE */

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

/* ===========================
   QR SLIDER   - phải xoá
===========================

function loadQRSlider(slider){

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

    sliderState.set(slider,0);

    track.dataset.x = 0;

    new SliderEngine(slider);
    updateSLD(slider);

  }

  tryLoad();

}


function enableQRSwipe(slider){

  if(slider.dataset.swipeBound) return;

  slider.dataset.swipeBound="1";

  const track =
    slider.querySelector(".qr-track") ||
    slider.querySelector(".achievement-track") ||
    slider.querySelector(".shop-track");

  let startX=0;
  let dragging=false;

  const STEP = 164; //dùng chung cho QR và achievement

  slider.addEventListener("touchstart",e=>{

    dragging=true;

    startX=e.touches[0].clientX;

    track.style.transition="none";

  },{passive:true});

  slider.addEventListener("touchmove",e=>{

    if(!dragging) return;
    
    e.preventDefault();

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

  sliderState.set(slider,index);

  updateSLD(slider);

});
}
phải xoá  */

  
//// function updateQR(slider) nên gọi thành tên chung updateSLD
function updateSLD(slider){

  const index=sliderState.get(slider)??0;

  const track =
    slider.querySelector(".qr-track") ||
    slider.querySelector(".achievement-track") ||
    slider.querySelector(".shop-track");

  if(!track) return;
  
  const dots = slider.querySelectorAll(
  ".qr-indicators span, .achievement-indicators span, .shop-indicators span"
  );

  const STEP =
    (track.children[0]?.getBoundingClientRect().width || 150) + 14;

  const x = -index * STEP;

  track.dataset.x=x;

  track.style.transition="transform .35s ease";
  track.style.transform=`translateX(${x}px)`;

  dots.forEach(d=>d.classList.remove("active"));

  if(dots[index]) dots[index].classList.add("active");

}
   
/* ===========================
   LOAD GALLERY --- phải xoá
===========================
function loadAchievementSlider(slider){
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

    sliderState.set(slider,0);

    track.dataset.x = 0;

    new SliderEngine(slider);
    updateSLD(slider);

  }

  tryLoad();

}
 PHẢI XOÁ  */
/* ===========================
   GLOBAL IMAGE ZOOM
=========================== */

document.addEventListener("click",e=>{
  const img = e.target.closest(
    ".qr-track img, .achievement-track img"
  );

  if(!img) return;

  e.stopPropagation();   // ⭐ QUAN TRỌNG

  zoomImg.src=img.src;

  zoom.classList.add("active");

});

zoom?.addEventListener("click",()=>{

  zoom.classList.remove("active");

});

/* ===========================
   LOAD PRODUCT JSON
=========================== */
async function loadProductData(){

  try{

    const res = await fetch("data/product.json?v=" + Date.now())
    const data = await res.json()

   shopData = data.products || []
   shopGroups = data.groups || []
   
   console.log("Products loaded:", shopData)

  }catch(err){

    console.error("Product load error:", err)

  }

}

  
/* ===========================
   PRODUCT POPUP
=========================== */
// BUILD SHOP UI
function buildShopUI(){

const wheelBox = document.getElementById("shopWheelItems")
const panelBox = document.getElementById("shopPanels")

wheelBox.innerHTML=""
panelBox.innerHTML=""

shopGroups.forEach((g,i)=>{

/* WHEEL ITEM */

const item=document.createElement("div")
item.className="wheel-item"

item.innerHTML =
`<span class="wheel-icon">${g.icon || ""}</span>
<span class="wheel-label">${g.name}</span>`

wheelBox.appendChild(item)

/* PANEL */

const panel=document.createElement("div")
panel.className="shop-panel"

if(i===0){
panel.classList.add("active")
}

panel.innerHTML =
`<div class="shop-slider" data-group="${g.id}">
<div class="shop-track"></div>
<div class="shop-indicators"></div>
</div>`

panelBox.appendChild(panel)

})

}
  
// LOAD PRODUCT.JSON
function openProduct(product){

currentProduct = product.id;

document.getElementById("productName").textContent = product.name;

document.getElementById("productPrice").textContent =
product.price.toLocaleString("vi-VN")+"đ";

document.getElementById("productImage").src = product.image;

const specBox = document.getElementById("productSpec")

if(product.spec){

  let html=""

  Object.entries(product.spec).forEach(([k,v])=>{
    html += `<div>${k}: ${v}</div>`
  })

  specBox.innerHTML = html

}else{

  specBox.innerHTML=""

}
  
updateQtyDisplay();

openPopup("productPopup");

}
   
document.addEventListener("click",e=>{

  const card = e.target.closest(".product-card");

  if(!card) return;

  const id = card.dataset.id;

  const product = shopData.find(p => p.id === id);

  if(!product) return;

  openProduct(product);

});

 // WHEEL INFTER
function getProductsByGroup(group){

  return shopData.filter(p => p.group === group)

}



  
/* ===========================
   SHOP WHEEL
=========================== */

function initShopWheel(){

  requestAnimationFrame(()=>{

    shopWheel = new WheelEngine({

      mask:"#shopPopup .wheel-mask",
      radius:130,

      onChange:(index)=>{

        document
        .querySelectorAll("#shopPanels .shop-panel")
        .forEach((p,i)=>{
          p.classList.toggle("active", i===index)
        })

      }

    })

    /* reset panel */
    document
    .querySelectorAll("#shopPanels .shop-panel")
    .forEach((p,i)=>{
      p.classList.toggle("active", i===0)
    })

  })

}

/* ===========================
   SHOP SLIDER
=========================== */

function loadShopSlider(slider){

  delete slider.dataset.swipeBound

  const track = slider.querySelector(".shop-track")
  const indicatorBox = slider.querySelector(".shop-indicators")

  const group = slider.dataset.group

  track.innerHTML=""
  indicatorBox.innerHTML=""

  const products = getProductsByGroup(group)

  if(products.length===0){
    track.innerHTML="<div class='shop-empty'>No product</div>"
    return
  }

  products.forEach((p,i)=>{

    const card=document.createElement("div")
    card.className="product-card"
    card.dataset.id=p.id

    card.innerHTML=`
      <img src="${p.image}">
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-price">
          ${p.price.toLocaleString("vi-VN")}đ
        </div>
      </div>
    `

    track.appendChild(card)

  })

  /* BUILD INDICATORS */

  for(let i=0;i<products.length;i++){

    const dot=document.createElement("span")

    if(i===0) dot.classList.add("active")

    indicatorBox.appendChild(dot)

  }

  sliderState.set(slider,0)

  track.dataset.x=0

  /* ANT */
  requestAnimationFrame(()=>{
    new SliderEngine(slider)
    updateSLD(slider)
  })

}

/* ===========================
   CART STATE
=========================== */

let cart = {};
let currentProduct = "";

/* FIX CARET POSITION (INPUT QTY) */

const qtyInput = document.getElementById("qtyValue");

if(qtyInput){
qtyInput.addEventListener("focus", moveCaretToEnd);
qtyInput.addEventListener("click", moveCaretToEnd);
}

function moveCaretToEnd(){

setTimeout(()=>{

const val = qtyInput.value;

qtyInput.setSelectionRange(
val.length,
val.length
);

},0);

}
   
function updateQtyDisplay(){

const qty = cart[currentProduct] || 0;

document.getElementById("qtyValue").value = qty;

}   

// ADD TO CART   
document.getElementById("qtyPlus").onclick = () => {

if(!currentProduct) return;

if(!cart[currentProduct]){
cart[currentProduct] = 0;
}

cart[currentProduct]++;

updateQtyDisplay();
renderCart();

};


document.getElementById("qtyMinus").onclick = () => {

if(!currentProduct) return;

if(!cart[currentProduct]) return;

cart[currentProduct]--;

if(cart[currentProduct] <= 0){
delete cart[currentProduct];
}

updateQtyDisplay();
renderCart();

};   
   
document
.getElementById("qtyValue")
?.addEventListener("input",()=>{

if(!currentProduct) return;

let val = parseInt(
document.getElementById("qtyValue").value
);

if(isNaN(val) || val <= 0){

delete cart[currentProduct];
renderCart();
updateQtyDisplay();
return;

}

cart[currentProduct] = val;
updateQtyDisplay();

renderCart();

});
   
// RENDER CART   
function renderCart(){

const boxes = [
document.getElementById("cartItems"),
document.getElementById("cartPreview")
];

boxes.forEach(box=>{

if(!box) return;

box.innerHTML="";

if(Object.keys(cart).length===0){

box.innerHTML="<div class='cart-empty'>Cart empty</div>";
return;

}

Object.keys(cart).forEach(id=>{

const qty = cart[id];

const product = shopData.find(p=>p.id===id);

const name = product ? product.name : id;

const row=document.createElement("div");

row.className="cart-item";

row.innerHTML=`
<span class="cart-name">${name}</span>
<span class="cart-qty">×${qty}</span>
<button class="cart-minus" data-id="${id}">–</button>
`;

box.appendChild(row);

});

});

}

// LOGIC COPY   
document
.getElementById("copyCartOrder")
?.addEventListener("click",()=>{

let text="/order TatameLanding; ";

const today = new Date();

const date =
String(today.getDate()).padStart(2,"0") + "-" +
String(today.getMonth()+1).padStart(2,"0") + "-" +
today.getFullYear();

text += date + "; ";

if(Object.keys(cart).length===0){

alert("Your cart is empty.");
return;

}

Object.keys(cart).forEach(id=>{

const product = shopData.find(p=>p.id===id);
const name = product ? product.name : id;

const qty = String(cart[id]).padStart(2,"0");

text += `${qty} ${name}; `;

});

navigator.clipboard.writeText(text);

alert("Order copied. Paste into chat.");

});
   
// REMOVE ITEM   
document.addEventListener("click",e=>{

if(!e.target.matches(".cart-minus")) return;

const id = e.target.dataset.id;

cart[id]--;

if(cart[id] <= 0){
delete cart[id];
}

renderCart();
updateQtyDisplay();

});

   
/* ===========================
   POPUP MANAGER
=========================== */

function closeAllPopups(){

  document.querySelectorAll(".popup")
  .forEach(p=>p.classList.remove("active"));

  document.querySelector(".overlay")
  ?.classList.remove("active");
  document.body.classList.remove("noscroll");

  activePopup=null;

}

function openPopup(id){

  if(activePopup===id) return;

  closeAllPopups();

  const popup=document.getElementById(id);

  if(!popup) return;

  popup.classList.add("active");

  document.querySelector(".overlay")
  ?.classList.add("active");
  document.body.classList.add("noscroll");

  activePopup=id;

}


/* ===========================
   BUTTON EVENTS
=========================== */

document
.getElementById("btn-shop")
?.addEventListener("click",()=>{

  if(!shopWheel) initShopWheel();

  shopWheel.go(0);

  // FIX: force panel reset
  document
  .querySelectorAll("#shopPanels .shop-panel")
  .forEach((p,i)=>{
    p.classList.toggle("active", i===0);
  });

  document
  .querySelectorAll("#shopPanels .shop-slider")
  .forEach(slider=>{

    // FIX: tránh load nhiều lần
    if(!slider.dataset.loaded){
      loadShopSlider(slider);
      slider.dataset.loaded=1;
    }

  });

  openPopup("shopPopup");

});
   

document
.getElementById("btn-qrcode")
?.addEventListener("click",()=>{

  if(!qrWheel) initQRWheel();

  qrWheel.go(0);

  document
  .querySelectorAll("#qrPopup .qr-slider")
  .forEach(slider=>{
    QREngine.loadQRSlider(
      slider,
      sliderState,
      updateSLD,
      SliderEngine
    );
  });

  openPopup("qrPopup");

  window.loadDynamicQR?.();

});


document
.getElementById("btn-achievement")
?.addEventListener("click",()=>{

  if(!achievementWheel) initAchievementWheel();

  achievementWheel.go(0);

  document
  .querySelectorAll("#achievementPopup .achievement-slider")
  .forEach(slider=>{
     AchievEngine.loadAchievementSlider(
      slider,
      sliderState,
      updateSLD,
      SliderEngine
     );
   });

  openPopup("achievementPopup");

});


document
.getElementById("btn-enterprise")
?.addEventListener("click",()=>{

  openPopup("enterprisePopup");

});


document
.querySelector(".overlay")
?.addEventListener("click",closeAllPopups);


document
.querySelectorAll(".popup .close")
.forEach(btn=>{

  btn.addEventListener("click",closeAllPopups);

});

/* == PRODUCT POPUP CLOSE → BACK TO SHOP == */
document
.querySelector("#productPopup .close")
?.addEventListener("click",(e)=>{
e.stopPropagation();
document
.getElementById("productPopup")
.classList.remove("active");
document
.getElementById("shopPopup")
.classList.add("active");
});
   
document
.getElementById("btn-cart")
?.addEventListener("click",()=>{

renderCart();

openPopup("cartPopup");

});   

   
/* ===========================
   SESSION TIMEOUT
=========================== */

const SESSION_TIMEOUT = 20*60*1000;

function resetSessionTimer(){

  if(document.body.classList.contains("session-expired")) return;

  clearTimeout(sessionTimer);

  sessionTimer=setTimeout(expireSession,SESSION_TIMEOUT);

}

["click","touchstart","keydown","scroll"]
.forEach(evt=>{

  document.addEventListener(
    evt,
    resetSessionTimer,
    {passive:true}
  );

});

resetSessionTimer();


function expireSession(){

  closeAllPopups();

  document.body.classList.add("session-expired");

  showUnlockOverlay();

}


/* ===========================
   UNLOCK OVERLAY
=========================== */

function showUnlockOverlay(){

  if(document.getElementById("unlockOverlay")) return;

  wrongAttempts=0;

  const overlay=document.createElement("div");

  overlay.id="unlockOverlay";

  overlay.innerHTML=`
  <div class="unlock-box">
    <h3>Session expired</h3>
    <p>
      Enter <b>6-digit code</b> to unlock<br>
      or enter <b>9</b> to close
    </p>
    <input type="password" maxlength="6" inputmode="numeric"/>
    <button id="unlockBtn">Unlock</button>
    <div class="unlock-error"></div>
  </div>
  `;

  document.body.appendChild(overlay);

  const input=overlay.querySelector("input");
  const btn=overlay.querySelector("#unlockBtn");
  const err=overlay.querySelector(".unlock-error");

  input.focus();

  btn.onclick=()=>{

    const value=input.value.trim();

    if(value==="9"){
      closeLandingpage();
      return;
    }

    if(value===VIEWER_UNLOCK_CODE){
      location.reload();
      return;
    }

    wrongAttempts++;

    err.textContent=`Invalid code (${wrongAttempts}/3)`;

    input.value="";
    input.focus();

    if(wrongAttempts>=3){
      closeLandingpage();
    }

  };

}


/* ===========================
   CLOSE PAGE
=========================== */

function closeLandingpage(){

  document.body.innerHTML=`
  <div class="page-closed">
    <h3>Session closed</h3>
    <p>Please scan QR or NFC again</p>
  </div>
  `;

}

/* ===========================
   UTIL
=========================== */

window.openWebsite=()=>window.open("https://blh.vn","_blank");

});


/* ===========================
   PREVENT BROWSER ZOOM
=========================== */

window.addEventListener("wheel",e=>{
 if(e.ctrlKey) e.preventDefault()
},{passive:false})

window.addEventListener("keydown",e=>{
 if(e.ctrlKey && ["+","-","="].includes(e.key)){
   e.preventDefault()
 }
})


/* ===========================
   PREVENT DOUBLE CLICK ZOOM
=========================== */

let lastClick = 0
document.addEventListener("dblclick", e => e.preventDefault())
document.addEventListener("click", e=>{
  if(Date.now()-lastClick<300) e.preventDefault()
  lastClick = Date.now()
})
