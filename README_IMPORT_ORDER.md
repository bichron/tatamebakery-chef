
Tatame dev01.06 Optimizer Package
=================================

Import order recommended:

1. state.js
2. domcache.js
3. logger.js
4. debounce.js
5. popupengine.js
6. productvalidator.js
7. shopengine.js
8. cartengine.js

Example index.html script order:

<script type="module" src="core/state.js"></script>
<script type="module" src="core/domcache.js"></script>
<script type="module" src="core/logger.js"></script>
<script type="module" src="utils/debounce.js"></script>
<script type="module" src="core/popupengine.js"></script>
<script type="module" src="shop/productvalidator.js"></script>
<script type="module" src="shop/shopengine.js"></script>
<script type="module" src="cart/cartengine.js"></script>

Then integrate gradually into existing script.js logic.
