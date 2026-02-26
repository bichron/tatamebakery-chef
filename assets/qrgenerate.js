/* ===========================
   GENERATE QR CODE (UTILITY)
=========================== */
function generateQRCode(text) {
  const box = document.getElementById("qrCode");
  if (!box) {
    console.warn("#qrCode not found");
    return;
  }

  box.innerHTML = "";

  const img = document.createElement("img");
  img.alt = "QR Code";
  img.width = 200;
  img.height = 200;

  img.src =
    "https://api.qrserver.com/v1/create-qr-code/?" +
    "size=200x200&data=" +
    encodeURIComponent(text);

  box.appendChild(img);
}

/* ===========================
   DYNAMIC QR TOKEN CONFIG
=========================== */
const QR_TOKEN_KEY = "dynamicQRToken";
const QR_EXPIRE_TIME = 10 * 60 * 1000;
const API_CREATE_TOKEN = "/api/qr/create";

/* Đọc token local */
function getLocalQRToken() {
  const raw = localStorage.getItem(QR_TOKEN_KEY);
  if (!raw) return null;

  const data = JSON.parse(raw);
  if (Date.now() > data.expiresAt) {
    localStorage.removeItem(QR_TOKEN_KEY);
    return null;
  }
  return data;
}

/* Gọi server tạo token mới */
async function createNewQRToken() {
  try {
    const res = await fetch(API_CREATE_TOKEN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerId: "chrispham" })
    });

    if (!res.ok) throw new Error("API error");

    const data = await res.json();
    localStorage.setItem(QR_TOKEN_KEY, JSON.stringify(data));
    return data;

  } catch (err) {
    console.warn("QR API failed – fallback used", err);

    // fallback KHÔNG làm treo page
    return {
      token: "STATIC-FALLBACK",
      expiresAt: Date.now() + QR_EXPIRE_TIME
    };
  }
}

/* ===========================
   LOAD DYNAMIC QR (ENTRY)
=========================== */
async function loadDynamicQR() {
  let tokenData = getLocalQRToken();
  if (!tokenData) {
    tokenData = await createNewQRToken();
  }

  const qrUrl = `${location.origin}/t/${tokenData.token}`;

  if (typeof window.generateQRCode === "function") {
    window.generateQRCode(qrUrl);
  } else {
    console.warn("generateQRCode() not found – skipped");
  }
}