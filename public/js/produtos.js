let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

function atualizarCarrinhoCount() {
  const count = carrinho.reduce((t, i) => t + i.quantidade, 0);
  const elemento = document.getElementById('carrinhoCount');
  if (elemento) elemento.textContent = count;
}

function adicionarAoCarrinho(id) {
  const p = produtos[id];
  const ex = carrinho.find(i => i.id === id);
  
  if (ex) ex.quantidade += 1;
  else carrinho.push({ id, titulo: p.titulo, preco: p.preco, quantidade: 1 });
  
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  atualizarCarrinhoCount();
  mostrarMensagem('Produto adicionado ao carrinho!', 'sucesso');
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
  const cont = document.getElementById('carrinhoConteudo');
  if (carrinho.length === 0) { 
    cont.innerHTML = '<p style="padding:20px;text-align:center;">Carrinho vazio</p>'; 
    return; 
  }
  
  let html = '';
  carrinho.forEach(i => {
    html += `
      <div class="carrinho-item">
        <span class="remover-item" onclick="removerDoCarrinho(${i.id})">X</span>
        <h4>${i.titulo}</h4>
        <p>Qtd: ${i.quantidade} | R$ ${(i.preco * i.quantidade).toFixed(2)}</p>
      </div>`;
  });
  
  html += `
    <div class="total-carrinho"><strong>Total: R$ ${calcularTotal().toFixed(2)}</strong></div>
    <form id="formCliente">
      <div class="form-group"><label>Nome:</label><input type="text" id="clienteNome" required></div>
      <div class="form-group"><label>Email:</label><input type="email" id="clienteEmail" required></div>
      <div class="form-group"><label>Telefone:</label><input type="tel" id="clienteTelefone" required></div>
      <div class="form-group"><label>CPF:</label><input type="text" id="clienteCPF" required></div>
    </form>
    <button class="btn btn-comprar" onclick="gerarPix()">Finalizar Compra</button>`;
    
  cont.innerHTML = html;
}

function mostrarMensagem(texto, tipo) {
  const msg = document.createElement('div');
  msg.className = `mensagem ${tipo}`;
  msg.textContent = texto;
  msg.style.position = 'fixed';
  msg.style.top = '100px';
  msg.style.right = '20px';
  msg.style.zIndex = '3000';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}
