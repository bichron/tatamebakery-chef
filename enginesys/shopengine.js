/* =====================================
   SHOP ENGINE
===================================== */

export const ShopEngine = {

loadProductData: async function(){

  try{

    const res = await fetch("data/product.json?v=" + Date.now());
    const data = await res.json();

    shopData = data.products || [];
    shopGroups = data.groups || [];

    console.log("Products loaded:", shopData);

  }catch(err){

    console.error("Product load error:", err);

  }

},

buildShopUI: function(){

const wheelBox = document.getElementById("shopWheelItems");
const panelBox = document.getElementById("shopPanels");

wheelBox.innerHTML="";
panelBox.innerHTML="";

shopGroups.forEach((g,i)=>{

const item=document.createElement("div");
item.className="wheel-item";

item.innerHTML =
`<span class="wheel-icon">${g.icon || ""}</span>
<span class="wheel-label">${g.name}</span>`;

wheelBox.appendChild(item);

const panel=document.createElement("div");
panel.className="shop-panel";

if(i===0){
panel.classList.add("active");
}

panel.innerHTML =
`<div class="shop-slider" data-group="${g.id}">
<div class="shop-track"></div>
<div class="shop-indicators"></div>
</div>`;

panelBox.appendChild(panel);

});

},

getProductsByGroup: function(group){

return shopData.filter(p => p.group === group);

},

openProduct: function(product){

currentProduct = product.id;

document.getElementById("productName").textContent = product.name;

document.getElementById("productPrice").textContent =
product.price.toLocaleString("vi-VN")+"đ";

document.getElementById("productImage").src = product.image;

const specBox = document.getElementById("productSpec");

if(product.spec){

let html="";

Object.entries(product.spec).forEach(([k,v])=>{
html += `<div>${k}: ${v}</div>`;
});

specBox.innerHTML = html;

}else{

specBox.innerHTML="";

}

updateQtyDisplay();

openPopup("productPopup");

}

}
