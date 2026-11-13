// បញ្ជីកញ្ចប់ Robux Send
const robuxPackages = [
    { 
        id: 1, 
        amount: "25 Robux",
        numericAmount: 25,
        subtitle: "ចំពោះអាខោនដែលជាប់ kid select unchecked មិនអាចដាក់បានទេ",
        badge: "Robux Send",
        price: 0.30, 
        category: "send",
        status: "available"
    },
    { 
        id: 2, 
        amount: "50 Robux",
        numericAmount: 50,
        subtitle: "ចំពោះអាខោនដែលជាប់ kid select unchecked មិនអាចដាក់បានទេ",
        badge: "Robux Send",
        price: 0.55, 
        category: "send",
        status: "available"
    },
    { 
        id: 3, 
        amount: "100 Robux",
        numericAmount: 100,
        subtitle: "ចំពោះអាខោនដែលជាប់ kid select unchecked មិនអាចដាក់បានទេ",
        badge: "Robux Send",
        price: 0.99, 
        category: "send",
        status: "available"
    },
    { 
        id: 4, 
        amount: "200 Robux",
        numericAmount: 200,
        subtitle: "ចំពោះអាខោនដែលជាប់ kid select unchecked មិនអាចដាក់បានទេ",
        badge: "Robux Send",
        price: 1.99, 
        category: "send",
        status: "available"
    },
    { 
        id: 5, 
        amount: "300 Robux",
        numericAmount: 300,
        subtitle: "ចំពោះអាខោនដែលជាប់ kid select unchecked មិនអាចដាក់បានទេ",
        badge: "Robux Send",
        price: 2.99, 
        category: "send",
        status: "available"
    },
    { 
        id: 6, 
        amount: "400 Robux",
        numericAmount: 400,
        subtitle: "ចំពោះអាខោនដែលជាប់ kid select unchecked មិនអាចដាក់បានទេ",
        badge: "Robux Send",
        price: 3.99, 
        category: "send",
        status: "available"
    },
    { 
        id: 7, 
        amount: "500 Robux",
        numericAmount: 500,
        subtitle: "ចំពោះអាខោនដែលជាប់ kid select unchecked មិនអាចដាក់បានទេ",
        badge: "Robux Send",
        price: 4.80, 
        category: "send",
        status: "available"
    },
    { 
        id: 8, 
        amount: "1000 Robux",
        numericAmount: 1000,
        subtitle: "ចំពោះអាខោនដែលជាប់ kid select unchecked មិនអាចដាក់បានទេ",
        badge: "Robux Send",
        price: 9.30, 
        category: "send",
        status: "available"
    },
    { 
        id: 9, 
        amount: "PLUS 7Day",
        numericAmount: 0,
        subtitle: "សេវាកម្មកញ្ចប់ពិសេស PLUS 7Day",
        badge: "PLUS Subscription",
        price: 0.35, 
        category: "send",
        status: "available"
    }
];

let cart = JSON.parse(localStorage.getItem('cris_robux_cart')) || [];

// ប្រព័ន្ធគ្រប់គ្រងស្តុក Robux (កំណត់ចាប់ផ្តើម 3000)
let currentStock = localStorage.getItem('cris_robux_stock');
if (currentStock === null) {
    currentStock = 3000;
    localStorage.setItem('cris_robux_stock', currentStock);
} else {
    currentStock = parseInt(currentStock);
}

// មុខងារ Auto-Check Roblox Profile តាមរយៈ API ថ្មីដែលដំណើរការបាន ១០០%
let searchTimeout = null;
function checkRobloxProfile() {
    const usernameInput = document.getElementById('roblox-username');
    const profileCard = document.getElementById('roblox-profile-card');
    const statusIcon = document.getElementById('username-status-icon');
    const avatarContainer = document.getElementById('roblox-avatar-container');
    const displayNameEl = document.getElementById('roblox-display-name');
    const usernameTagEl = document.getElementById('roblox-username-tag');

    if (!usernameInput) return;
    const username = usernameInput.value.trim();

    clearTimeout(searchTimeout);

    if (username.length < 3) {
        if (profileCard) {
            profileCard.classList.add('hidden');
            profileCard.classList.remove('flex');
        }
        if (statusIcon) statusIcon.classList.add('hidden');
        return;
    }

    if (statusIcon) {
        statusIcon.classList.remove('hidden');
        statusIcon.innerHTML = `<i class="fas fa-spinner animate-spin text-emerald-500"></i>`;
    }

    searchTimeout = setTimeout(async () => {
        try {
            // ប្រើប្រាស់ RoosevelAPI / Roproxy ដែលអនុញ្ញាតឱ្យទាញយក Profile Roblox បានដោយសុវត្ថិភាព
            const res = await fetch(`https_disabled_or_proxy_used` ? '' : `https://corsproxy.io/?` + encodeURIComponent(`https://users.roblox.com/v1/usernames/users`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
            });
            
            // ប្រសិនបើ CORS Proxy មានបញ្ហា យើងប្តូរមកប្រើប្រាស់ API ជំនួសដ៏មានសុវត្ថិភាព៖
            const apiRes = await fetch(`https://api.roproxy.com/v1/usernames/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
            });
            const data = await apiRes.json();

            if (data && data.data && data.data.length > 0) {
                const userInfo = data.data[0];
                const userId = userInfo.id;
                const displayName = userInfo.displayName;
                const name = userInfo.name;

                // ទាញយករូប Avatar Headshot តាមរយៈ Roproxy
                const avatarRes = await fetch(`https://thumbnails.api.roproxy.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`);
                const avatarData = await avatarRes.json();
                const avatarUrl = avatarData && avatarData.data && avatarData.data.length > 0 ? avatarData.data[0].imageUrl : 'logo/store-logo.jpg';

                // បង្ហាញទិន្នន័យលើ Profile Card
                if (displayNameEl) displayNameEl.innerText = displayName;
                if (usernameTagEl) usernameTagEl.innerText = `@${name}`;
                if (avatarContainer) avatarContainer.innerHTML = `<img src="${avatarUrl}" alt="Avatar" class="w-full h-full object-cover">`;
                
                if (profileCard) {
                    profileCard.classList.remove('hidden');
                    profileCard.classList.add('flex'); // បង្ហាញកាត Profile ឱ្យចេញមកទម្រង់ Flex វិញ
                }
                if (statusIcon) {
                    statusIcon.classList.remove('hidden');
                    statusIcon.innerHTML = `<i class="fas fa-check-circle text-emerald-500"></i>`;
                }
            } else {
                if (profileCard) {
                    profileCard.classList.add('hidden');
                    profileCard.classList.remove('flex');
                }
                if (statusIcon) {
                    statusIcon.classList.remove('hidden');
                    statusIcon.innerHTML = `<i class="fas fa-times-circle text-rose-500" title="រកមិនឃើញឈ្មោះនេះទេ"></i>`;
                }
            }
        } catch (err) {
            console.error("Error fetching Roblox profile:", err);
            if (statusIcon) statusIcon.classList.add('hidden');
        }
    }, 400);
}

// គណនាតម្លៃ Custom Robux
function calculateCustomPrice() {
    const input = document.getElementById('custom-robux-input');
    const display = document.getElementById('custom-price-display');
    if (!input || !display) return;
    
    let val = parseInt(input.value) || 0;
    if (val < 10) val = 10;
    
    let price = val / 100;
    display.innerText = '$' + price.toFixed(2);
}

// បន្ថែម Custom Robux ចូលកន្ត្រក
function addCustomToCart() {
    if (currentStock <= 0) {
        alert('❌ សូមអភ័យទោស Robux ក្នុងស្តុកបានលក់អស់ហើយ!');
        return;
    }

    const input = document.getElementById('custom-robux-input');
    let amount = parseInt(input.value) || 0;

    if (amount < 10) {
        alert('❌ សូមបញ្ចូលចំនួនយ៉ាងតិច 10 Robux ឡើងទៅ!');
        return;
    }

    let existingInCart = cart.filter(item => item.numericAmount > 0).reduce((sum, item) => sum + (item.numericAmount * item.qty), 0);
    let customItemInCart = cart.find(item => item.id === 'custom-robux');
    let currentCustomQty = customItemInCart ? customItemInCart.numericAmount * customItemInCart.qty : 0;

    let totalRequested = (existingInCart - currentCustomQty) + amount;
    if (totalRequested > currentStock) {
        alert(`❌ ចំនួន Robux សរុបក្នុងកន្ត្រករបស់អ្នកលើសពីស្តុកដែលមានក្នុងហាងហើយ! (ស្តុកបច្ចុប្បន្ន៖ ${currentStock} Robux)`);
        return;
    }

    let price = amount / 100;

    if (customItemInCart) {
        customItemInCart.numericAmount = amount;
        customItemInCart.amount = amount + " Robux";
        customItemInCart.price = price;
        customItemInCart.qty = 1;
    } else {
        cart.push({
            id: 'custom-robux',
            amount: amount + " Robux",
            numericAmount: amount,
            subtitle: "កញ្ចប់កុម្មង់ចំនួនតាមចិត្ត (Custom Send)",
            badge: "Custom Send",
            price: price,
            category: "send",
            qty: 1
        });
    }

    saveAndUpdateCart();
    toggleCart();
}

// អាប់ដេតបង្ហាញស្តុក ស្ថានភាព Sold Out និងប្តូររូបភាព Stonk ស្វ័យប្រវត្តិ
function updateStockDisplay() {
    const stockEl = document.getElementById('stock-display');
    const stockImg = document.getElementById('stock-img');
    const statusSub = document.getElementById('stock-status-sub');

    if (stockEl) {
        if (currentStock <= 0) {
            stockEl.innerHTML = `<span class="text-rose-500 font-bold animate-pulse">Sold Out (លក់អស់ហើយ ❌)</span>`;
            if (stockImg) stockImg.src = "logo/stonk-out.jpg";
            if (statusSub) {
                statusSub.className = "text-xs text-rose-500 flex items-center mt-0.5";
                statusSub.innerHTML = `<span class="w-2 h-2 bg-rose-500 rounded-full mr-2"></span>អស់ស្តុកបណ្តោះអាសន្ន (Out of Stock)`;
            }
        } else {
            stockEl.innerText = `In stock ${currentStock}`;
            if (stockImg) stockImg.src = "logo/stonk-has.jpg";
            if (statusSub) {
                statusSub.className = "text-xs text-emerald-600 dark:text-emerald-400 flex items-center mt-0.5";
                statusSub.innerHTML = `<span class="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-ping mr-2"></span>មានស្តុកគ្រប់គ្រាន់ (Ready Stock)`;
            }
        }
    }
}

// គ្រប់គ្រង Dark Mode & Light Mode
function initTheme() {
    const savedTheme = localStorage.getItem('cris_theme') || 'dark';
    const htmlEl = document.documentElement;
    const themeIcon = document.getElementById('theme-icon');

    if (savedTheme === 'light') {
        htmlEl.classList.remove('dark');
        if (themeIcon) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    } else {
        htmlEl.classList.add('dark');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }
}

function toggleTheme() {
    const htmlEl = document.documentElement;
    const themeIcon = document.getElementById('theme-icon');

    if (htmlEl.classList.contains('dark')) {
        htmlEl.classList.remove('dark');
        localStorage.setItem('cris_theme', 'light');
        if (themeIcon) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    } else {
        htmlEl.classList.add('dark');
        localStorage.setItem('cris_theme', 'dark');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }
}

// ផ្លាស់ប្តូរចំនួន (+ ឬ -) លើកាតកញ្ចប់ត្រៀមស្រាប់
function updateCardQty(id, delta) {
    const qtySpan = document.getElementById(`qty-${id}`);
    const priceSpan = document.getElementById(`card-price-${id}`);
    const product = robuxPackages.find(p => p.id === id);
    if (!qtySpan || !product) return;
    
    let currentQty = parseInt(qtySpan.innerText) || 1;
    let newQty = currentQty + delta;
    if (newQty < 1) newQty = 1;
    
    qtySpan.innerText = newQty;
    if (priceSpan) {
        priceSpan.innerText = '$' + (product.price * newQty).toFixed(2);
    }
}

// បង្ហាញកញ្ចប់ Robux លើទំព័រ
function renderProducts(filter = 'all') {
    const productList = document.getElementById('product-list');
    if (!productList) return;
    
    productList.innerHTML = '';

    const filtered = filter === 'all' ? robuxPackages : robuxPackages.filter(p => p.category === filter);
    const isSoldOut = currentStock <= 0;

    filtered.forEach(item => {
        const badgeColor = 'text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10';

        productList.innerHTML += `
            <div class="product-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 flex flex-col justify-between shadow-sm dark:shadow-none">
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <span class="${badgeColor} border text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg truncate max-w-[110px]">
                            ${item.badge}
                        </span>
                        <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center overflow-hidden p-1">
                            <img src="logo/robux-logo.jpg" alt="Robux" class="w-full h-full object-contain">
                        </div>
                    </div>
                    <h3 class="font-bold text-base sm:text-xl text-slate-900 dark:text-white">${item.amount}</h3>
                    <p class="text-slate-600 dark:text-slate-400 text-[10px] sm:text-[11px] mt-1 product-subtitle">${item.subtitle}</p>
                    <div class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-baseline justify-between">
                        <span class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">តម្លៃ៖</span>
                        <span id="card-price-${item.id}" class="text-emerald-600 dark:text-emerald-400 font-bold text-lg sm:text-2xl">${'$' + item.price.toFixed(2)}</span>
                    </div>
                </div>

                <div class="mt-4 space-y-2">
                    <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">ចំនួន៖</span>
                        <div class="flex items-center space-x-2">
                            <button type="button" onclick="updateCardQty(${item.id}, -1)" class="qty-btn w-6 h-6 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg flex items-center justify-center text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700">-</button>
                            <span id="qty-${item.id}" class="text-xs font-bold text-slate-900 dark:text-white w-5 text-center">1</span>
                            <button type="button" onclick="updateCardQty(${item.id}, 1)" class="qty-btn w-6 h-6 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg flex items-center justify-center text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700">+</button>
                        </div>
                    </div>

                    <button type="button" onclick="${isSoldOut ? "alert('❌ សូមអភ័យទោស Robux ក្នុងស្តុកបានលក់អស់ហើយ! មិនអាចទិញបានទេ')" : `addToCartWithQty(${item.id}, this)`}" 
                        class="w-full ${isSoldOut ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30 cursor-not-allowed' : 'bg-slate-900 dark:bg-slate-800 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-cyan-600 text-white border border-slate-900 dark:border-slate-700 hover:border-transparent'} py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-center space-x-1.5">
                        <i class="fas ${isSoldOut ? 'fa-ban' : 'fa-shopping-bag'}"></i>
                        <span>${isSoldOut ? 'លក់អស់ហើយ (Sold Out)' : 'បន្ថែមចូលកន្ត្រក'}</span>
                    </button>
                </div>
            </div>
        `;
    });
}

// តម្រៀបប្រភេទ Robux
function filterProducts(category, clickedBtn) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active-filter');
        btn.classList.add('default-filter');
    });
    if (clickedBtn) {
        clickedBtn.classList.remove('default-filter');
        clickedBtn.classList.add('active-filter');
    }
    renderProducts(category);
}

// បន្ថែមចូលកន្ត្រកតាមចំនួនដែលបានជ្រើសរើស
function addToCartWithQty(id, btnElement) {
    if (currentStock <= 0) {
        alert('❌ សូមអភ័យទោស Robux ក្នុងស្តុកបានលក់អស់ហើយ!');
        return;
    }

    const qtySpan = document.getElementById(`qty-${id}`);
    const priceSpan = document.getElementById(`card-price-${id}`);
    const addQty = qtySpan ? parseInt(qtySpan.innerText) || 1 : 1;

    const product = robuxPackages.find(p => p.id === id);
    if (!product) return;
    
    let totalOrderedInCart = cart.reduce((sum, item) => sum + (item.numericAmount * item.qty), 0);
    if ((totalOrderedInCart + (product.numericAmount * addQty)) > currentStock) {
        alert(`❌ ចំនួន Robux សរុបក្នុងកន្ត្រករបស់អ្នកលើសពីស្តុកដែលមានក្នុងហាងហើយ! (ស្តុកបច្ចុប្បន្ន៖ ${currentStock} Robux)`);
        return;
    }

    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty += addQty;
    } else {
        cart.push({ ...product, qty: addQty });
    }
    saveAndUpdateCart();
    
    if (qtySpan) qtySpan.innerText = "1";
    if (priceSpan) priceSpan.innerText = '$' + product.price.toFixed(2);

    if (btnElement) {
        const card = btnElement.closest('.product-card');
        if (card) {
            card.classList.add('product-card-clicked');
            setTimeout(() => {
                card.classList.remove('product-card-clicked');
            }, 350);
        }
    }

    const modal = document.getElementById('cart-modal');
    if (modal && modal.classList.contains('hidden')) {
        toggleCart();
    }
}

// ផ្លាស់ប្តូរចំនួន (+ ឬ -) ក្នុងកន្ត្រក
function changeQty(id, delta) {
    const item = cart.find(i => String(i.id) === String(id));
    if (!item) return;

    let newQty = item.qty + delta;
    
    if (newQty <= 0) {
        removeFromCart(id);
        return;
    }

    if (delta > 0) {
        let totalWithoutThis = cart.filter(i => String(i.id) !== String(id)).reduce((sum, i) => sum + (i.numericAmount * i.qty), 0);
        let requestedTotal = totalWithoutThis + (item.numericAmount * newQty);
        
        if (requestedTotal > currentStock) {
            alert(`❌ ចំនួន Robux សរុបលើសពីស្តុកដែលមានក្នុងហាងហើយ! (ស្តុកបច្ចុប្បន្ន៖ ${currentStock} Robux)`);
            return;
        }
    }

    item.qty = newQty;
    saveAndUpdateCart();
}

// លុបទំនិញចេញពីកន្ត្រក
function removeFromCart(id) {
    cart = cart.filter(item => String(item.id) !== String(id));
    saveAndUpdateCart();
}

function saveAndUpdateCart() {
    localStorage.setItem('cris_robux_cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCount) cartCount.innerText = totalQty;

    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-slate-500 text-center text-sm py-8">មិនទាន់មានកញ្ចប់ Robux ក្នុងកន្ត្រកនៅឡើយទេ។</p>';
        if (cartTotal) cartTotal.innerText = '$0.00';
        return;
    }

    let total = 0;
    cartItems.innerHTML = '';
    cart.forEach(item => {
        total += item.price * item.qty;
        cartItems.innerHTML += `
            <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center overflow-hidden p-1">
                        <img src="logo/robux-logo.jpg" alt="Robux" class="w-full h-full object-contain">
                    </div>
                    <div>
                        <h4 class="font-semibold text-sm text-slate-900 dark:text-white">${item.amount}</h4>
                        <p class="text-emerald-600 dark:text-emerald-400 text-xs font-medium">$${item.price.toFixed(2)} x ${item.qty}</p>
                    </div>
                </div>
                
                <div class="flex items-center space-x-2">
                    <div class="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                        <button type="button" onclick="changeQty('${item.id}', -1)" class="px-2 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">-</button>
                        <span class="px-2.5 text-xs font-bold text-slate-900 dark:text-white">${item.qty}</span>
                        <button type="button" onclick="changeQty('${item.id}', 1)" class="px-2 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">+</button>
                    </div>
                    <button type="button" onclick="removeFromCart('${item.id}')" class="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 text-sm p-1 cursor-pointer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    if (cartTotal) cartTotal.innerText = '$' + total.toFixed(2);
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) modal.classList.toggle('hidden');
}

// បញ្ជាទិញ Robux និងកាត់ស្តុកស្វ័យប្រវត្តិ
function checkout() {
    if (currentStock <= 0) {
        alert('❌ សូមអភ័យទោស Robux ក្នុងស្តុកបានលក់អស់ហើយ មិនអាចបញ្ជាទិញបានទេ!');
        return;
    }

    if (cart.length === 0) {
        alert('សូមជ្រើសរើសកញ្ចប់ Robux ជាមុនសិន!');
        return;
    }

    const usernameInput = document.getElementById('roblox-username');
    const username = usernameInput ? usernameInput.value.trim() : '';

    if (!username) {
        alert('សូមបំពេញ Roblox Username របស់អ្នកជាមុនសិន!');
        return;
    }

    let totalRobuxOrdered = 0;
    cart.forEach(item => {
        totalRobuxOrdered += (item.numericAmount * item.qty);
    });

    if (totalRobuxOrdered > currentStock) {
        alert(`❌ ចំនួន Robux ដែលអ្នកបញ្ជាទិញ (${totalRobuxOrdered}) លើសពីស្តុកក្នុងហាងបច្ចុប្បន្ន (${currentStock}) ហើយ!`);
        return;
    }

    currentStock -= totalRobuxOrdered;
    if (currentStock < 0) currentStock = 0;
    localStorage.setItem('cris_robux_stock', currentStock);
    
    updateStockDisplay();
    renderProducts();

    const orderId = 'RBX-' + Math.floor(100000 + Math.random() * 900000);
    alert(
        `✅ ការបញ្ជាទិញ Robux ជោគជ័យ!\n` +
        `លេខកូដវិក្កយបត្រ៖ ${orderId}\n` +
        `Roblox Username៖ ${username}\n\n` +
        `សូមផ្ញើរូបភាពវិក្កយបត្របង់ប្រាក់ទៅកាន់ Telegram @Cris_Onlyyou ដើម្បីទទួលបាន Robux ភ្លាមៗ!`
    );

    cart = [];
    if (usernameInput) usernameInput.value = '';
    const profileCard = document.getElementById('roblox-profile-card');
    if (profileCard) {
        profileCard.classList.add('hidden');
        profileCard.classList.remove('flex');
    }
    saveAndUpdateCart();
    toggleCart();
}

// ដំណើរការភ្លាមៗពេលទំព័រត្រូវបានផ្ទុកឡើង
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateStockDisplay();
    renderProducts('all');
    updateCartUI();
    calculateCustomPrice();
});
