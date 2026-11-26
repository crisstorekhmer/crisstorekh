const robuxPackages = [
    { id: 3, amount: "100 Robux", numericAmount: 100, subtitle: "ចំពោះអាខោនដែលជាប់ kid select unchecked មិនអាចដាក់បានទេ", badge: "Robux Send", price: 0.99, category: "send" },
    { id: 4, amount: "200 Robux", numericAmount: 200, subtitle: "ចំពោះអាខោនដែលជាប់ kid select unchecked មិនអាចដាក់បានទេ", badge: "Robux Send", price: 1.99, category: "send" },
    { id: 5, amount: "300 Robux", numericAmount: 300, subtitle: "ចំពោះអាខោនដែលជាប់ kid select unchecked មិនអាចដាក់បានទេ", badge: "Robux Send", price: 2.99, category: "send" },
    { id: 6, amount: "400 Robux", numericAmount: 400, subtitle: "ចំពោះអាខោនដែលជាប់ kid select unchecked មិនអាចដាក់បានទេ", badge: "Robux Send", price: 3.99, category: "send" },
    { id: 7, amount: "500 Robux", numericAmount: 500, subtitle: "ចំពោះអាខោនដែលជាប់ kid select unchecked មិនអាចដាក់បានទេ", badge: "Robux Send", price: 4.80, category: "send" },
    { id: 8, amount: "1000 Robux", numericAmount: 1000, subtitle: "ចំពោះអាខោនដែលជាប់ kid select unchecked មិនអាចដាក់បានទេ", badge: "Robux Send", price: 9.30, category: "send" }
];

/* ================= TELEGRAM BOT CONFIG ================= */
const TELEGRAM_BOT_TOKEN = "9285272509:AAHSHHNGzqd86JuPbt7G4HHJgPxHq3ioaxw";
const TELEGRAM_ADMIN_CHAT_ID = "8011652186";

function base64ToBlob(base64Data) {
    const parts = base64Data.split(";base64,");
    const mimeType = parts[0]?.split(":")[1] || "image/jpeg";
    const byteCharacters = atob(parts[1] || "");
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: mimeType });
}

async function sendOrderToTelegramBot(receipt) {
    if (
        !TELEGRAM_BOT_TOKEN ||
        TELEGRAM_BOT_TOKEN.includes("ដាក់_BOT_TOKEN") ||
        !TELEGRAM_ADMIN_CHAT_ID ||
        TELEGRAM_ADMIN_CHAT_ID.includes("ដាក់_CHAT_ID")
    ) {
        console.warn("មិនទាន់បានកំណត់ TELEGRAM_BOT_TOKEN ឬ TELEGRAM_ADMIN_CHAT_ID ទេ។");
        return;
    }

    const itemsText = receipt.items
        .map(i => `• ${i.amount} x${i.qty} ($${i.subtotal})`)
        .join("\n");

    const caption =
        `🚨 *Order Robux ថ្មី - CRIS STORE*\n` +
        `🧾 លេខកូដ៖ \`${receipt.orderId}\`\n` +
        `🕒 កាលបរិច្ឆេទ៖ ${receipt.date}\n` +
        `👤 Roblox Username៖ *${receipt.username}*\n\n` +
        `📦 *កញ្ចប់ដែលបានទិញ៖*\n${itemsText}\n\n` +
        `💵 *សរុបទឹកប្រាក់៖ $${receipt.total}*`;

    try {
        if (receipt.slipImage && receipt.slipImage.startsWith("data:image/")) {
            const formData = new FormData();
            formData.append("chat_id", TELEGRAM_ADMIN_CHAT_ID);
            formData.append("caption", caption);
            formData.append("parse_mode", "Markdown");
            formData.append("photo", base64ToBlob(receipt.slipImage), `slip-${receipt.orderId}.jpg`);

            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
                method: "POST",
                body: formData
            });
        } else {
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: TELEGRAM_ADMIN_CHAT_ID,
                    text: caption,
                    parse_mode: "Markdown"
                })
            });
        }
    } catch (err) {
        console.error("បរាជ័យក្នុងការផ្ញើសារទៅ Telegram Bot:", err);
    }
}

function safeParseJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
        return fallback;
    }
}

let cart = safeParseJSON('cris_robux_cart', []);
if (!Array.isArray(cart)) cart = [];

let savedReceipts = safeParseJSON('cris_robux_receipts', []);
if (!Array.isArray(savedReceipts)) savedReceipts = [];

let currentViewingReceipt = null;

const INITIAL_ROBUX_STOCK = 10000;
const STOCK_RESET_FLAG = 'cris_robux_stock_10000_set';

let rawStock = parseInt(localStorage.getItem('cris_robux_stock'), 10);
let currentStock = Number.isNaN(rawStock) ? INITIAL_ROBUX_STOCK : rawStock;

if (!localStorage.getItem(STOCK_RESET_FLAG)) {
    currentStock = INITIAL_ROBUX_STOCK;
    localStorage.setItem(STOCK_RESET_FLAG, 'true');
}

localStorage.setItem('cris_robux_stock', String(currentStock));

let currentFilter = 'all';

function updateStockDisplay() {
    const stockEl = document.getElementById('stock-display');
    const stockImg = document.getElementById('stock-img');
    const statusSub = document.getElementById('stock-status-sub');
    if (!stockEl) return;

    if (currentStock <= 0) {
        stockEl.innerHTML = `<span class="text-rose-500 font-bold animate-pulse">Sold Out ❌</span>`;
        if (stockImg) stockImg.src = "logo/stonk-out.jpg";
        if (statusSub) {
            statusSub.className = "text-xs text-rose-500 flex items-center mt-0.5";
            statusSub.innerHTML = `<span class="w-2 h-2 bg-rose-500 rounded-full mr-2"></span>អស់ស្តុកបណ្តោះអាសន្ន`;
        }
    } else {
        stockEl.innerText = `In stock ${currentStock}`;
        if (stockImg) stockImg.src = "logo/stonk-has.jpg";
        if (statusSub) {
            statusSub.className = "text-xs text-emerald-500 flex items-center mt-0.5";
            statusSub.innerHTML = `<span class="w-2 h-2 bg-emerald-500 rounded-full animate-ping mr-2"></span>មានស្តុកគ្រប់គ្រាន់`;
        }
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('cris_theme') || 'dark';
    const htmlEl = document.documentElement;
    const themeIcon = document.getElementById('theme-icon');
    if (savedTheme === 'light') {
        htmlEl.classList.remove('dark');
        if (themeIcon) { themeIcon.classList.remove('fa-sun'); themeIcon.classList.add('fa-moon'); }
    } else {
        htmlEl.classList.add('dark');
        if (themeIcon) { themeIcon.classList.remove('fa-moon'); themeIcon.classList.add('fa-sun'); }
    }
}

function toggleTheme() {
    const htmlEl = document.documentElement;
    const themeIcon = document.getElementById('theme-icon');
    if (htmlEl.classList.contains('dark')) {
        htmlEl.classList.remove('dark');
        localStorage.setItem('cris_theme', 'light');
        if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
    } else {
        htmlEl.classList.add('dark');
        localStorage.setItem('cris_theme', 'dark');
        if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
    }
}

function updateCardQty(id, delta) {
    const qtySpan = document.getElementById(`qty-${id}`);
    const priceSpan = document.getElementById(`card-price-${id}`);
    const product = robuxPackages.find(p => p.id === id);
    if (!qtySpan || !product) return;
    let newQty = (parseInt(qtySpan.innerText, 10) || 1) + delta;
    if (newQty < 1) newQty = 1;
    qtySpan.innerText = newQty;
    if (priceSpan) priceSpan.innerText = '$' + (product.price * newQty).toFixed(2);
}

function renderProducts(filter = currentFilter) {
    currentFilter = filter;
    const productList = document.getElementById('product-list');
    if (!productList) return;

    const filtered = filter === 'all'
        ? robuxPackages
        : robuxPackages.filter(p => p.category === filter);
    const isSoldOut = currentStock <= 0;

    let html = '';
    filtered.forEach(item => {
        const btnClass = isSoldOut
            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30 cursor-not-allowed'
            : 'bg-slate-900 dark:bg-slate-800 hover:bg-red-600 text-white';
        const btnAction = isSoldOut
            ? "alert('❌ លក់អស់ហើយ')"
            : `addToCartWithQty(${item.id}, this)`;
        const iconClass = isSoldOut ? 'fa-ban' : 'fa-shopping-bag';
        const btnLabel = isSoldOut ? 'លក់អស់ហើយ' : 'បន្ថែមចូលកន្ត្រក';

        html += `
            <div class="product-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between shadow-sm">
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-red-600 dark:text-red-400 border border-red-500/30 bg-red-500/10 text-[10px] font-semibold px-2 py-0.5 rounded-lg">${item.badge}</span>
                        <div class="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center p-1">
                            <img src="logo/robux-logo.jpg" alt="Robux" class="w-full h-full object-contain">
                        </div>
                    </div>
                    <h3 class="font-bold text-base sm:text-xl">${item.amount}</h3>
                    <p class="text-slate-500 text-[11px] mt-1 product-subtitle">${item.subtitle}</p>
                    <div class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-baseline justify-between">
                        <span class="text-xs text-slate-500">តម្លៃ៖</span>
                        <span id="card-price-${item.id}" class="text-red-500 font-bold text-lg sm:text-2xl">$${item.price.toFixed(2)}</span>
                    </div>
                </div>
                <div class="mt-4 space-y-2">
                    <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span class="text-xs text-slate-500">ចំនួន៖</span>
                        <div class="flex items-center space-x-2">
                            <button type="button" onclick="updateCardQty(${item.id}, -1)" class="qty-btn w-7 h-7 bg-slate-200 dark:bg-slate-800 rounded-lg text-xs font-bold">-</button>
                            <span id="qty-${item.id}" class="text-xs font-bold w-5 text-center">1</span>
                            <button type="button" onclick="updateCardQty(${item.id}, 1)" class="qty-btn w-7 h-7 bg-slate-200 dark:bg-slate-800 rounded-lg text-xs font-bold">+</button>
                        </div>
                    </div>
                    <button type="button" onclick="${btnAction}" class="w-full ${btnClass} py-2.5 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-center space-x-1.5">
                        <i class="fas ${iconClass}"></i><span>${btnLabel}</span>
                    </button>
                </div>
            </div>
        `;
    });

    productList.innerHTML = html;
}

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

function addToCartWithQty(id, btnElement) {
    if (currentStock <= 0) { alert('❌ Robux ក្នុងស្តុកអស់ហើយ!'); return; }
    const qtySpan = document.getElementById(`qty-${id}`);
    const addQty = qtySpan ? parseInt(qtySpan.innerText, 10) || 1 : 1;
    const product = robuxPackages.find(p => p.id === id);
    if (!product) return;

    let totalOrderedInCart = cart.reduce((sum, item) => sum + (item.numericAmount * item.qty), 0);
    if (totalOrderedInCart + (product.numericAmount * addQty) > currentStock) {
        alert('❌ ចំនួន Robux សរុបក្នុងកន្ត្រកលើសពីស្តុកហើយ!');
        return;
    }

    const existing = cart.find(item => item.id === id);
    if (existing) existing.qty += addQty;
    else cart.push({ ...product, qty: addQty });
    saveAndUpdateCart();

    if (qtySpan) qtySpan.innerText = "1";
    if (btnElement) {
        const card = btnElement.closest('.product-card');
        if (card) {
            card.classList.add('product-card-clicked');
            setTimeout(() => card.classList.remove('product-card-clicked'), 350);
        }
    }
    const cartModal = document.getElementById('cart-modal');
    if (cartModal && cartModal.classList.contains('hidden')) toggleCart();
}

function changeQty(id, delta) {
    const item = cart.find(i => String(i.id) === String(id));
    if (!item) return;
    let newQty = item.qty + delta;
    if (newQty <= 0) { removeFromCart(id); return; }
    item.qty = newQty;
    saveAndUpdateCart();
}

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
    if (cartCount) cartCount.innerText = cart.reduce((sum, item) => sum + item.qty, 0);
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-slate-500 text-center text-sm py-8">មិនទាន់មានកញ្ចប់ Robux ក្នុងកន្ត្រកទេ។</p>';
        if (cartTotal) cartTotal.innerText = '$0.00';
        return;
    }

    let total = 0;
    let html = '';
    cart.forEach(item => {
        total += item.price * item.qty;
        html += `
            <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center p-1">
                        <img src="logo/robux-logo.jpg" alt="Robux" class="w-full h-full object-contain">
                    </div>
                    <div>
                        <h4 class="font-semibold text-xs sm:text-sm">${item.amount}</h4>
                        <p class="text-red-500 text-xs font-medium">$${item.price.toFixed(2)} x ${item.qty}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <div class="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                        <button type="button" onclick="changeQty('${item.id}', -1)" class="px-2.5 py-1 text-xs">-</button>
                        <span class="px-2 text-xs font-bold">${item.qty}</span>
                        <button type="button" onclick="changeQty('${item.id}', 1)" class="px-2.5 py-1 text-xs">+</button>
                    </div>
                    <button type="button" onclick="removeFromCart('${item.id}')" class="text-rose-500 text-sm p-1.5"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    });
    cartItems.innerHTML = html;
    if (cartTotal) cartTotal.innerText = '$' + total.toFixed(2);
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) modal.classList.toggle('hidden');
}

function checkout() {
    if (currentStock <= 0) { alert('❌ ស្តុកអស់ហើយ!'); return; }
    if (cart.length === 0) { alert('សូមជ្រើសរើសកញ្ចប់ Robux មុនសិន!'); return; }
    const usernameEl = document.getElementById('roblox-username');
    const username = usernameEl ? usernameEl.value.trim() : '';
    if (!username) { alert('សូមបំពេញ Roblox Username ជាមុនសិន!'); return; }

    let totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const qrTotalAmount = document.getElementById('qr-total-amount');
    if (qrTotalAmount) qrTotalAmount.innerText = '$' + totalAmount.toFixed(2);

    toggleCart();
    const paymentModal = document.getElementById('payment-modal');
    if (paymentModal) paymentModal.classList.remove('hidden');
}

function previewSlipImage(event) {
    const file = event.target.files[0];
    const placeholder = document.getElementById('slip-upload-placeholder');
    const preview = document.getElementById('slip-uploaded-preview');
    if (file && preview && placeholder) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
            placeholder.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
}

async function verifyPayment() {
    const slipPreview = document.getElementById('slip-uploaded-preview');
    const verifyBtn = document.querySelector('#payment-modal button[onclick="verifyPayment()"]');

    if (!slipPreview || slipPreview.classList.contains('hidden') || !slipPreview.src) {
        alert('⚠️ សូម Upload រូបភាពវិក្កយបត្រ (Slip) នៃការទូទាត់ប្រាក់របស់អ្នកជាមុនសិន!');
        return;
    }

    const originalBtnHTML = verifyBtn ? verifyBtn.innerHTML : '';
    if (verifyBtn) {
        verifyBtn.disabled = true;
        verifyBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-1.5"></i> កំពុងផ្ទៀងផ្ទាត់...`;
    }

    let totalRobuxOrdered = cart.reduce((sum, item) => sum + (item.numericAmount * item.qty), 0);
    let totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    currentStock -= totalRobuxOrdered;
    if (currentStock < 0) currentStock = 0;
    localStorage.setItem('cris_robux_stock', String(currentStock));

    updateStockDisplay();
    renderProducts(currentFilter);

    const orderId = 'RBX-' + Math.floor(100000 + Math.random() * 900000);
    const username = (document.getElementById('roblox-username')?.value || '').trim();
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newReceipt = {
        orderId,
        date: dateStr,
        username,
        items: cart.map(item => ({ amount: item.amount, qty: item.qty, subtotal: (item.price * item.qty).toFixed(2) })),
        total: totalAmount.toFixed(2),
        slipImage: slipPreview.src
    };

    await sendOrderToTelegramBot(newReceipt);

    savedReceipts.unshift(newReceipt);
    localStorage.setItem('cris_robux_receipts', JSON.stringify(savedReceipts));
    updateReceiptsUI();

    if (verifyBtn) {
        verifyBtn.disabled = false;
        verifyBtn.innerHTML = originalBtnHTML;
    }

    document.getElementById('payment-modal')?.classList.add('hidden');
    openReceiptModal(newReceipt);

    cart = [];
    const userInput = document.getElementById('roblox-username');
    if (userInput) userInput.value = '';
    document.getElementById('uploaded-preview')?.classList.add('hidden');
    document.getElementById('upload-placeholder')?.classList.remove('hidden');
    slipPreview.classList.add('hidden');
    document.getElementById('slip-upload-placeholder')?.classList.remove('hidden');
    const slipInput = document.getElementById('slip-image-upload');
    if (slipInput) slipInput.value = '';
    saveAndUpdateCart();
}

function openReceiptModal(receipt) {
    currentViewingReceipt = receipt;
    document.getElementById('rec-order-id').innerText = receipt.orderId;
    document.getElementById('rec-date').innerText = receipt.date;
    document.getElementById('rec-username').innerText = receipt.username;
    document.getElementById('rec-total').innerText = '$' + receipt.total;

    const itemsListEl = document.getElementById('rec-items-list');
    if (itemsListEl) {
        itemsListEl.innerHTML = receipt.items
            .map(item => `<div class="flex justify-between"><span>${item.amount} <strong>x${item.qty}</strong></span><span class="font-semibold">$${item.subtotal}</span></div>`)
            .join('');
    }
    document.getElementById('receipt-modal')?.classList.remove('hidden');
}

function closeReceiptModal() {
    document.getElementById('receipt-modal')?.classList.add('hidden');
}

function downloadReceiptImage() {
    const captureArea = document.getElementById('receipt-capture-area');
    if (!captureArea || typeof html2canvas !== 'function') return;
    html2canvas(captureArea, {
        scale: 2,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff'
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `CrisStore-Receipt-${currentViewingReceipt?.orderId || 'Order'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

function copyReceiptText() {
    if (!currentViewingReceipt) return;
    const itemsSummary = currentViewingReceipt.items.map(i => `- ${i.amount} (x${i.qty}): $${i.subtotal}`).join('\n');
    const text = `🧾 វិក្កយបត្រ CRIS STORE\nលេខកូដ៖ ${currentViewingReceipt.orderId}\nកាលបរិច្ឆេទ៖ ${currentViewingReceipt.date}\nRoblox Username៖ ${currentViewingReceipt.username}\nកញ្ចប់ដែលបានទិញ៖\n${itemsSummary}\nសរុបទឹកប្រាក់៖ $${currentViewingReceipt.total}`;
    navigator.clipboard.writeText(text).then(() => alert('✅ បានចម្លងព័ត៌មានវិក្កយបត្ររួចរាល់!'));
}

function toggleReceiptsModal() {
    document.getElementById('receipts-history-modal')?.classList.toggle('hidden');
    updateReceiptsUI();
}

function updateReceiptsUI() {
    const badge = document.getElementById('receipt-count');
    const container = document.getElementById('receipts-list-container');
    const selectAllContainer = document.getElementById('select-all-container');

    if (badge) {
        badge.innerText = savedReceipts.length;
        badge.classList.toggle('hidden', savedReceipts.length === 0);
    }
    if (!container) return;

    if (savedReceipts.length === 0) {
        if (selectAllContainer) selectAllContainer.classList.add('hidden');
        container.innerHTML = `<div class="text-center py-12 space-y-2"><i class="fas fa-receipt text-3xl text-slate-300 dark:text-slate-700"></i><p class="text-slate-500 text-sm">មិនទាន់មានវិក្កយបត្ររក្សាទុកទេ។</p></div>`;
        return;
    }

    if (selectAllContainer) selectAllContainer.classList.remove('hidden');
    let html = '';
    savedReceipts.forEach((rec, index) => {
        const itemsText = rec.items.map(i => `${i.amount} x${i.qty}`).join(', ');
        html += `
            <div class="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div class="flex items-center justify-between">
                    <label class="flex items-center space-x-2.5 cursor-pointer">
                        <input type="checkbox" class="receipt-checkbox w-4 h-4 rounded text-red-600 focus:ring-red-500 dark:bg-slate-900 dark:border-slate-700" value="${index}" onchange="updateSelectedCount()">
                        <span class="text-xs font-bold font-mono text-cyan-500">${rec.orderId}</span>
                    </label>
                    <span class="text-[10px] text-slate-400">${rec.date}</span>
                </div>
                <div class="flex items-center justify-between text-xs pl-6">
                    <span class="text-slate-500">User: <strong class="text-slate-800 dark:text-white">${rec.username}</strong></span>
                    <span class="font-bold text-red-500">$${rec.total}</span>
                </div>
                <p class="text-[11px] text-slate-400 pl-6 truncate">${itemsText}</p>
                <div class="pt-1 pl-6 flex justify-end">
                    <button onclick="viewSavedReceipt(${index})" class="text-[11px] font-bold text-red-500 hover:underline"><i class="fas fa-eye mr-1"></i> បើកមើលវិក្កយបត្រ</button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
    updateSelectedCount();
}

function toggleSelectAllReceipts(masterCheckbox) {
    document.querySelectorAll('.receipt-checkbox').forEach(cb => cb.checked = masterCheckbox.checked);
    updateSelectedCount();
}

function updateSelectedCount() {
    const count = document.querySelectorAll('.receipt-checkbox:checked').length;
    const label = document.getElementById('selected-count-label');
    if (label) label.innerText = `បានជ្រើសរើស ${count}`;
}

function deleteSelectedReceipts() {
    const checkboxes = document.querySelectorAll('.receipt-checkbox:checked');
    if (checkboxes.length === 0) { alert('⚠️ សូមជ្រើសរើសវិក្កយបត្រដែលចង់លុបជាមុនសិន!'); return; }
    if (confirm(`តើអ្នកពិតជាចង់លុបវិក្កយបត្រចំនួន ${checkboxes.length} ដែលបានជ្រើសរើសមែនទេ?`)) {
        const indicesToDelete = Array.from(checkboxes).map(cb => parseInt(cb.value, 10));
        savedReceipts = savedReceipts.filter((_, index) => !indicesToDelete.includes(index));
        localStorage.setItem('cris_robux_receipts', JSON.stringify(savedReceipts));
        const selectAll = document.getElementById('select-all-receipts');
        if (selectAll) selectAll.checked = false;
        updateReceiptsUI();
    }
}

function viewSavedReceipt(index) {
    const rec = savedReceipts[index];
    if (rec) { toggleReceiptsModal(); openReceiptModal(rec); }
}

/* ================= LIVE CHAT BOT SYSTEM ================= */
let chatInitialized = false;

function toggleLiveChat() {
    const chatWindow = document.getElementById('live-chat-window');
    const toggleIcon = document.getElementById('chat-toggle-icon');
    const unreadBadge = document.getElementById('chat-unread-badge');
    const chatBubble = document.getElementById('chat-bubble');
    if (!chatWindow) return;

    chatWindow.classList.toggle('hidden');
    const isOpen = !chatWindow.classList.contains('hidden');

    if (isOpen) {
        if (toggleIcon) toggleIcon.classList.replace('fa-comment-dots', 'fa-chevron-down');
        if (unreadBadge) unreadBadge.classList.add('hidden');
        if (chatBubble) chatBubble.classList.add('hidden');

        if (!chatInitialized) {
            chatInitialized = true;
            appendBotMessage("សួស្តី! 🎄 ស្វាគមន៍មកកាន់ <strong>Cris Store</strong>។ ជូនពរថ្ងៃបុណ្យណូអែលដ៏រីករាយ! តើខ្ញុំអាចជួយអ្វីអ្នកបានខ្លះអំពីការទិញ Robux?");
        }
        setTimeout(() => document.getElementById('chat-input')?.focus(), 100);
    } else {
        if (toggleIcon) toggleIcon.classList.replace('fa-chevron-down', 'fa-comment-dots');
    }
}

function appendUserMessage(text) {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex flex-col items-end space-y-1';
    msgDiv.innerHTML = `
        <div class="bg-gradient-to-r from-red-600 to-emerald-600 text-white px-3.5 py-2 rounded-2xl rounded-br-sm max-w-[82%] shadow-sm leading-relaxed">
            ${escapeHTML(text)}
        </div>
        <span class="text-[9px] text-slate-400 pr-1">${time}</span>
    `;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

function appendBotMessage(htmlContent) {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    const typingId = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.id = typingId;
    typingDiv.className = 'flex items-center space-x-2';
    typingDiv.innerHTML = `
        <img src="logo/store-logo.jpg" class="w-6 h-6 rounded-full object-cover shrink-0">
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-2xl rounded-bl-sm flex space-x-1">
            <span class="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"></span>
            <span class="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style="animation-delay: 0.15s"></span>
            <span class="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style="animation-delay: 0.3s"></span>
        </div>
    `;
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;

    setTimeout(() => {
        document.getElementById(typingId)?.remove();
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const msgDiv = document.createElement('div');
        msgDiv.className = 'flex items-end space-x-2';
        msgDiv.innerHTML = `
            <img src="logo/store-logo.jpg" class="w-6 h-6 rounded-full object-cover shrink-0 mb-3">
            <div class="flex flex-col items-start space-y-1 max-w-[85%]">
                <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2.5 rounded-2xl rounded-bl-sm shadow-sm leading-relaxed">
                    ${htmlContent}
                </div>
                <span class="text-[9px] text-slate-400 pl-1">${time}</span>
            </div>
        `;
        container.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;
    }, 450);
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag]));
}

function generateBotResponse(rawMsg) {
    const msg = rawMsg.toLowerCase();
    if (msg.includes('តម្លៃ') || msg.includes('price') || msg.includes('robux')) {
        appendBotMessage("សូមជ្រើសរើសកញ្ចប់ត្រៀមស្រាប់នៅផ្នែក <strong>កញ្ចប់ Robux</strong> ខាងលើ ឬចុច +/- ដើម្បីបង្កើនចំនួនកញ្ចប់បាន។");
    } else if (msg.includes('របៀបទិញ') || msg.includes('ទិញ') || msg.includes('buy')) {
        appendBotMessage("១. ជ្រើសរើសកញ្ចប់ចូលកន្ត្រក<br>២. បំពេញ <strong>Roblox Username</strong> (មិនបាច់ប្រាប់ Password ទេ)<br>៣. ស្កេន KHQR បង់ប្រាក់ រួច Upload រូប Slip ដើម្បីបញ្ជាក់។");
    } else if (msg.includes('ស្តុក') || msg.includes('stock')) {
        appendBotMessage(`បច្ចុប្បន្នស្តុក Robux នៅសល់៖ <strong>${currentStock}</strong>`);
    } else {
        appendBotMessage(`សូមទាក់ទង Admin ផ្ទាល់តាម Telegram: <a href="https://t.me/Cris_Onlyyou" target="_blank" class="text-red-500 underline font-semibold">@Cris_Onlyyou</a> ដើម្បីទទួលបានជំនួយរហ័ស។`);
    }
}

function sendQuickReply(topic) {
    appendUserMessage(topic);
    generateBotResponse(topic);
}

function handleChatSubmit(event) {
    event.preventDefault();
    const input = document.getElementById('chat-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    appendUserMessage(text);
    generateBotResponse(text);
}

/* ================= INITIALIZE ON LOAD ================= */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateStockDisplay();
    renderProducts(currentFilter);
    updateCartUI();
    updateReceiptsUI();
});
