// ESTADO GLOBAL DA APLICAÇÃO
let state = {
    cart: [],
    deliveryType: 'delivery',
    paymentMethod: 'pix',
    deliveryFee: 7.00,
    minOrder: 20.00,
    activeCategory: 'todos',
    modalItem: null,
    modalQty: 1,
    selectedExtras: []
};

// INICIALIZAÇÃO AO CARREGAR A PÁGINA
window.addEventListener('DOMContentLoaded', () => {
    checkStoreStatus();
    renderProducts();
    updateCartUI();
    loadCustomerData();

    setInterval(checkStoreStatus, 60000);
});

function formatCurrency(val) {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// RENDERIZAR CARDS DOS PRODUTOS
function renderProducts() {
    const lanchesContainer = document.getElementById('lanchesContainer');
    const porcoesContainer = document.getElementById('porcoesContainer');

    if (!lanchesContainer || !porcoesContainer) return;

    lanchesContainer.innerHTML = '';
    porcoesContainer.innerHTML = '';

    PRODUCTS_DB.forEach(product => {
        const cardHTML = createProductCardHTML(product);

        if (product.category === 'lanches') {
            lanchesContainer.innerHTML += cardHTML;
        } else if (product.category === 'porcoes') {
            porcoesContainer.innerHTML += cardHTML;
        }
    });
}

function createProductCardHTML(item) {
    const cartQty = getItemCartQuantity(item.id);
    return `
        <div class="product-card bg-lila-card border border-lila-border rounded-2xl p-3 sm:p-4 flex gap-3 sm:gap-4 hover:border-zinc-700 transition-all cursor-pointer group" onclick="openItemModal('${item.id}')">
            <div class="flex-1 flex flex-col justify-between">
                <div>
                    <h4 class="font-bold text-sm sm:text-base text-zinc-100 group-hover:text-red-400 transition-colors leading-snug">${item.name}</h4>
                    <p class="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">${item.description}</p>
                </div>
                <div class="mt-3 flex items-center justify-between">
                    <span class="font-display font-bold text-base sm:text-lg text-white">${formatCurrency(item.price)}</span>
                    
                    <button onclick="event.stopPropagation(); openItemModal('${item.id}')" class="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-red-950/40">
                        <i class="fa-solid fa-plus text-[10px]"></i>
                        <span>${cartQty > 0 ? `Adicionado (${cartQty})` : 'Adicionar'}</span>
                    </button>
                </div>
            </div>
            <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-lila-bg flex-shrink-0 relative border border-lila-border">
                <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.onerror=null; this.src='${item.fallbackImage}';">
            </div>
        </div>
    `;
}

function filterCategory(cat) {
    state.activeCategory = cat;

    document.querySelectorAll('.category-btn').forEach(btn => {
        if (btn.getAttribute('data-cat') === cat) {
            btn.className = "category-btn active bg-red-600 text-white font-medium text-xs sm:text-sm px-4 py-2 rounded-xl whitespace-nowrap transition-all shadow-lg shadow-red-950/50";
        } else {
            btn.className = "category-btn bg-lila-card hover:bg-zinc-800 text-zinc-300 border border-lila-border font-medium text-xs sm:text-sm px-4 py-2 rounded-xl whitespace-nowrap transition-all";
        }
    });

    const sections = document.querySelectorAll('.menu-section');
    const noResults = document.getElementById('noResultsState');
    if (noResults) noResults.classList.add('hidden');

    if (cat === 'todos') {
        sections.forEach(s => s.classList.remove('hidden'));
    } else {
        sections.forEach(s => {
            if (s.id === `section-${cat}`) {
                s.classList.remove('hidden');
            } else {
                s.classList.add('hidden');
            }
        });
    }
}

function handleSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const clearBtn = document.getElementById('clearSearchBtn');
    const noResults = document.getElementById('noResultsState');

    if (query.length > 0) {
        clearBtn.classList.remove('hidden');
    } else {
        clearBtn.classList.add('hidden');
    }

    let matchesCount = 0;

    document.querySelectorAll('.product-card').forEach(card => {
        const title = card.querySelector('h4').textContent.toLowerCase();
        const desc = card.querySelector('p').textContent.toLowerCase();

        if (title.includes(query) || desc.includes(query)) {
            card.classList.remove('hidden');
            matchesCount++;
        } else {
            card.classList.add('hidden');
        }
    });

    document.querySelectorAll('.menu-section').forEach(sec => {
        const visibleCards = sec.querySelectorAll('.product-card:not(.hidden)');
        if (visibleCards.length === 0 && query.length > 0) {
            sec.classList.add('hidden');
        } else {
            sec.classList.remove('hidden');
        }
    });

    if (matchesCount === 0 && query.length > 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
    }
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    handleSearch();
    filterCategory(state.activeCategory);
}

// MODAL E SELEÇÃO DE ADICIONAIS
function openItemModal(productId) {
    const product = PRODUCTS_DB.find(p => p.id === productId);
    if (!product) return;

    state.modalItem = product;
    state.modalQty = 1;
    state.selectedExtras = [];

    document.getElementById('modalItemTitle').textContent = product.name;
    document.getElementById('modalItemPrice').textContent = formatCurrency(product.price);
    document.getElementById('modalItemDesc').textContent = product.description;

    const imgEl = document.getElementById('modalItemImage');
    imgEl.src = product.image;
    imgEl.onerror = () => { imgEl.src = product.fallbackImage; };

    document.getElementById('modalItemObs').value = '';

    const extrasContainer = document.getElementById('modalExtrasContainer');
    const extrasList = document.getElementById('modalExtrasList');

    if (product.category === 'lanches') {
        extrasContainer.classList.remove('hidden');
        extrasList.innerHTML = EXTRAS_DB.map(extra => `
            <label class="flex items-center justify-between bg-lila-bg p-2.5 rounded-xl border border-lila-border/80 cursor-pointer hover:border-red-600/50 transition-colors">
                <div class="flex items-center gap-2">
                    <input type="checkbox" onchange="toggleExtra('${extra.id}')" class="accent-red-600 w-4 h-4 rounded">
                    <span class="text-xs text-zinc-200">${extra.name}</span>
                </div>
                <span class="text-xs font-bold text-red-500">+ ${formatCurrency(extra.price)}</span>
            </label>
        `).join('');
    } else {
        extrasContainer.classList.add('hidden');
        extrasList.innerHTML = '';
    }

    updateModalPriceDisplay();

    const modal = document.getElementById('itemModal');
    const content = document.getElementById('itemModalContent');
    modal.classList.remove('opacity-0', 'pointer-events-none');
    content.classList.remove('translate-y-8');
}

function toggleExtra(extraId) {
    const extra = EXTRAS_DB.find(e => e.id === extraId);
    if (!extra) return;

    const index = state.selectedExtras.findIndex(e => e.id === extraId);
    if (index > -1) {
        state.selectedExtras.splice(index, 1);
    } else {
        state.selectedExtras.push(extra);
    }

    updateModalPriceDisplay();
}

function closeItemModal() {
    const modal = document.getElementById('itemModal');
    const content = document.getElementById('itemModalContent');
    modal.classList.add('opacity-0', 'pointer-events-none');
    content.classList.add('translate-y-8');
}

function changeModalQty(delta) {
    state.modalQty = Math.max(1, state.modalQty + delta);
    updateModalPriceDisplay();
}

function updateModalPriceDisplay() {
    document.getElementById('modalQtyDisplay').textContent = state.modalQty;
    
    const basePrice = state.modalItem ? state.modalItem.price : 0;
    const extrasPrice = state.selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    const subtotal = (basePrice + extrasPrice) * state.modalQty;

    document.getElementById('modalSubtotalDisplay').textContent = formatCurrency(subtotal);
}

function confirmAddItemModal() {
    if (!state.modalItem) return;

    const obsInput = document.getElementById('modalItemObs').value.trim();
    const extrasText = state.selectedExtras.map(e => e.name).join(', ');
    
    let finalObs = '';
    if (extrasText && obsInput) {
        finalObs = `Adicionais: ${extrasText} | Obs: ${obsInput}`;
    } else if (extrasText) {
        finalObs = `Adicionais: ${extrasText}`;
    } else if (obsInput) {
        finalObs = obsInput;
    }

    const extrasTotal = state.selectedExtras.reduce((sum, e) => sum + e.price, 0);
    const itemPriceWithExtras = state.modalItem.price + extrasTotal;

    addToCart(state.modalItem.id, state.modalQty, finalObs, itemPriceWithExtras);
    closeItemModal();
    showToast(`Adicionado: ${state.modalItem.name}`);
}

// CARRINHO DE COMPRAS E CHECKOUT
function addToCart(productId, qty = 1, obs = '', price = null) {
    const product = PRODUCTS_DB.find(p => p.id === productId);
    if (!product) return;

    const itemPrice = price !== null ? price : product.price;

    state.cart.push({
        id: product.id,
        name: product.name,
        price: itemPrice,
        quantity: qty,
        obs: obs
    });

    updateCartUI();
    renderProducts();
}

function changeCartQty(index, delta) {
    state.cart[index].quantity += delta;
    if (state.cart[index].quantity <= 0) {
        state.cart.splice(index, 1);
    }
    updateCartUI();
    renderProducts();
}

function removeFromCart(index) {
    state.cart.splice(index, 1);
    updateCartUI();
    renderProducts();
}

function clearCart() {
    state.cart = [];
    updateCartUI();
    renderProducts();
    showToast('Sacola esvaziada');
}

function getItemCartQuantity(productId) {
    return state.cart
        .filter(item => item.id === productId)
        .reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartUI() {
    const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = state.deliveryType === 'delivery' ? state.deliveryFee : 0;
    const total = subtotal + deliveryFee;

    document.getElementById('floatingCartCount').textContent = totalCount;
    document.getElementById('cartDrawerBadge').textContent = `${totalCount} itens`;

    const headerBadge = document.getElementById('headerCartBadge');
    if (totalCount > 0) {
        headerBadge.textContent = totalCount;
        headerBadge.classList.remove('hidden');
    } else {
        headerBadge.classList.add('hidden');
    }

    document.getElementById('floatingCartTotal').textContent = formatCurrency(totalCount > 0 ? total : 0);
    document.getElementById('summarySubtotal').textContent = formatCurrency(subtotal);
    document.getElementById('summaryDeliveryFee').textContent = formatCurrency(deliveryFee);
    document.getElementById('summaryTotal').textContent = formatCurrency(total);

    const itemsList = document.getElementById('cartItemsList');
    const emptyState = document.getElementById('emptyCartState');
    const checkoutSection = document.getElementById('checkoutOptionsSection');
    const clearCartBtn = document.getElementById('clearCartBtn');

    if (state.cart.length === 0) {
        itemsList.innerHTML = '';
        emptyState.classList.remove('hidden');
        checkoutSection.classList.add('opacity-40', 'pointer-events-none');
        clearCartBtn.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        checkoutSection.classList.remove('opacity-40', 'pointer-events-none');
        clearCartBtn.classList.remove('hidden');

        itemsList.innerHTML = state.cart.map((item, idx) => `
            <div class="bg-lila-bg p-3 rounded-xl border border-lila-border flex items-center justify-between gap-3">
                <div class="flex-1">
                    <h5 class="text-xs font-bold text-white leading-snug">${item.name}</h5>
                    <span class="text-xs font-display font-semibold text-red-400 block mt-0.5">${formatCurrency(item.price * item.quantity)}</span>
                    ${item.obs ? `<p class="text-[10px] text-zinc-400 mt-1 italic"><i class="fa-regular fa-comment mr-1"></i>${item.obs}</p>` : ''}
                </div>

                <div class="flex items-center gap-1.5 bg-lila-card border border-lila-border p-1 rounded-lg">
                    <button onclick="changeCartQty(${idx}, -1)" class="w-6 h-6 rounded bg-lila-subtle text-zinc-200 hover:bg-zinc-700 flex items-center justify-center text-xs">
                        <i class="fa-solid fa-minus text-[10px]"></i>
                    </button>
                    <span class="w-5 text-center font-bold text-xs text-white">${item.quantity}</span>
                    <button onclick="changeCartQty(${idx}, 1)" class="w-6 h-6 rounded bg-lila-subtle text-zinc-200 hover:bg-zinc-700 flex items-center justify-center text-xs">
                        <i class="fa-solid fa-plus text-[10px]"></i>
                    </button>
                </div>

                <button onclick="removeFromCart(${idx})" class="text-zinc-500 hover:text-red-400 text-xs p-1">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `).join('');
    }

    const minAlert = document.getElementById('minOrderAlert');
    const sendBtn = document.getElementById('sendWhatsAppBtn');
    const minMsg = document.getElementById('minOrderMsg');

    if (subtotal < state.minOrder && state.cart.length > 0) {
        minAlert.classList.remove('hidden');
        const diff = state.minOrder - subtotal;
        minMsg.textContent = `Faltam ${formatCurrency(diff)} para atingir o pedido mínimo de ${formatCurrency(state.minOrder)}.`;
        sendBtn.disabled = true;
    } else if (state.cart.length === 0) {
        minAlert.classList.add('hidden');
        sendBtn.disabled = true;
    } else {
        minAlert.classList.add('hidden');
        sendBtn.disabled = false;
    }
}

function setDeliveryType(type) {
    state.deliveryType = type;
    const btnDelivery = document.getElementById('btnDelivery');
    const btnPickup = document.getElementById('btnPickup');
    const addrForm = document.getElementById('addressFormSection');

    if (type === 'delivery') {
        btnDelivery.className = "delivery-option active bg-red-600/20 border-2 border-red-600 text-white p-3 rounded-xl flex flex-col items-center justify-center text-center transition-all";
        btnPickup.className = "delivery-option bg-lila-bg border border-lila-border text-zinc-400 hover:text-zinc-200 p-3 rounded-xl flex flex-col items-center justify-center text-center transition-all";
        addrForm.classList.remove('hidden');
    } else {
        btnPickup.className = "delivery-option active bg-red-600/20 border-2 border-red-600 text-white p-3 rounded-xl flex flex-col items-center justify-center text-center transition-all";
        btnDelivery.className = "delivery-option bg-lila-bg border border-lila-border text-zinc-400 hover:text-zinc-200 p-3 rounded-xl flex flex-col items-center justify-center text-center transition-all";
        addrForm.classList.add('hidden');
    }

    updateCartUI();
}

function setPaymentMethod(method) {
    state.paymentMethod = method;
    const options = ['pix', 'credit', 'debit', 'cash'];

    options.forEach(m => {
        const el = document.getElementById(`pay${m.charAt(0).toUpperCase() + m.slice(1)}`);
        if (m === method) {
            el.className = "pay-option bg-lila-bg border-2 border-red-600 text-white p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold";
        } else {
            el.className = "pay-option bg-lila-bg border border-lila-border text-zinc-400 p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold";
        }
    });

    const cashChangeSection = document.getElementById('cashChangeSection');
    const pixBox = document.getElementById('pixPaymentBox');
    const cardBox = document.getElementById('cardPaymentBox');

    if (method === 'cash') cashChangeSection.classList.remove('hidden');
    else cashChangeSection.classList.add('hidden');

    if (method === 'pix') pixBox.classList.remove('hidden');
    else pixBox.classList.add('hidden');

    if (method === 'credit' || method === 'debit') cardBox.classList.remove('hidden');
    else cardBox.classList.add('hidden');
}

function toggleCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const content = document.getElementById('cartDrawerContent');

    if (drawer.classList.contains('opacity-0')) {
        drawer.classList.remove('opacity-0', 'pointer-events-none');
        content.classList.remove('translate-x-full');
    } else {
        drawer.classList.add('opacity-0', 'pointer-events-none');
        content.classList.add('translate-x-full');
    }
}

function saveCustomerData() {
    const customer = {
        name: document.getElementById('custName').value.trim(),
        phone: document.getElementById('custPhone').value.trim(),
        street: document.getElementById('addrStreet').value.trim(),
        number: document.getElementById('addrNumber').value.trim(),
        neighborhood: document.getElementById('addrNeighborhood').value.trim(),
        complement: document.getElementById('addrComplement').value.trim()
    };

    localStorage.setItem('lila_hamburguer_customer', JSON.stringify(customer));
    
    const badge = document.getElementById('savedBadge');
    if (badge && (customer.name || customer.street)) {
        badge.classList.remove('hidden');
    }
}

function loadCustomerData() {
    const saved = localStorage.getItem('lila_hamburguer_customer');
    if (!saved) return;

    try {
        const customer = JSON.parse(saved);
        if (customer.name) document.getElementById('custName').value = customer.name;
        if (customer.phone) document.getElementById('custPhone').value = customer.phone;
        if (customer.street) document.getElementById('addrStreet').value = customer.street;
        if (customer.number) document.getElementById('addrNumber').value = customer.number;
        if (customer.neighborhood) document.getElementById('addrNeighborhood').value = customer.neighborhood;
        if (customer.complement) document.getElementById('addrComplement').value = customer.complement;

        const badge = document.getElementById('savedBadge');
        if (badge && (customer.name || customer.street)) {
            badge.classList.remove('hidden');
        }
    } catch (e) {
        console.error('Erro ao carregar dados:', e);
    }
}

function copyPixKey() {
    const pixKey = document.getElementById('pixKeyText').innerText;
    navigator.clipboard.writeText(pixKey).then(() => {
        showToast('Chave PIX copiada!');
    }).catch(() => {
        showToast('Erro ao copiar chave PIX.', 'error');
    });
}

function checkStoreStatus() {
    const now = new Date();
    const day = now.getDay(); 
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const openMinutes = 18 * 60; 
    const closeMinutes = 22 * 60; 

    let isOpen = false;
    let statusMsg = '';
    let heroMsg = '';

    const isOperatingDay = (day === 5 || day === 6 || day === 0);

    if (isOperatingDay) {
        if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
            isOpen = true;
            statusMsg = 'Aberto agora • Fecha às 22:00';
            heroMsg = 'Loja Aberta';
        } else if (currentMinutes < openMinutes) {
            isOpen = false;
            statusMsg = 'Fechado • Abre hoje às 18:00';
            heroMsg = 'Fechado • Abre hoje às 18:00';
        } else {
            isOpen = false;
            statusMsg = 'Fechado • Abre Sex, Sáb e Dom às 18:00';
            heroMsg = 'Fechado • Abre Sex, Sáb e Dom às 18:00';
        }
    } else {
        isOpen = false;
        statusMsg = 'Fechado • Abre Sexta às 18:00';
        heroMsg = 'Fechado • Abre Sexta às 18:00';
    }

    const headerEl = document.getElementById('headerStatus');
    if (headerEl) {
        const dotColor = isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500';
        headerEl.innerHTML = `<span class="w-2 h-2 rounded-full ${dotColor}"></span> ${statusMsg}`;
    }

    const heroEl = document.getElementById('heroStatus');
    if (heroEl) {
        if (isOpen) {
            heroEl.className = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1";
            heroEl.innerHTML = `<i class="fa-solid fa-circle text-[8px]"></i> ${heroMsg}`;
        } else {
            heroEl.className = "bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1";
            heroEl.innerHTML = `<i class="fa-solid fa-circle text-[8px]"></i> ${heroMsg}`;
        }
    }
}

function submitOrderToWhatsApp() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (subtotal < state.minOrder) {
        showToast(`O valor mínimo do pedido é ${formatCurrency(state.minOrder)}`, 'error');
        return;
    }

    if (state.cart.length === 0) {
        showToast('Sua sacola está vazia!', 'error');
        return;
    }

    const custName = document.getElementById('custName').value.trim();
    const custPhone = document.getElementById('custPhone').value.trim();

    if (!custName || !custPhone) {
        showToast('Por favor, preencha seu Nome e Telefone/WhatsApp.', 'error');
        return;
    }

    let addressText = '';
    if (state.deliveryType === 'delivery') {
        const street = document.getElementById('addrStreet').value.trim();
        const number = document.getElementById('addrNumber').value.trim();
        const neighborhood = document.getElementById('addrNeighborhood').value.trim();
        const complement = document.getElementById('addrComplement').value.trim();

        if (!street || !number || !neighborhood) {
            showToast('Preencha os campos obrigatórios do endereço (Rua, Nº e Bairro).', 'error');
            return;
        }

        addressText = `📍 *Endereço de Entrega:*\n${street}, Nº ${number} - Bairro: ${neighborhood}${complement ? ` (${complement})` : ''}`;
    } else {
        addressText = `🛍️ *Opção de Retirada:* Retirar no Balcão da Loja`;
    }

    saveCustomerData();

    let paymentLabel = '';
    if (state.paymentMethod === 'pix') paymentLabel = 'PIX (Chave enviada/Copiada)';
    if (state.paymentMethod === 'credit') paymentLabel = 'Cartão de Crédito (Levar maquininha)';
    if (state.paymentMethod === 'debit') paymentLabel = 'Cartão de Débito (Levar maquininha)';
    if (state.paymentMethod === 'cash') {
        const change = document.getElementById('cashChangeInput').value.trim();
        paymentLabel = `Dinheiro${change ? ` (Troco para: ${change})` : ' (Sem troco)'}`;
    }

    const orderObs = document.getElementById('orderObs').value.trim();
    const deliveryFee = state.deliveryType === 'delivery' ? state.deliveryFee : 0;
    const total = subtotal + deliveryFee;

    let msg = `🍔 *NOVO PEDIDO - LILA HAMBÚRGUER*\n`;
    msg += `-----------------------------------\n\n`;
    msg += `👤 *CLIENTE:* ${custName}\n`;
    msg += `📱 *TELEFONE:* ${custPhone}\n\n`;
    msg += `📋 *ITENS SOLICITADOS:*\n`;

    state.cart.forEach((item, i) => {
        msg += `${i + 1}. *${item.quantity}x* ${item.name} - ${formatCurrency(item.price * item.quantity)}\n`;
        if (item.obs) msg += `   └ _Obs: ${item.obs}_\n`;
    });

    msg += `\n-----------------------------------\n`;
    msg += `💵 *RESUMO DE VALORES:*\n`;
    msg += `Subtotal: ${formatCurrency(subtotal)}\n`;
    if (state.deliveryType === 'delivery') {
        msg += `Taxa de Entrega: ${formatCurrency(deliveryFee)}\n`;
    }
    msg += `*Total Final: ${formatCurrency(total)}*\n`;

    msg += `\n-----------------------------------\n`;
    msg += `${addressText}\n`;
    msg += `💳 *Forma de Pagamento:* ${paymentLabel}\n`;

    if (orderObs) {
        msg += `📝 *Observações do Pedido:* ${orderObs}\n`;
    }

    msg += `\n-----------------------------------\n`;
    msg += `Aguardando a confirmação da hamburgueria. Obrigado! 🙏`;

    const encodedMsg = encodeURIComponent(msg);
    const whatsappNum = '5567999502689';
    const whatsappUrl = `https://wa.me/${whatsappNum}?text=${encodedMsg}`;

    window.open(whatsappUrl, '_blank');
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');

    const bgColor = type === 'error' ? 'bg-red-600' : 'bg-lila-card border border-lila-border';

    toast.className = `${bgColor} text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 transform translate-x-10 opacity-0 transition-all duration-200 pointer-events-auto`;
    toast.innerHTML = `<i class="fa-solid ${type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check text-emerald-400'}"></i> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => toast.classList.remove('translate-x-10', 'opacity-0'), 10);
    setTimeout(() => {
        toast.classList.add('translate-x-10', 'opacity-0');
        setTimeout(() => toast.remove(), 200);
    }, 3000);
}