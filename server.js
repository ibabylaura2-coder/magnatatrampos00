require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const GLADEPAY_URL = process.env.GATEWAY_BASE_URL || 'https://app.gladepay.com.br/v1';
const TOKEN = process.env.GATEWAY_API_TOKEN;

// Memória temporária para guardar os pagamentos (enquanto o site está online)
const pagamentos = {};

// ==========================================
// CRIAR DEPÓSITO PIX
// ==========================================
app.post('/api/transacao', async (req, res) => {
  try {
    const { amount, customer } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Valor mínimo é R$ 1,00' });
    }

    const response = await fetch(`${GLADEPAY_URL}/deposito`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amountCents: amount,
        reference: `pedido-${Date.now()}`,
        // O webhook é configurado pela variável de ambiente
        callbackUrl: process.env.WEBHOOK_URL || undefined 
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[GLADEPAY] Erro:', data);
      return res.status(response.status).json({ error: data.message || 'Erro na GladePay' });
    }

    // Salva como pendente na memória
    pagamentos[data.txId] = { status: 'pending' };

    res.json({
      hash: data.txId,
      pix_qr_code: data.qrcodeText,
      checkoutUrl: data.checkoutUrl
    });

  } catch (error) {
    console.error('[GLADEPAY] Falha:', error.message);
    res.status(500).json({ error: 'Erro de conexão com o gateway.' });
  }
});

// ==========================================
// CONSULTAR STATUS (Usado pelo botão verificar)
// ==========================================
app.get('/api/transacao/:hash', async (req, res) => {
  try {
    const txId = req.params.hash;
    
    // Se já foi pago via webhook, retorna na hora
    if (pagamentos[txId] && pagamentos[txId].status === 'paid') {
      return res.json({ payment_status: 'paid' });
    }

    // Se não, pergunta pra GladePay
    const response = await fetch(`${GLADEPAY_URL}/deposito/${txId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Accept': 'application/json' }
    });

    const data = await response.json();
    let statusTraduzido = 'pending';
    if (['PAID', 'COMPLETED', 'APPROVED'].includes(data.status)) statusTraduzido = 'paid';
    if (['EXPIRED', 'CANCELED'].includes(data.status)) statusTraduzido = 'expired';

    // Atualiza a memória se descobriu que foi pago
    if (statusTraduzido === 'paid') pagamentos[txId] = { status: 'paid' };

    res.json({ payment_status: statusTraduzido, original: data });

  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar status.' });
  }
});

// ==========================================
// WEBHOOK (Recebe o aviso automático da GladePay)
// ==========================================
app.post('/webhook', (req, res) => {
  try {
    const data = req.body;
    console.log('[WEBHOOK RECEBIDO]', data);

    // A GladePay avisa o ID da transação e o novo status
    const txId = data.txId || data.id;
    const status = data.status;

    if (txId && ['PAID', 'COMPLETED', 'APPROVED'].includes(status)) {
      pagamentos[txId] = { status: 'paid' };
      console.log(`✅ PIX ${txId} confirmado via webhook!`);
    }

    // Sempre responda 200 OK para a GladePay não ficar reenviando
    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).send('Erro');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ MagnataStore online na porta ${PORT}`);
});
