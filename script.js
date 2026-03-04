window.addEventListener("DOMContentLoaded",()=>{

const phone = document.getElementById("phone");
const qrPopup = document.getElementById("qrPopup");
const enterprisePopup = document.getElementById("enterprisePopup");
const achievementPopup = document.getElementById("achievementPopup");
const qrState = new Map();

const VIEWER_UNLOCK_CODE = "881909"; // 🔐 code 6 số để unclock nhanh không scan lại

/* ===========================
   SCALE CARD
=========================== */
function scaleCard(){
  const scale = Math.min(innerWidth/360, innerHeight/700);
   phone.style.transform = `scale(${scale})`;
/*  phone.style.transform = `scale(${scale}) rotateX(${-y}deg) rotateY(${x}deg)`;*/
}
scaleCard();
phone.classList.add("loaded");
window.addEventListener("resize",()=>requestAnimationFrame(scaleCard));

/* ===========================
   THEME
=========================== */
function toggleTheme(){
  document.body.classList.toggle("light");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
}
window.toggleTheme = toggleTheme;

if(localStorage.getItem("theme")==="light")
  document.body.classList.add("light");

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
   QR WHEEL CYLINDER
=========================== */
const groups = document.querySelectorAll(".qr-group");
const panels = document.querySelectorAll(".qr-panel");
const total = groups.length;
const angleStep = total ? 360 / total : 0;
let currentIndex = 0;
function updateWheel(){
  groups.forEach((g, i) => {
  const angle = (i - currentIndex) * angleStep;

  g.style.transform = `
    translate(-50%, -50%)
    rotateY(${angle}deg)
    translateZ(80px)
  `;

  const rad = angle * Math.PI / 180;
  const isBack = Math.cos(rad) < 0;

  g.classList.toggle("active", i === currentIndex);

  // 🔥 KHÔNG COUNTER ROTATE
const text = g.querySelector("span");

  // chỉ giảm opacity phía sau cho tự nhiên
if(text){
  text.style.opacity = isBack ? "0.5" : "1";
}

  panels[i].classList.toggle("active", i === currentIndex);
});
}

if (groups.length && panels.length) {
  updateWheel();
}

/* ===========================
   ACHIEVEMENT WHEEL CYLINDER
=========================== */

const achievementGroups =
  document.querySelectorAll(".achievement-group");

const achievementPanels =
  document.querySelectorAll(".achievement-panel");

const achTotal = achievementGroups.length;

const achAngleStep =
  achTotal ? 360 / achTotal : 0;

let achIndex = 0;

function updateAchievementWheel(){

  achievementGroups.forEach((g,i)=>{

    const angle = (i - achIndex) * achAngleStep;

    g.style.transform = `
      translate(-50%,-50%)
      rotateY(${angle}deg)
      translateZ(80px)
    `;

    const rad = angle * Math.PI / 180;
    const isBack = Math.cos(rad) < 0;

    g.classList.toggle("active", i === achIndex);

    const text = g.querySelector("span");

    if(text){
      text.style.opacity = isBack ? ".45" : "1";
    }

    achievementPanels[i].classList.toggle(
      "active",
      i === achIndex
    );

  });

}

/* ===========================
   ACHIEVEMENT SWIPE
=========================== */

let achStartX = 0;

const achWrap =
  document.querySelector(".achievement-wheel-mask");

if(achWrap){

  achWrap.addEventListener("touchstart",e=>{
    achStartX = e.touches[0].clientX;
  },{passive:true});

  achWrap.addEventListener("touchend",e=>{

    const diff =
      e.changedTouches[0].clientX - achStartX;

    if(Math.abs(diff) < 30) return;

    achIndex =
      diff < 0
        ? (achIndex + 1) % achTotal
        : (achIndex - 1 + achTotal) % achTotal;

    updateAchievementWheel();

  });

}

/* ===========================
   WHEEL INTERACTION
=========================== */
let startX = 0;
const wheelWrap = document.querySelector(".qr-group-wheel");

if(wheelWrap){
  wheelWrap.addEventListener("touchstart", e=>{
    startX = e.touches[0].clientX;
  },{passive:true});

  wheelWrap.addEventListener("touchend", e=>{
    const diff = e.changedTouches[0].clientX - startX;
    if(Math.abs(diff) < 30) return;

    currentIndex =
      diff < 0
        ? (currentIndex + 1) % total
        : (currentIndex - 1 + total) % total;

    updateWheel();
  });
}

groups.forEach((g,i)=>{
  g.addEventListener("click",()=>{
    currentIndex = i;
    updateWheel();
  });
});

/* ĐOẠN THÊM VỀ QR-SLIDER SẼ XẾP LẠI */

function loadQRSlider(slider){
  delete slider.dataset.swipeBound;  // 🔥 reset listener flag
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

    img.onload = () => {
      images.push(img.src);
      index++;
      tryLoad();
    };

    img.onerror = build;
  }

  function build(){
    const count = Math.min(maxAllowed, images.length);
    if(count === 0){
       track.innerHTML = "<div class='qr-empty'>No QR</div>";
    return;}

    for(let i = 0; i < count; i++){
      const el = document.createElement("img");
      el.src = images[i];
      track.appendChild(el);

      const dot = document.createElement("span");
      if(i === 0) dot.classList.add("active");
      indicatorBox.appendChild(dot);
    }

    qrState.set(slider, 0);
    track.dataset.x = 0;
    enableQRSwipe(slider);
    updateQR(slider);
  }

  tryLoad();
}

function enableQRSwipe(slider){
  // 🔒 chặn gắn listener nhiều lần
  if(slider.dataset.swipeBound) return;
  slider.dataset.swipeBound = "1";
  const track = slider.querySelector(".qr-track");
  let startX = 0;
  let dragging = false;

  const STEP = 164;

  slider.addEventListener("touchstart", e=>{
    dragging = true;
    startX = e.touches[0].clientX;
    track.style.transition = "none";
  }, { passive:true });

  slider.addEventListener("touchmove", e=>{
    if(!dragging) return;

    const baseX = parseFloat(track.dataset.x || 0);
    const dx = e.touches[0].clientX - startX;
    track.style.transform = `translateX(${baseX + dx}px)`;
  }, { passive:true });

  slider.addEventListener("touchend", e=>{
    if(!dragging) return;
    dragging = false;

    const baseX = parseFloat(track.dataset.x || 0);
    const dx = e.changedTouches[0].clientX - startX;
    let currentX = baseX + dx;

    const total = track.children.length;
    let index = Math.round(-currentX / STEP);
    index = Math.max(0, Math.min(index, total - 1));

    const snappedX = -index * STEP;
    track.dataset.x = snappedX;

    qrState.set(slider, index);
    updateQR(slider);
  });
}

function updateQR(slider){
  const index = qrState.get(slider) ?? 0;
  const track = slider.querySelector(".qr-track");
  const dots = slider.querySelectorAll(".qr-indicators span");

  const STEP = 164;
  const x = -index * STEP;

  track.dataset.x = x;
  track.style.transition = "transform .35s ease";
  track.style.transform = `translateX(${x}px)`;

  dots.forEach(d => d.classList.remove("active"));
  if(dots[index]) dots[index].classList.add("active");
}

/* ===========================
   ACHIEVEMENT BUILD 20:10 SUN 1 MAR
=========================== */

const achievementGroups = [
  {
    name:"Bread",
    products:[
      "img/bread1.jpg",
      "img/bread2.jpg"
    ]
  },
  {
    name:"Cake",
    products:[
      "img/cake1.jpg",
      "img/cake2.jpg"
    ]
  },
  {
    name:"Drink",
    products:[
      "img/drink1.jpg"
    ]
  }
];

const wheel = document.getElementById("achievementWheel");
let currentGroupIndex = 0;

function initAchievementWheel(){

  if(!wheel) return;

  const total = achievementGroups.length;
  const angleStep = 360 / total;

  wheel.innerHTML = "";

  achievementGroups.forEach((group,i)=>{
    const div = document.createElement("div");
    div.className = "wheel-item";
    div.innerText = group.name;

    const angle = i * angleStep;

    div.style.transform = `
      rotateY(${angle}deg)
      translateZ(var(--wheel-size))
    `;

    wheel.appendChild(div);
  });

  bindAchievementSwipe();   // 🔥 bind tại đây
  updateAchievementWheel();
}

function updateAchievementWheel(){

  if(!wheel) return;   // 🔥 guard bắt buộc

  const angleStep = 360 / achievementGroups.length;
  const rotate = currentGroupIndex * -angleStep;

  wheel.style.transform = `rotateY(${rotate}deg)`;
  const items = wheel.querySelectorAll(".wheel-item");

  items.forEach((item,i)=>{
    item.classList.toggle("active", i === currentGroupIndex);
  });

  updateProductView();
}

function updateProductView(){

  const slider = document.getElementById("productSlider");
  const indicators = document.getElementById("productIndicators");

  if(!slider || !indicators) return;

  slider.innerHTML="";
  indicators.innerHTML="";

  const products = achievementGroups[currentGroupIndex].products;

  products.forEach((src,i)=>{
    const img = document.createElement("img");
    img.src = src;
    slider.appendChild(img);

    const dot = document.createElement("div");
    dot.className="indicator";
    if(i===0) dot.classList.add("active");
    indicators.appendChild(dot);
  });
}

function openAchievement(){
  currentGroupIndex = 0;
  initAchievementWheel();
  updateProductView();
}

function bindAchievementSwipe(){

  const wrap = document.querySelector("#achievementPopup .wheel-mask");
  if(!wrap) return;

  if(wrap.dataset.swipeBound) return;   // 🔒 tránh bind nhiều lần
  wrap.dataset.swipeBound = "1";

  let startX = 0;

  wrap.addEventListener("touchstart", e=>{
    startX = e.touches[0].clientX;
  }, { passive:true });

  wrap.addEventListener("touchend", e=>{
    const diff = e.changedTouches[0].clientX - startX;
    if(Math.abs(diff) < 30) return;

    currentGroupIndex =
      diff < 0
        ? (currentGroupIndex + 1) % achievementGroups.length
        : (currentGroupIndex - 1 + achievementGroups.length) % achievementGroups.length;

    updateAchievementWheel();
  });
}

/* ===========================
   QR ZOOM
=========================== */
const zoom = document.getElementById("qrZoom");
const zoomImg = document.getElementById("qrZoomImg");

document.addEventListener("click", e => {
  if(!qrPopup || !qrPopup.classList.contains("active")) return;

  const img = e.target.closest(".qr-track img");
  if(!img) return;

  zoomImg.src = img.src;
  zoom.classList.add("active");
});

if(zoom){
  zoom.addEventListener("click",()=>{
    zoom.classList.remove("active");
  });
}

/* ===========================
   SESSION EXPIRE + UNLOCK CODE
=========================== */
const SESSION_TIMEOUT = 20 * 60 * 1000; // 20 phút
let sessionTimer = null;

function resetSessionTimer(){
  if(document.body.classList.contains("session-expired")) return;
  clearTimeout(sessionTimer);
  sessionTimer = setTimeout(expireSession, SESSION_TIMEOUT);
}

["click","touchstart","keydown","scroll"].forEach(evt=>{
  document.addEventListener(evt, resetSessionTimer, { passive:true });
});

resetSessionTimer();

function expireSession(){
  closeAllPopups();          // 🔥 reset popup state
  document.body.classList.add("session-expired");
  showUnlockOverlay();
}

/* ===========================
   UNCLOCK / SHUTDOWN OVERLAY
=========================== */
let wrongAttempts = 0;

function showUnlockOverlay(){
  if(document.getElementById("unlockOverlay")) return;

  wrongAttempts = 0;

  const overlay = document.createElement("div");
  overlay.id = "unlockOverlay";
  overlay.innerHTML = `
    <div class="unlock-box">
      <h3>Session expired</h3>
      <p>
        Enter <b>6-digit code</b> to unlock<br>
        or enter <b>9</b> to close
      </p>
      <input type="password"
             maxlength="6"
             inputmode="numeric"
             placeholder="••••••" />
      <button id="unlockBtn">Unlock</button>
      <div class="unlock-error"></div>
    </div>
  `;

  document.body.appendChild(overlay);

  const input = overlay.querySelector("input");
  const button = overlay.querySelector("#unlockBtn");
  const error = overlay.querySelector(".unlock-error");

  input.focus();

  // 🔄 đổi nút theo input
  input.addEventListener("input", () => {
    if(input.value.trim() === "9"){
      button.textContent = "Close";
    }else{
      button.textContent = "Unlock";
    }
    error.textContent = "";
  });

  button.onclick = () => {
    const value = input.value.trim();

    // ✅ nhập 9 → Close
    if(value === "9"){
      closeLandingpage();
      return;
    }

    // ✅ đúng mã 6 số
    if(value === VIEWER_UNLOCK_CODE){
      location.reload();
      return;
    }

    // ❌ sai
    wrongAttempts++;
    error.textContent = `Invalid code (${wrongAttempts}/3)`;
    input.value = "";
    input.focus();

    // ❌ sai 3 lần → tự đóng
    if(wrongAttempts >= 3){
      closeLandingpage();
    }
  };
}

function closeLandingpage(){
  document.body.innerHTML = `
    <div class="page-closed">
      <h3>Session closed</h3>
      <p>Please scan the QR or NFC card again.</p>
    </div>
  `;
}

// === POPUP STATE MANAGER ===
let activePopup = null;

function closeAllPopups() {
  document.querySelectorAll('.popup').forEach(p => {
    p.classList.remove('active');
  });

  document.body.classList.remove('locked');
  document.querySelector('.overlay')?.classList.remove('active');

  activePopup = null;
}

function openPopup(id) {
  if (activePopup === id) return;

  closeAllPopups();

  const popup = document.getElementById(id);
  if (!popup) return;

  popup.classList.add('active');

  document.body.classList.add('locked');
  document.querySelector('.overlay')?.classList.add('active');

  activePopup = id;
}

document.getElementById('btn-enterprise')?.addEventListener('click', () => {
  openPopup('enterprisePopup');
});

document.getElementById('btn-achievement')
?.addEventListener('click', () => {

  achIndex = 0;
  updateAchievementWheel();

  openPopup('achievementPopup');

});

document.getElementById('btn-qrcode')?.addEventListener('click', () => {

  currentIndex = 0;
  updateWheel();

/* xoá  panels.forEach((p,i)=>{
    p.classList.toggle("active", i === 0);
  }); xoá */

  document.querySelectorAll(".qr-slider").forEach(slider=>{
    loadQRSlider(slider);
  });

  openPopup('qrPopup');

  if (typeof window.loadDynamicQR === "function") {
    window.loadDynamicQR();
  }
});

document.getElementById('btn-chat')?.addEventListener('click', () => {
  if(document.getElementById('chatPopup')){
    openPopup('chatPopup');
  }
});

document.querySelector('.overlay')?.addEventListener('click', closeAllPopups);

document.querySelectorAll('.popup .close').forEach(btn => {
  btn.addEventListener('click', closeAllPopups);
});

window.openQR = () => {

  currentIndex = 0;
  updateWheel();

  /* xoá panels.forEach((p,i)=>{
    p.classList.toggle("active", i === 0);
  }); xoá */

  document.querySelectorAll(".qr-slider").forEach(slider=>{
    loadQRSlider(slider);
  });

  // 👇 QUAN TRỌNG
  openPopup("qrPopup");

  if (typeof window.loadDynamicQR === "function") {
    window.loadDynamicQR();
  }
};


window.openWebsite = () => window.open("https://blh.vn","_blank");

window.downloadVCF = ()=>{
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
