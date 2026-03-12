
/* =====================================================
   TATAME LANDINGPAGE – SAFE REFACTOR (dev01.06)
   Behaviour preserved – structure cleaned
===================================================== */

window.addEventListener("DOMContentLoaded",()=>{

const DOM = {
phone: document.getElementById("phone"),
qrPopup: document.getElementById("qrPopup"),
overlay: document.querySelector(".overlay"),
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

const VIEWER_UNLOCK_CODE="093777"

const qrState = new Map()

let qrWheel
let achievementWheel
let shopWheel

let activePopup=null
let sessionTimer=null
let wrongAttempts=0

let cart={}
let currentProduct=""

function scaleCard(){
 const scale=Math.min(innerWidth/360,innerHeight/700)
 DOM.phone.style.transform=`scale(${scale})`
}

scaleCard()
DOM.phone.classList.add("loaded")

window.addEventListener("resize",()=>requestAnimationFrame(scaleCard))

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

if(window.DeviceOrientationEvent){

 window.addEventListener("deviceorientation",e=>{

  const x=e.gamma/40
  const y=e.beta/40

  DOM.phone.style.rotate=`${-y}deg ${x}deg`

 })

}

const params=new URLSearchParams(location.search)

if(params.has("nfc")){
 DOM.phone.animate(
  [{transform:"scale(.95)"},{transform:"scale(1)"}],
  {duration:800,easing:"ease-out"}
 )
}

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

DOM.qtyPlus?.addEventListener("click",()=>{

 if(!currentProduct) return

 cart[currentProduct]=(cart[currentProduct]||0)+1

 updateQtyDisplay()
 renderCart()

})

DOM.qtyMinus?.addEventListener("click",()=>{

 if(!currentProduct) return
 if(!cart[currentProduct]) return

 cart[currentProduct]--

 if(cart[currentProduct]<=0) delete cart[currentProduct]

 updateQtyDisplay()
 renderCart()

})

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

document.addEventListener("click",e=>{

 if(!e.target.matches(".cart-minus")) return

 const name=e.target.dataset.name

 cart[name]--
 if(cart[name]<=0) delete cart[name]

 renderCart()
 updateQtyDisplay()

})

document.getElementById("copyCartOrder")
?.addEventListener("click",()=>{

 if(Object.keys(cart).length===0){
  alert("Your cart is empty.")
  return
 }

 let text="Tatame Bakery Order\n\n"

 Object.keys(cart).forEach(name=>{
  text+=`${name} x${cart[name]}\n`
 })

 text+="\nThank you!"

 navigator.clipboard.writeText(text)
 alert("Order copied. Paste into chat.")

})

DOM.btnShop?.addEventListener("click",()=>{

 if(!shopWheel) initShopWheel()
 shopWheel.go(0)

 openPopup("shopPopup")

})

DOM.btnQR?.addEventListener("click",()=>{

 if(!qrWheel) initQRWheel()
 qrWheel.go(0)

 openPopup("qrPopup")

 window.loadDynamicQR?.()

})

DOM.btnAchievement?.addEventListener("click",()=>{

 if(!achievementWheel) initAchievementWheel()
 achievementWheel.go(0)

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

document.querySelectorAll(".popup .close")
.forEach(btn=>btn.addEventListener("click",closeAllPopups))

const SESSION_TIMEOUT=20*60*1000

function resetSessionTimer(){

 if(document.body.classList.contains("session-expired")) return

 clearTimeout(sessionTimer)

 sessionTimer=setTimeout(expireSession,SESSION_TIMEOUT)

}

["click","touchstart","keydown","scroll"]
.forEach(evt=>{

 document.addEventListener(evt,resetSessionTimer,{passive:true})

})

resetSessionTimer()

function expireSession(){

 closeAllPopups()

 document.body.classList.add("session-expired")

 showUnlockOverlay()

}

function showUnlockOverlay(){

 if(document.getElementById("unlockOverlay")) return

 wrongAttempts=0

 const overlay=document.createElement("div")
 overlay.id="unlockOverlay"

 overlay.innerHTML=`
 <div class="unlock-box">
  <h3>Session expired</h3>
  <p>Enter <b>6-digit code</b> to unlock<br>or enter <b>9</b> to close</p>
  <input type="password" maxlength="6" inputmode="numeric"/>
  <button id="unlockBtn">Unlock</button>
  <div class="unlock-error"></div>
 </div>
 `

 document.body.appendChild(overlay)

 const input=overlay.querySelector("input")
 const btn=overlay.querySelector("#unlockBtn")
 const err=overlay.querySelector(".unlock-error")

 input.focus()

 btn.onclick=()=>{

  const value=input.value.trim()

  if(value==="9"){
   closeLandingpage()
   return
  }

  if(value===VIEWER_UNLOCK_CODE){
   location.reload()
   return
  }

  wrongAttempts++
  err.textContent=`Invalid code (${wrongAttempts}/3)`

  input.value=""
  input.focus()

  if(wrongAttempts>=3){
   closeLandingpage()
  }

 }

}

function closeLandingpage(){

 document.body.innerHTML=`
 <div class="page-closed">
  <h3>Session closed</h3>
  <p>Please scan QR or NFC again</p>
 </div>
 `

}

window.openWebsite=()=>window.open("https://blh.vn","_blank")

})

window.addEventListener("wheel",e=>{
 if(e.ctrlKey) e.preventDefault()
},{passive:false})

window.addEventListener("keydown",e=>{
 if(e.ctrlKey && ["+","-","="].includes(e.key)){
  e.preventDefault()
 }
})

let lastClick=0

document.addEventListener("dblclick",e=>e.preventDefault())

document.addEventListener("click",e=>{

 if(Date.now()-lastClick<300) e.preventDefault()

 lastClick=Date.now()

})
