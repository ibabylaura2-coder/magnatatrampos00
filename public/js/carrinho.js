let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

function atualizarCarrinhoCount() {
    const count = carrinho.reduce((t, i) => t + i.quantidade, 0);
    document.getElementById('carrinhoCount').textContent = count;
}

function adicionarAoCarrinho(id) {
    const produto = produtos[id];
    if (produto.estoque <= 0) return alert('Produto sem estoque!');

    const existente = carrinho.find(i => i.id === id);
    if (existente) existente.quantidade += 1;
    else carrinho.push({ id, titulo: produto.titulo, preco: produto.preco, quantidade: 1 });

    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarCarrinhoCount();
    mostrarMensagem('✅ Produto adicionado ao carrinho!', 'sucesso');
}

function removerDoCarrinho(id) {
    carrinho = carrinho.filter(i => i.id !== id);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarCarrinhoCount();
    mostrarCarrinho();
}

function calcularTotal() {
    return carrinho.reduce((t, i) => t + (i.preco * i.quantidade), 0);
}

function mostrarCarrinho() {
    const conteudo = document.getElementById('carrinhoConteudo');
    if (carrinho.length === 0) {
        conteudo.innerHTML = '<p style="text-align:center;padding:50px;">🛒 Carrinho vazio</p>';
        return;
    }

    let html = '';
    carrinho.forEach(item => {
        html += `
            <div class="carrinho-item">
                <span class="remover-item" onclick="removerDoCarrinho(${item.id})">✖️</span>
                <h4>${item.titulo}</h4>
                <p>Quantidade: ${item.quantidade}</p>
                <p>Preço: R$ ${(item.preco * item.quantidade).toFixed(2)}</p>
            </div>
        `;
    });

    html += `
        <div class="total-carrinho"><strong>Total: R$ ${calcularTotal().toFixed(2)}</strong></div>
        <form id="formCliente">
            <div class="form-group">
                <label>Seu Nome:</label>
                <input type="text" id="clienteNome" placeholder="Digite seu nome" required>
            </div>
        </form>
        <button class="btn btn-comprar" onclick="gerarPix()">💰 Finalizar Compra</button>
    `;
    conteudo.innerHTML = html;
}

function mostrarMensagem(texto, tipo) {
    const msg = document.createElement('div');
    msg.className = `mensagem ${tipo}`;
    msg.textContent = texto;
    Object.assign(msg.style, { position: 'fixed', top: '100px', right: '20px', zIndex: '3000' });
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
}
