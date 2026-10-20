async function gerarPix() {
    if (carrinho.length === 0) return alert('Carrinho vazio!');

    const totalCentavos = Math.round(calcularTotal() * 100);
    
    // Pega os valores (se estiverem vazios, envia string vazia e o servidor resolve)
    const nomeDigitado = document.getElementById('clienteNome')?.value || '';
    const emailDigitado = document.getElementById('clienteEmail')?.value || '';

    document.getElementById('pagamentoConteudo').innerHTML = '<div class="loading"></div>';
    abrirModal('modalPagamento');

    try {
        const response = await fetch('/api/transacao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: totalCentavos, name: nomeDigitado, email: emailDigitado })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro ao gerar PIX');

        let qrCodeUrl = data.qrCodeUrl;
        if (!qrCodeUrl) {
           qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data.pix_qr_code)}`;
        }

        document.getElementById('pagamentoConteudo').innerHTML = `
            <div class="qr-code">
                <img src="${qrCodeUrl}" alt="QR Code PIX">
            </div>
            <div class="pix-code">
                <p>Código PIX (Copia e Cola):</p>
                <div class="codigo" id="codigoPix">${data.pix_qr_code}</div>
                <button class="copiar-btn" onclick="copiarPix()">📋 Copiar Código</button>
            </div>
            <div class="mensagem sucesso">
                ✅ Pagamento gerado com sucesso!<br>ID: ${data.hash}
            </div>
            <button class="btn btn-comprar" onclick="verificarPagamento('${data.hash}')" style="margin-bottom: 10px;">
                🔄 Verificar Pagamento
            </button>
            ${data.checkoutUrl ? `<a href="${data.checkoutUrl}" target="_blank" class="btn btn-comprar" style="display:block;text-align:center;text-decoration:none;background:#2b2d31;color:#00ff88;">💳 Pagar via Checkout</a>` : ''}
        `;
    } catch (error) {
        document.getElementById('pagamentoConteudo').innerHTML = `
            <div class="mensagem erro">❌ Erro: ${error.message}</div>
            <button class="btn btn-comprar" onclick="gerarPix()">🔄 Tentar Novamente</button>
        `;
    }
}

async function verificarPagamento(hash) {
    try {
        const res = await fetch(`/api/transacao/${hash}`);
        const data = await res.json();
        const status = data.payment_status;

        let mensagem = '', cor = '';
        if (status === 'paid') {
            mensagem = '✅ Pagamento CONFIRMADO! Seu produto será entregue em instantes.';
            cor = 'sucesso';
            carrinho = [];
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            atualizarCarrinhoCount();
        } else if (status === 'pending') {
            mensagem = '⏳ Pagamento PENDENTE. Aguarde a confirmação.';
        } else if (status === 'expired') {
            mensagem = '⏰ Pagamento EXPIRADO. Gere um novo.';
            cor = 'erro';
        } else {
            mensagem = `Status: ${status}`;
        }

        document.getElementById('pagamentoConteudo').innerHTML += `<div class="mensagem ${cor}">${mensagem}</div>`;
    } catch (e) {
        alert('Erro ao verificar: ' + e.message);
    }
}

function copiarPix() {
    const codigo = document.getElementById('codigoPix').textContent;
    navigator.clipboard.writeText(codigo).then(() => alert('Código PIX copiado!'));
}
