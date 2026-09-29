// ESTADO GLOBAL DA APLICAÇÃO
let cart = JSON.parse(localStorage.getItem('lila_cart')) || [];
let activeCategory = 'todos';
let deliveryType = 'delivery'; // 'delivery' ou 'pickup'
let paymentMethod = 'pix'; // 'pix', 'credit', 'debit', 'cash'
let currentModalItem = null;
let currentModalQty = 1;

const MIN_ORDER_VALUE = 20.00;
const DELIVERY_FEE = 7.00;

// INICIALIZAÇÃO DA PÁGINA
document.addEventListener('DOMContentLoaded', () => {
    updateStatusBadge();
    renderProducts();
    updateCartUI();
    loadCustomerData();
});

// ATUALIZA STATUS DE FUNCIONAMENTO
function updateStatusBadge() {
    const headerStatus = document.getElementById('headerStatus');
    const heroStatus = document.getElementById('heroStatus');
    const now = new Date();
    const day = now.getDay(); // 0 = Dom, 5 = Sex, 6 = Sáb
    const hour = now.getHours();

    const isOpen = (day === 0 || day === 5 || day === 6) && (hour >= 18 && hour < 22);

    const statusHTML = isOpen 
        ? `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span class="text-emerald-400 font-bold">Aberto Agora</span>`
        : `<span class="w-2 h-2 rounded-full bg-red-500"></span><span class="text-red-400 font-bold">Fechado</span>`;

    if (headerStatus) headerStatus.innerHTML = statusHTML;
    if (heroStatus) {
        heroStatus.innerHTML = statusHTML;
        heroStatus.className = `text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${isOpen ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`;
    }
}

// RENDERIZAÇÃO DOS PRODUTOS NO CARDÁPIO
function renderProducts(query = '') {
    const lanchesContainer = document.getElementById('lanchesContainer');
    const porcoesContainer = document.getElementById('porcoesContainer');
    const sectionLanches = document.getElementById('section-lanches');
    const sectionPorcoes = document.getElementById('section-porcoes');
    const noResultsState = document.getElementById('noResultsState');

    if (!lanchesContainer || !porcoesContainer) return;

    lanchesContainer.innerHTML = '';
    porcoesContainer.innerHTML = '';

    const searchTerm = query.toLowerCase().trim();

    let countLanches = 0;
    let countPorcoes = 0;

    PRODUCTS.forEach(product => {
        const matchesCategory = (activeCategory === 'todos' || product.category === activeCategory);
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                              product.description.toLowerCase().includes(searchTerm);

        if (matchesCategory && matchesSearch) {
            const cardHTML = createProductCardHTML(product);
            if (product.category === 'lanches') {
                lanchesContainer.innerHTML += cardHTML;
                countLanches++;
            } else if (product.category === 'porcoes') {
                porcoesContainer.innerHTML += cardHTML;
                countPorcoes++;
            }
        }
    });

    // Exibição de seções
    sectionLanches.style.display = (countLanches > 0 && (activeCategory === 'todos' || activeCategory === 'lanches')) ? 'block' : 'none';
    sectionPorcoes.style.display = (countPorcoes > 0 && (activeCategory === 'todos' || activeCategory === 'porcoes')) ? 'block' : 'none';

    // Estado vazio
    if (countLanches === 0 && countPorcoes === 0) {
        noResultsState.classList.remove('hidden');
    } else {
        noResultsState.classList.add('hidden');
    }
}

// CRIA O CARD HTML DE CADA PRODUTO
function createProductCardHTML(product) {
    const formattedPrice = product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return `
        <div class="bg-lila-card border border-lila-border rounded-2xl p-3.5 flex gap-3.5 hover:border-red-600/50 transition-all cursor-pointer group" onclick="openItemModal('${product.id}')">
            <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-lila-bg overflow-hidden flex-shrink-0 relative border border-lila-border">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.onerror=null; this.src='assets/img/logo.jpeg';">
            </div>
            <div class="flex-1 flex flex-col justify-between">
                <div>
                    <h4 class="font-display font-bold text-sm sm:text-base text-white group-hover:text-red-500 transition-colors">${product.name}</h4>
                    <p class="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">${product.description}</p>
                </div>
                <div class="flex items-center justify-between mt-2 pt-2 border-t border-lila-border/50">
                    <span class="font-display font-bold text-sm sm:text-base text-red-500">${formattedPrice}</span>
                    <button class="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-md transition-colors">
                        <i class="fa-solid fa-plus text-[10px]"></i> Adicionar
                    </button>
                </div>
            </div>
        </div>
    `;
}

// FILTRO DE CATEGORIAS
function filterCategory(cat) {
    activeCategory = cat;
    document.querySelectorAll('.category-btn').forEach(btn => {
        if (btn.dataset.cat === cat) {
            btn.className = "category-btn active bg-red-600 text-white font-medium text-xs sm:text-sm px-4 py-2 rounded-xl whitespace-nowrap transition-all shadow-lg shadow-red-950/50";
        } else {
            btn.className = "category-btn bg-lila-card hover:bg-zinc-800 text-zinc-300 border border-lila-border font-medium text-xs sm:text-sm px-4 py-2 rounded-xl whitespace-nowrap transition-all";
        }
    });

    const searchInput = document.getElementById('searchInput');
    renderProducts(searchInput ? searchInput.value : '');
}

// BUSCA
function handleSearch() {
    const input = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearchBtn');
    if (input.value.length > 0) {
        clearBtn.classList.remove('hidden');
    } else {
        clearBtn.classList.add('hidden');
    }
    renderProducts(input.value);
}

function clearSearch() {
    const input = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearchBtn');
    input.value = '';
    clearBtn.classList.add('hidden');
    renderProducts('');
}

// MODAL DO PRODUTO
function openItemModal(id) {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;

    currentModalItem = product;
    currentModalQty = 1;

    document.getElementById('modalItemImage').src = product.image;
    document.getElementById('modalItemTitle').innerText = product.name;
    document.getElementById('modalItemPrice').innerText = product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('modalItemDesc').innerText = product.description;
    document.getElementById('modalItemObs').value = '';
    document.getElementById('modalQtyDisplay').innerText = '1';

    // Extras
    const extrasContainer = document.getElementById('modalExtrasList');
    extrasContainer.innerHTML = '';

    if (product.extras && product.extras.length > 0) {
        document.getElementById('modalExtrasContainer').classList.remove('hidden');
        product.extras.forEach((extra, idx) => {
            const extraPrice = extra.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            extrasContainer.innerHTML += `
                <label class="flex items-center justify-between p-2.5 rounded-xl bg-lila-bg border border-lila-border cursor-pointer hover:border-red-600/40 transition-colors">
                    <div class="flex items-center gap-2">
                        <input type="checkbox" data-name="${extra.name}" data-price="${extra.price}" onchange="updateModalSubtotal()" class="extra-checkbox w-4 h-4 rounded text-red-600 focus:ring-red-600 bg-lila-card border-lila-border">
                        <span class="text-xs text-zinc-200 font-medium">${extra.name}</span>
                    </div>
                    <span class="text-xs text-zinc-400 font-semibold">+ ${extraPrice}</span>
                </label>
            `;
        });
    } else {
        document.getElementById('modalExtrasContainer').classList.add('hidden');
    }

    updateModalSubtotal();

    const modal = document.getElementById('itemModal');
    modal.classList.remove('opacity-0', 'pointer-events-none');
}

function closeItemModal() {
    const modal = document.getElementById('itemModal');
    modal.classList.add('opacity-0', 'pointer-events-none');
}

function changeModalQty(delta) {
    if (currentModalQty + delta >= 1) {
        currentModalQty += delta;
        document.getElementById('modalQtyDisplay').innerText = currentModalQty;
        updateModalSubtotal();
    }
}

function updateModalSubtotal() {
    if (!currentModalItem) return;

    let total = currentModalItem.price;
    const checkboxes = document.querySelectorAll('.extra-checkbox:checked');
    checkboxes.forEach(cb => {
        total += parseFloat(cb.dataset.price);
    });

    total *= currentModalQty;
    document.getElementById('modalSubtotalDisplay').innerText = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function confirmAddItemModal() {
    if (!currentModalItem) return;

    const selectedExtras = [];
    document.querySelectorAll('.extra-checkbox:checked').forEach(cb => {
        selectedExtras.push({
            name: cb.dataset.name,
            price: parseFloat(cb.dataset.price)
        });
    });

    const obs = document.getElementById('modalItemObs').value.trim();

    const cartItem = {
        cartId: Date.now().toString(),
        id: currentModalItem.id,
        name: currentModalItem.name,
        unitPrice: currentModalItem.price,
        qty: currentModalQty,
        extras: selectedExtras,
        obs: obs
    };

    cart.push(cartItem);
    saveCart();
    updateCartUI();
    closeItemModal();
    showToast('Item adicionado à sacola!');
}

// GERENCIAMENTO DO CARRINHO
function saveCart() {
    localStorage.setItem('lila_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = calculateSubtotal();
    const finalTotal = subtotal + (deliveryType === 'delivery' ? DELIVERY_FEE : 0);

    // Badges
    document.getElementById('headerCartBadge').innerText = totalItems;
    document.getElementById('headerCartBadge').classList.toggle('hidden', totalItems === 0);

    document.getElementById('floatingCartCount').innerText = totalItems;
    document.getElementById('cartDrawerBadge').innerText = `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`;

    // Totais
    const formattedTotal = finalTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formattedSubtotal = subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    document.getElementById('floatingCartTotal').innerText = formattedTotal;
    document.getElementById('summarySubtotal').innerText = formattedSubtotal;
    document.getElementById('summaryDeliveryFee').innerText = deliveryType === 'delivery' ? 'R$ 7,00' : 'Grátis';
    document.getElementById('summaryTotal').innerText = formattedTotal;

    // Alerta de pedido mínimo
    const minAlert = document.getElementById('minOrderAlert');
    const sendBtn = document.getElementById('sendWhatsAppBtn');
    if (subtotal < MIN_ORDER_VALUE && totalItems > 0) {
        minAlert.classList.remove('hidden');
        document.getElementById('minOrderMsg').innerText = `Faltam R$ ${(MIN_ORDER_VALUE - subtotal).toFixed(2).replace('.', ',')} para atingir o valor mínimo.`;
        if (sendBtn) sendBtn.disabled = true;
    } else {
        minAlert.classList.add('hidden');
        if (sendBtn) sendBtn.disabled = totalItems === 0;
    }

    renderCartItems();
}

function calculateSubtotal() {
    return cart.reduce((total, item) => {
        let itemTotal = item.unitPrice;
        if (item.extras) {
            itemTotal += item.extras.reduce((eSum, e) => eSum + e.price, 0);
        }
        return total + (itemTotal * item.qty);
    }, 0);
}

function renderCartItems() {
    const list = document.getElementById('cartItemsList');
    const emptyState = document.getElementById('emptyCartState');

    if (!list) return;

    if (cart.length === 0) {
        list.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    list.innerHTML = '';

    cart.forEach(item => {
        let extrasTotal = item.extras ? item.extras.reduce((s, e) => s + e.price, 0) : 0;
        let itemPriceSum = (item.unitPrice + extrasTotal) * item.qty;
        let extrasNames = item.extras && item.extras.length > 0 
            ? item.extras.map(e => `+ ${e.name}`).join(', ') 
            : '';

        list.innerHTML += `
            <div class="bg-lila-bg border border-lila-border rounded-xl p-3 flex flex-col gap-2">
                <div class="flex items-start justify-between gap-2">
                    <div>
                        <h5 class="text-xs font-bold text-white font-display">${item.name}</h5>
                        ${extrasNames ? `<p class="text-[10px] text-red-400 mt-0.5">${extrasNames}</p>` : ''}
                        ${item.obs ? `<p class="text-[10px] text-zinc-500 italic mt-0.5">Obs: "${item.obs}"</p>` : ''}
                    </div>
                    <button onclick="removeCartItem('${item.cartId}')" class="text-zinc-500 hover:text-red-400 text-xs transition-colors p-1">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
                <div class="flex items-center justify-between pt-1 border-t border-lila-border/50">
                    <div class="flex items-center bg-lila-card border border-lila-border rounded-lg p-0.5">
                        <button onclick="updateCartItemQty('${item.cartId}', -1)" class="w-6 h-6 text-xs text-zinc-300 hover:text-white flex items-center justify-center">-</button>
                        <span class="w-6 text-center text-xs font-bold text-white">${item.qty}</span>
                        <button onclick="updateCartItemQty('${item.cartId}', 1)" class="w-6 h-6 text-xs text-zinc-300 hover:text-white flex items-center justify-center">+</button>
                    </div>
                    <span class="text-xs font-bold text-red-500 font-display">${itemPriceSum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
            </div>
        `;
    });
}

function updateCartItemQty(cartId, delta) {
    const item = cart.find(i => i.cartId === cartId);
    if (item) {
        if (item.qty + delta <= 0) {
            removeCartItem(cartId);
        } else {
            item.qty += delta;
            saveCart();
            updateCartUI();
        }
    }
}

function removeCartItem(cartId) {
    cart = cart.filter(i => i.cartId !== cartId);
    saveCart();
    updateCartUI();
}

function clearCart() {
    if (cart.length === 0) return;
    if (confirm('Deseja realmente esvaziar sua sacola?')) {
        cart = [];
        saveCart();
        updateCartUI();
    }
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

// CONFIGURAÇÃO DE ENTREGA E PAGAMENTO
function setDeliveryType(type) {
    deliveryType = type;
    const btnDelivery = document.getElementById('btnDelivery');
    const btnPickup = document.getElementById('btnPickup');
    const addrSection = document.getElementById('addressFormSection');

    if (type === 'delivery') {
        btnDelivery.className = "delivery-option active bg-red-600/20 border-2 border-red-600 text-white p-3 rounded-xl flex flex-col items-center justify-center text-center transition-all";
        btnPickup.className = "delivery-option bg-lila-bg border border-lila-border text-zinc-400 hover:text-zinc-200 p-3 rounded-xl flex flex-col items-center justify-center text-center transition-all";
        addrSection.classList.remove('hidden');
    } else {
        btnPickup.className = "delivery-option active bg-red-600/20 border-2 border-red-600 text-white p-3 rounded-xl flex flex-col items-center justify-center text-center transition-all";
        btnDelivery.className = "delivery-option bg-lila-bg border border-lila-border text-zinc-400 hover:text-zinc-200 p-3 rounded-xl flex flex-col items-center justify-center text-center transition-all";
        addrSection.classList.add('hidden');
    }

    updateCartUI();
}

function setPaymentMethod(method) {
    paymentMethod = method;
    const btns = {
        pix: document.getElementById('payPix'),
        credit: document.getElementById('payCredit'),
        debit: document.getElementById('payDebit'),
        cash: document.getElementById('payCash')
    };

    Object.keys(btns).forEach(m => {
        if (m === method) {
            btns[m].className = "pay-option bg-lila-bg border-2 border-red-600 text-white p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold";
        } else {
            btns[m].className = "pay-option bg-lila-bg border border-lila-border text-zinc-400 p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold";
        }
    });

    document.getElementById('pixPaymentBox').classList.toggle('hidden', method !== 'pix');
    document.getElementById('cardPaymentBox').classList.toggle('hidden', method !== 'credit' && method !== 'debit');
    document.getElementById('cashChangeSection').classList.toggle('hidden', method !== 'cash');
}

function copyPixKey() {
    const key = document.getElementById('pixKeyText').innerText;
    navigator.clipboard.writeText(key).then(() => {
        showToast('Chave PIX copiada para a área de transferência!');
    });
}

// PERSISTÊNCIA DOS DADOS DO CLIENTE
function saveCustomerData() {
    const data = {
        name: document.getElementById('custName').value,
        phone: document.getElementById('custPhone').value,
        street: document.getElementById('addrStreet').value,
        number: document.getElementById('addrNumber').value,
        neighborhood: document.getElementById('addrNeighborhood').value,
        complement: document.getElementById('addrComplement').value
    };
    localStorage.setItem('lila_customer', JSON.stringify(data));
    document.getElementById('savedBadge').classList.remove('hidden');
}

function loadCustomerData() {
    const saved = localStorage.getItem('lila_customer');
    if (saved) {
        const data = JSON.parse(saved);
        if (data.name) document.getElementById('custName').value = data.name;
        if (data.phone) document.getElementById('custPhone').value = data.phone;
        if (data.street) document.getElementById('addrStreet').value = data.street;
        if (data.number) document.getElementById('addrNumber').value = data.number;
        if (data.neighborhood) document.getElementById('addrNeighborhood').value = data.neighborhood;
        if (data.complement) document.getElementById('addrComplement').value = data.complement;
        document.getElementById('savedBadge').classList.remove('hidden');
    }
}

// ENVIO DO PEDIDO VIA WHATSAPP
function submitOrderToWhatsApp() {
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();

    if (!name || !phone) {
        alert('Por favor, informe seu Nome e WhatsApp.');
        return;
    }

    if (deliveryType === 'delivery') {
        const street = document.getElementById('addrStreet').value.trim();
        const number = document.getElementById('addrNumber').value.trim();
        const neighborhood = document.getElementById('addrNeighborhood').value.trim();

        if (!street || !number || !neighborhood) {
            alert('Por favor, preencha os campos de endereço de entrega.');
            return;
        }
    }

    const subtotal = calculateSubtotal();
    if (subtotal < MIN_ORDER_VALUE) {
        alert(`O pedido mínimo é de R$ ${MIN_ORDER_VALUE.toFixed(2).replace('.', ',')}.`);
        return;
    }

    let msg = `🍔 *NOVO PEDIDO - LILA HAMBÚRGUER*\n\n`;
    msg += `👤 *Cliente:* ${name}\n`;
    msg += `📱 *Telefone:* ${phone}\n\n`;

    msg += `📍 *Forma de Entrega:* ${deliveryType === 'delivery' ? 'Entrega em Domicílio' : 'Retirada no Balcão'}\n`;

    if (deliveryType === 'delivery') {
        msg += `🏠 *Endereço:* ${document.getElementById('addrStreet').value}, Nº ${document.getElementById('addrNumber').value}\n`;
        msg += `🏙️ *Bairro:* ${document.getElementById('addrNeighborhood').value}\n`;
        if (document.getElementById('addrComplement').value) {
            msg += `🧩 *Comp.:* ${document.getElementById('addrComplement').value}\n`;
        }
    }
    msg += `\n------------------------------\n`;
    msg += `🛒 *ITENS DO PEDIDO:*\n\n`;

    cart.forEach(item => {
        let extrasTotal = item.extras ? item.extras.reduce((s, e) => s + e.price, 0) : 0;
        let itemSum = (item.unitPrice + extrasTotal) * item.qty;
        msg += `• *${item.qty}x ${item.name}* - R$ ${itemSum.toFixed(2).replace('.', ',')}\n`;
        if (item.extras && item.extras.length > 0) {
            item.extras.forEach(e => {
                msg += `   └ Adicional: ${e.name} (+R$ ${e.price.toFixed(2).replace('.', ',')})\n`;
            });
        }
        if (item.obs) {
            msg += `   └ Obs: ${item.obs}\n`;
        }
    });

    const deliveryFee = deliveryType === 'delivery' ? DELIVERY_FEE : 0;
    const finalTotal = subtotal + deliveryFee;

    msg += `\n------------------------------\n`;
    msg += `💵 *Subtotal:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    msg += `🛵 *Taxa de Entrega:* R$ ${deliveryFee.toFixed(2).replace('.', ',')}\n`;
    msg += `💰 *TOTAL FINAL:* R$ ${finalTotal.toFixed(2).replace('.', ',')}\n\n`;

    const payLabels = {
        pix: 'PIX (Chave WhatsApp)',
        credit: 'Cartão de Crédito (na entrega)',
        debit: 'Cartão de Débito (na entrega)',
        cash: 'Dinheiro'
    };

    msg += `💳 *Forma de Pagamento:* ${payLabels[paymentMethod]}\n`;

    if (paymentMethod === 'cash') {
        const change = document.getElementById('cashChangeInput').value.trim();
        if (change) msg += `🪙 *Troco para:* ${change}\n`;
    }

    const orderObs = document.getElementById('orderObs').value.trim();
    if (orderObs) {
        msg += `📝 *Observação do Pedido:* ${orderObs}\n`;
    }

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/5567999502689?text=${encoded}`, '_blank');
}

// TOAST FLOATING NOTIFICATION
function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'bg-red-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 transform translate-y-2 opacity-0 transition-all duration-300';
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
        toast.classList.add('opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}