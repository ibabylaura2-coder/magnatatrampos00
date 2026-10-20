async function gerarPix() {
  if (carrinho.length === 0) return alert('Carrinho vazio!');
  
  const totalCentavos = Math.round(calcularTotal() * 100);
  const cliente = {
    name: document.getElementById('clienteNome').value,
    email: document.getElementById('clienteEmail').value,
    phone_number: document.getElementById('clienteTelefone').value,
    document: document.getElementById('clienteCPF').value
  };
  
  document.getElementById('pagamentoConteudo').innerHTML = '<p style="text-align:center;padding:20px;">Gerando PIX...</p>';
  abrirModal('modalPagamento');
  
  try {
    const response = await fetch('/api/transacao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: totalCentavos, customer: cliente })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erro ao gerar PIX');
    
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data.pix_qr_code)}`;
    
    document.getElementById('pagamentoConteudo').innerHTML = `
      <div class="qr-code"><img src="${qrCodeUrl}" alt="QR Code"></div>
      <div class="pix-code">
        <p>Código PIX (Copia e Cola):</p>
        <div class="codigo" id="codigoPix">${data.pix_qr_code}</div>
        <button class="copiar-btn" onclick="copiarPix()">Copiar</button>
      </div>
      <button class="btn btn-comprar" onclick="verificarPagamento('${data.hash}')" style="margin-top:15px;">Verificar Pagamento</button>
      ${data.checkoutUrl ? `<a href="${data.checkoutUrl}" target="_blank" style="display:block;text-align:center;margin-top:15px;color:#00ff88;text-decoration:none;">Pagar via Checkout</a>` : ''}
    `;
  } catch (error) {
    document.getElementById('pagamentoConteudo').innerHTML = `<div class="mensagem erro">Erro: ${error.message}</div>`;
  }
}

async function verificarPagamento(hash) {
  try {
    const res = await fetch(`/api/transacao/${hash}`);
    const data = await res.json();
    
    if (data.payment_status === 'paid') {
      alert('Pagamento CONFIRMADO!');
      carrinho = [];
      localStorage.setItem('carrinho', JSON.stringify(carrinho));
      atualizarCarrinhoCount();
      fecharModal('modalPagamento');
    } else if (data.payment_status === 'expired') {
      alert('Pagamento EXPIRADO.');
    } else {
      alert('Pagamento PENDENTE. Aguarde a confirmacao.');
    }
  } catch (e) { 
    alert('Erro ao verificar.'); 
  }
}

function copiarPix() {
  const codigo = document.getElementById('codigoPix').textContent;
  navigator.clipboard.writeText(codigo).then(() => alert('Codigo PIX copiado!'));
}
