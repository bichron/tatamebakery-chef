window.addEventListener("DOMContentLoaded",()=>{

/* ===========================
   DOM CACHE
=========================== */

const DOM = {

phone: document.getElementById("phone"),
overlay: document.querySelector(".overlay"),

qrPopup: document.getElementById("qrPopup"),

zoom: document.getElementById("qrZoom"),
zoomImg: document.getElementById("qrZoomImg"),

btnShop: document.getElementById("btn-shop"),
btnQR: document.getElementById("btn-qrcode"),
btnAchievement: document.getElementById("btn-achievement"),
btnEnterprise: document.getElementById("btn-enterprise"),
btnCart: document.getElementById("btn-cart"),

qtyInput: document.getElementById("qtyValue"),
qtyPlus: document.getElementById("qtyPlus"),
qtyMinus: document.getElementById("qtyMinus"),

cartItems: document.getElementById("cartItems"),
cartPreview: document.getElementById("cartPreview")

}

/* ===========================
   GLOBAL STATE
=========================== */

const VIEWER_UNLOCK_CODE="093777"

const qrState=new Map()

let qrWheel
let achievementWheel
let shopWheel

let activePopup=null
let sessionTimer=null
let wrongAttempts=0

let cart={}
let currentProduct=""

/* ===========================
   SCALE CARD
=========================== */

function scaleCard(){

const scale=Math.min(innerWidth/360,innerHeight/700)

DOM.phone.style.transform=`scale(${scale})`

}

scaleCard()
DOM.phone.classList.add("loaded")

window.addEventListener("resize",()=>requestAnimationFrame(scaleCard))

/* ===========================
   THEME
=========================== */

function toggleTheme(){

document.body.classList.toggle("light")

localStorage.setItem(
"theme",
document.body.classList.contains("light")?"light":"dark"
)

}

window.toggleTheme=toggleTheme

if(localStorage.getItem("theme")==="light"){
document.body.classList.add("light")
}

/* ===========================
   DEVICE ORIENTATION
=========================== */

if(window.DeviceOrientationEvent){

window.addEventListener("deviceorientation",e=>{

const x=e.gamma/40
const y=e.beta/40

DOM.phone.style.rotate=`${-y}deg ${x}deg`

})

}

/* ===========================
   NFC ANIMATION
=========================== */

const params=new URLSearchParams(location.search)

if(params.has("nfc")){

DOM.phone.animate(
[{transform:"scale(.95)"},{transform:"scale(1)"}],
{duration:800,easing:"ease-out"}
)

}

/* ===========================
   POPUP MANAGER
=========================== */

function closeAllPopups(){

document.querySelectorAll(".popup")
.forEach(p=>p.classList.remove("active"))

DOM.overlay?.classList.remove("active")

activePopup=null

}

function openPopup(id){

if(activePopup===id) return

closeAllPopups()

const popup=document.getElementById(id)

if(!popup) return

popup.classList.add("active")
DOM.overlay?.classList.add("active")

activePopup=id

}

/* ===========================
   WHEEL SYSTEM
=========================== */

function initQRWheel(){

qrWheel=new WheelEngine({
mask:"#qrPopup .wheel-mask",
radius:80,
onChange:(index)=>{

document
.querySelectorAll("#qrPopup .qr-panel")
.forEach((p,i)=>p.classList.toggle("active",i===index))

}
})

}

function initAchievementWheel(){

achievementWheel=new WheelEngine({
mask:"#achievementPopup .wheel-mask",
radius:80,
onChange:(index)=>{

document
.querySelectorAll("#achievementPopup .achievement-panel")
.forEach((p,i)=>p.classList.toggle("active",i===index))

}
})

}

function initShopWheel(){

shopWheel=new WheelEngine({
mask:"#shopPopup .wheel-mask",
radius:80,
onChange:(index)=>{

document
.querySelectorAll("#shopPopup .shop-panel")
.forEach((p,i)=>p.classList.toggle("active",i===index))

}
})

}

/* ===========================
   IMAGE ZOOM
=========================== */

document.addEventListener("click",e=>{

const img=e.target.closest(
".qr-track img, .achievement-track img"
)

if(!img) return

e.stopPropagation()

DOM.zoomImg.src=img.src
DOM.zoom.classList.add("active")

})

DOM.zoom?.addEventListener("click",()=>{

DOM.zoom.classList.remove("active")

})

/* ===========================
   PRODUCT POPUP
=========================== */

function openProduct(name,price,img){

currentProduct=name

document.getElementById("productName").textContent=name
document.getElementById("productPrice").textContent=price+"đ"
document.getElementById("productImage").src=img

updateQtyDisplay()

openPopup("productPopup")

}

document.addEventListener("click",e=>{

const card=e.target.closest(".product-card")

if(!card) return

const img=card.querySelector("img").src
const name=card.querySelector(".product-name").textContent
const price=card.querySelector(".product-price").textContent

openProduct(name,price,img)

})

/* ===========================
   CART
=========================== */

function updateQtyDisplay(){

const qty=cart[currentProduct]||0

DOM.qtyInput.value=qty

}

function renderCart(){

const boxes=[DOM.cartItems,DOM.cartPreview]

boxes.forEach(box=>{

if(!box) return

box.innerHTML=""

if(Object.keys(cart).length===0){

box.innerHTML="<div class='cart-empty'>Cart empty</div>"
return

}

Object.keys(cart).forEach(name=>{

const qty=cart[name]

const row=document.createElement("div")

row.className="cart-item"

row.innerHTML=`
<span class="cart-name">${name}</span>
<span class="cart-qty">×${qty}</span>
<button class="cart-minus" data-name="${name}">–</button>
`

box.appendChild(row)

})

})

}

/* ADD */

DOM.qtyPlus?.addEventListener("click",()=>{

if(!currentProduct) return

cart[currentProduct]=(cart[currentProduct]||0)+1

updateQtyDisplay()
renderCart()

})

/* REMOVE */

DOM.qtyMinus?.addEventListener("click",()=>{

if(!currentProduct) return

if(!cart[currentProduct]) return

cart[currentProduct]--

if(cart[currentProduct]<=0){
delete cart[currentProduct]
}

updateQtyDisplay()
renderCart()

})

/* INPUT */

DOM.qtyInput?.addEventListener("input",()=>{

if(!currentProduct) return

let val=parseInt(DOM.qtyInput.value)

if(isNaN(val)||val<=0){

delete cart[currentProduct]
renderCart()
updateQtyDisplay()
return

}

cart[currentProduct]=val

updateQtyDisplay()
renderCart()

})

/* REMOVE ITEM */

document.addEventListener("click",e=>{

if(!e.target.matches(".cart-minus")) return

const name=e.target.dataset.name

cart[name]--

if(cart[name]<=0){
delete cart[name]
}

renderCart()
updateQtyDisplay()

})

/* COPY */

document
.getElementById("copyCartOrder")
?.addEventListener("click",()=>{

let text="Tatame Bakery Order\n\n"

if(Object.keys(cart).length===0){

alert("Your cart is empty.")
return

}

Object.keys(cart).forEach(name=>{

text+=`${name} x${cart[name]}\n`

})

text+="\nThank you!"

navigator.clipboard.writeText(text)

alert("Order copied. Paste into chat.")

})

/* ===========================
   BUTTON EVENTS
=========================== */

DOM.btnShop?.addEventListener("click",()=>{

if(!shopWheel) initShopWheel()

shopWheel.go(0)

document
.querySelectorAll("#shopPopup .shop-slider")
.forEach(slider=>{

if(!slider.dataset.loaded){

loadShopSlider(slider)
slider.dataset.loaded=1

}

})

openPopup("shopPopup")

})

DOM.btnQR?.addEventListener("click",()=>{

if(!qrWheel) initQRWheel()

qrWheel.go(0)

document
.querySelectorAll("#qrPopup .qr-slider")
.forEach(loadQRSlider)

openPopup("qrPopup")

window.loadDynamicQR?.()

})

DOM.btnAchievement?.addEventListener("click",()=>{

if(!achievementWheel) initAchievementWheel()

achievementWheel.go(0)

document
.querySelectorAll("#achievementPopup .achievement-slider")
.forEach(loadAchievementSlider)

openPopup("achievementPopup")

})

DOM.btnEnterprise?.addEventListener("click",()=>{

openPopup("enterprisePopup")

})

DOM.btnCart?.addEventListener("click",()=>{

renderCart()

openPopup("cartPopup")

})

DOM.overlay?.addEventListener("click",closeAllPopups)

document
.querySelectorAll(".popup .close")
.forEach(btn=>btn.addEventListener("click",closeAllPopups))

/* ===========================
   UTIL
=========================== */

window.openWebsite=()=>window.open("https://blh.vn","_blank")

})
