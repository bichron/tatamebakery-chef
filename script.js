window.addEventListener("DOMContentLoaded",()=>{

/* ===========================
   ELEMENTS
=========================== */

const phone = document.getElementById("phone");
const qrPopup = document.getElementById("qrPopup");

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
   QR SLIDER
=========================== */

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

    qrState.set(slider,0);

    track.dataset.x = 0;

    enableQRSwipe(slider);
    updateQR(slider);

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

    const total=track.children.length;

    let index=Math.round(-currentX/STEP);

    index=Math.max(0,Math.min(index,total-1));

    const snappedX=-index*STEP;

    track.dataset.x=snappedX;

    qrState.set(slider,index);

    updateQR(slider);

  });

}


function updateQR(slider){

  const index=qrState.get(slider)??0;

  const track =
    slider.querySelector(".qr-track") ||
    slider.querySelector(".achievement-track") ||
    slider.querySelector(".shop-track");
  
   const dots = slider.querySelectorAll(
  ".qr-indicators span, .achievement-indicators span"
);

  const STEP=164;
  const x=-index*STEP;

  track.dataset.x=x;

  track.style.transition="transform .35s ease";
  track.style.transform=`translateX(${x}px)`;

  dots.forEach(d=>d.classList.remove("active"));

  if(dots[index]) dots[index].classList.add("active");

}

/* ===========================
   LOAD GALLERY
=========================== */
function loadAchievementSlider(slider){

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

    qrState.set(slider,0);

    track.dataset.x = 0;

    enableQRSwipe(slider);
    updateQR(slider);

  }

  tryLoad();

}
   
/* ===========================
   GLOBAL IMAGE ZOOM
=========================== */

document.addEventListener("click",e=>{
  const img = e.target.closest(
    ".qr-track img, .achievement-track img, .shop-track img"
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
   SHOP WHEEL
=========================== */

function initShopWheel(){

  shopWheel = new WheelEngine({

    mask:"#shopPopup .wheel-mask",

    radius:80,

    onChange:(index)=>{

      document
      .querySelectorAll("#shopPopup .shop-panel")
      .forEach((p,i)=>{

        p.classList.toggle("active", i===index);

      });

    }

  });

}

/* ===========================
   SHOP SLIDER
=========================== */

function loadShopSlider(slider){

  const track = slider.querySelector(".shop-track");
  const indicatorBox = slider.querySelector(".shop-indicators");

  const group = slider.dataset.group;
  const maxAllowed = parseInt(slider.dataset.max);

  track.innerHTML="";
  indicatorBox.innerHTML="";

  let images=[];
  let index=1;

  function tryLoad(){

    const img=new Image();

    img.src=`assets/shop/${group}/${index}.jpg`;

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

    qrState.set(slider,0);

    track.dataset.x = 0;

    enableQRSwipe(slider);
    updateQR(slider);

  }

  tryLoad();

}
   
/* ===========================
   POPUP MANAGER
=========================== */

function closeAllPopups(){

  document.querySelectorAll(".popup")
  .forEach(p=>p.classList.remove("active"));

  document.querySelector(".overlay")
  ?.classList.remove("active");

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

  document
  .querySelectorAll("#shopPopup .shop-slider")
  .forEach(loadShopSlider);

  openPopup("shopPopup");

});
   

document
.getElementById("btn-qrcode")
?.addEventListener("click",()=>{

  if(!qrWheel) initQRWheel();

  qrWheel.go(0);

  document
  .querySelectorAll("#qrPopup .qr-slider")
  .forEach(loadQRSlider);

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
  .forEach(loadAchievementSlider);

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


window.downloadVCF=()=>{

  const vcf=`BEGIN:VCARD
VERSION:3.0
FN:Chris Pham
TITLE:Chief Commercial Officer
ORG:BLH Joint Stock Company
TEL:0909554558
END:VCARD`;

  const blob=new Blob([vcf],{type:"text/vcard"});

  const a=document.createElement("a");

  a.href=URL.createObjectURL(blob);
  a.download="Chris_Pham.vcf";

  a.click();

};

});
