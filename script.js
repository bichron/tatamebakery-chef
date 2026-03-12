let cart = {};
let shopData = [];
let currentProduct = "";

/* ===========================
   LOAD PRODUCT DATA
=========================== */

async function loadProductData(){

  try{

    const res = await fetch("data/product.json");

    const data = await res.json();

    shopData = data.products;

    console.log("Products loaded:", shopData)

  }catch(err){

    console.error("Product load error:",err)

  }

}

window.addEventListener("DOMContentLoaded", async ()=>{
try{
  await loadProductData();
}catch(e){
  console.warn("Product load skipped",e);
}

/* ===========================
   ELEMENTS
=========================== */

const phone = document.getElementById("phone");
const zoom = document.getElementById("qrZoom");
const zoomImg = document.getElementById("qrZoomImg");

const VIEWER_UNLOCK_CODE = "093777";

const qrState = new Map();

let qrWheel;
let achievementWheel;
let shopWheel;

let activePopup=null;

let sessionTimer=null;
let wrongAttempts=0;


/* ===========================
   SCALE CARD
=========================== */

function scaleCard(){

  const scale = Math.min(innerWidth/360, innerHeight/700);

  phone.style.transform = `scale(${scale})`;

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


/* ===========================
   ACHIEVEMENT WHEEL
=========================== */

function initAchievementWheel(){

  achievementWheel = new WheelEngine({

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


/* ===========================
   PRODUCT POPUP
=========================== */

function openProduct(id,name,price,img){

currentProduct = id;

document.getElementById("productName").textContent = name;
document.getElementById("productPrice").textContent = price + "đ";
document.getElementById("productImage").src = img;

updateQtyDisplay();

openPopup("productPopup");

}


document.addEventListener("click",e=>{

  const card = e.target.closest(".product-card");

  if(!card) return;

  const id = card.dataset.id;

 const product = shopData.find(p=>p.id===id);

  if(!product){
   console.warn("Product not found:", id);
   return;
   }

  openProduct(product.id, product.name, product.price, product.image);

});


/* ===========================
   CART STATE
=========================== */

const qtyInput = document.getElementById("qtyValue");

qtyInput && qtyInput.addEventListener("focus", moveCaretToEnd);
qtyInput && qtyInput.addEventListener("click", moveCaretToEnd);

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


/* ===========================
   POPUP MANAGER
=========================== */

function closeAllPopups(){

  document.querySelectorAll(".popup")
  .forEach(p=>p.classList.remove("active"));

  const ov = document.querySelector(".overlay");
  if(ov) ov.classList.remove("active");

  activePopup=null;

}

function openPopup(id){

  if(activePopup===id) return;

  closeAllPopups();

  const popup=document.getElementById(id);

  if(!popup) return;

  popup.classList.add("active");

  const ov = document.querySelector(".overlay");
  if(ov) ov.classList.add("active");

  activePopup=id;

}


/* ===========================
   BUTTON EVENTS
=========================== */

const btnShop = document.getElementById("btn-shop");
if(btnShop){
btnShop.addEventListener("click",()=>{

  if(!shopWheel){
  initShopWheel();
}

if(shopWheel){
  shopWheel.go(0);
}

  document
  .querySelectorAll("#shopPopup .shop-slider")
  .forEach(loadShopSlider);

  openPopup("shopPopup");

});
}

const btnQR = document.getElementById("btn-qrcode");
if(btnQR){
btnQR.addEventListener("click",()=>{

if(!qrWheel){
  initQRWheel();
}

if(qrWheel){
  qrWheel.go(0);
}

  document
  .querySelectorAll("#qrPopup .qr-slider")
  .forEach(loadQRSlider);

  openPopup("qrPopup");

  if(window.loadDynamicQR) window.loadDynamicQR();

});
}


const btnAchievement = document.getElementById("btn-achievement");
if(btnAchievement){
btnAchievement.addEventListener("click",()=>{

if(!achievementWheel){
  initAchievementWheel();
}

if(achievementWheel){
  achievementWheel.go(0);
}
  document
  .querySelectorAll("#achievementPopup .achievement-slider")
  .forEach(loadAchievementSlider);

  openPopup("achievementPopup");

});
}

const btnEnterprise = document.getElementById("btn-enterprise");
if(btnEnterprise){
btnEnterprise.addEventListener("click",()=>{

  openPopup("enterprisePopup");

});
}


const overlay = document.querySelector(".overlay");
if(overlay){
overlay.addEventListener("click",closeAllPopups);
}


document
.querySelectorAll(".popup .close")
.forEach(btn=>{

  btn.addEventListener("click",closeAllPopups);

});


const productClose = document.querySelector("#productPopup .close");
if(productClose){
productClose.addEventListener("click",(e)=>{
e.stopPropagation();
document.getElementById("productPopup").classList.remove("active");
document.getElementById("shopPopup").classList.add("active");
});
}


const btnCart = document.getElementById("btn-cart");
if(btnCart){
btnCart.addEventListener("click",()=>{

renderCart();

openPopup("cartPopup");

});
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

document.addEventListener("dblclick", e=>{
  if(e.target.tagName !== "BUTTON"){
    e.preventDefault()
  }
},{passive:false})
