import { initQRWheel, initAchievementWheel, initShopWheel } from "./enginesys/wheelengine.js"
import { PopupEngine } from "./enginesys/popupengine.js"
import { SliderEngine } from "./enginesys/sliderengine.js"
import { QREngine } from "./enginesys/qrengine.js"
import { AchievEngine } from "./enginesys/achievengine.js"
import { ShopEngine } from "./enginesys/shopengine.js"
import { CartEngine } from "./enginesys/cartengine.js"


let shopData = []
let shopGroups = []

window.addEventListener("DOMContentLoaded", async()=>{

await ShopEngine.loadProductData()
ShopEngine.buildShopUI()

/* ===========================
   ELEMENTS
=========================== */

const phone = document.getElementById("phone")
const qrPopup = document.getElementById("qrPopup")

const zoom = document.getElementById("qrZoom")
const zoomImg = document.getElementById("qrZoomImg")

const VIEWER_UNLOCK_CODE = "093777"

const qrState = new Map()

let qrWheel
let achievementWheel
let shopWheel

let activePopup=null

let sessionTimer=null
let wrongAttempts=0


/* ===========================
   SCALE CARD
=========================== */

function scaleCard(){

const scale = Math.min(innerWidth/360, innerHeight/700)

phone.style.transform = `scale(${scale})`

}

scaleCard()
phone.classList.add("loaded")

window.addEventListener(
"resize",
()=>requestAnimationFrame(scaleCard)
)


/* ===========================
   THEME
=========================== */

function toggleTheme(){

document.body.classList.toggle("light")

localStorage.setItem(
"theme",
document.body.classList.contains("light")
? "light"
: "dark"
)

}

window.toggleTheme = toggleTheme

if(localStorage.getItem("theme")==="light"){
document.body.classList.add("light")
}


/* ===========================
   DEVICE ORIENTATION
=========================== */

if(window.DeviceOrientationEvent){

window.addEventListener("deviceorientation",e=>{

const x = e.gamma / 40
const y = e.beta / 40

phone.style.rotate = `${-y}deg ${x}deg`

})

}


/* ===========================
   NFC ANIMATION
=========================== */

const params = new URLSearchParams(location.search)

if(params.has("nfc")){

phone.animate(
[{transform:"scale(.95)"},{transform:"scale(1)"}],
{duration:800,easing:"ease-out"}
)

}


/* ===========================
   GLOBAL IMAGE ZOOM
=========================== */

document.addEventListener("click",e=>{

const img = e.target.closest(
".qr-track img, .achievement-track img"
)

if(!img) return

e.stopPropagation()

zoomImg.src=img.src

zoom.classList.add("active")

})

zoom?.addEventListener("click",()=>{

zoom.classList.remove("active")

})


/* ===========================
   POPUP MANAGER
=========================== */

function closeAllPopups(){

document.querySelectorAll(".popup")
.forEach(p=>p.classList.remove("active"))

document.querySelector(".overlay")
?.classList.remove("active")

activePopup=null

}

function openPopup(id){

if(activePopup===id) return

closeAllPopups()

const popup=document.getElementById(id)

if(!popup) return

popup.classList.add("active")

document.querySelector(".overlay")
?.classList.add("active")

activePopup=id

}


/* ===========================
   BUTTON EVENTS
=========================== */

document
.getElementById("btn-shop")
?.addEventListener("click",()=>{

if(!shopWheel) initShopWheel(window)

shopWheel.go(0)

document
.querySelectorAll("#shopPanels .shop-slider")
.forEach(slider=>{

if(!slider.dataset.loaded){

ShopEngine.loadShopSlider(slider, qrState, SliderEngine)
slider.dataset.loaded=1

}

})

openPopup("shopPopup")

})


document
.getElementById("btn-qrcode")
?.addEventListener("click",()=>{

if(!qrWheel) initQRWheel(window)

qrWheel.go(0)

document
.querySelectorAll("#qrPopup .qr-slider")
.forEach(slider=>{
QREngine.loadQRSlider(slider, qrState, SliderEngine)
})

openPopup("qrPopup")

window.loadDynamicQR?.()

})


document
.getElementById("btn-achievement")
?.addEventListener("click",()=>{

if(!achievementWheel) initAchievementWheel(window)

achievementWheel.go(0)

document
.querySelectorAll("#achievementPopup .achievement-slider")
.forEach(slider=>{
AchievEngine.loadAchievementSlider(slider, qrState, SliderEngine)
})

openPopup("achievementPopup")

})


document
.getElementById("btn-enterprise")
?.addEventListener("click",()=>{

openPopup("enterprisePopup")

})


document
.querySelector(".overlay")
?.addEventListener("click",closeAllPopups)


document
.querySelectorAll(".popup .close")
.forEach(btn=>{

btn.addEventListener("click",closeAllPopups)

})


/* ===========================
   SESSION TIMEOUT
=========================== */

const SESSION_TIMEOUT = 20*60*1000

function resetSessionTimer(){

if(document.body.classList.contains("session-expired")) return

clearTimeout(sessionTimer)

sessionTimer=setTimeout(expireSession,SESSION_TIMEOUT)

}

["click","touchstart","keydown","scroll"]
.forEach(evt=>{

document.addEventListener(
evt,
resetSessionTimer,
{passive:true}
)

})

resetSessionTimer()


function expireSession(){

closeAllPopups()

document.body.classList.add("session-expired")

showUnlockOverlay()

}


/* ===========================
   UNLOCK OVERLAY
=========================== */

function showUnlockOverlay(){

if(document.getElementById("unlockOverlay")) return

wrongAttempts=0

const overlay=document.createElement("div")

overlay.id="unlockOverlay"

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


/* ===========================
   CLOSE PAGE
=========================== */

function closeLandingpage(){

document.body.innerHTML=`
<div class="page-closed">
<h3>Session closed</h3>
<p>Please scan QR or NFC again</p>
</div>
`

}


/* ===========================
   UTIL
=========================== */

window.openWebsite=()=>window.open("https://blh.vn","_blank")

})


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
