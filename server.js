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

    // Pega o nome do cliente que veio do frontend
    const nomeCliente = customer && customer.name ? customer.name : '';

    const response = await fetch(`${GLADEPAY_URL}/deposito`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amountCents: amount,
        reference: `pedido-${Date.now()}`,
        customerName: nomeCliente,
        callbackUrl: process.env.WEBHOOK_URL || undefined 
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[GLADEPAY] Erro:', data);
      return res.status(response.status).json({ error: data.message || 'Erro na GladePay' });
    }

    // Salva o publicId como chave para consulta
    pagamentos[data.publicId] = { status: 'pending', txId: data.txId };

    res.json({
      hash: data.publicId, 
      pix_qr_code: data.qrCodeText, // NOME CORRETO AGORA
      checkoutUrl: data.checkoutUrl
    });

  } catch (error) {
    console.error('[GLADEPAY] Falha:', error.message);
    res.status(500).json({ error: 'Erro de conexão com o gateway.' });
  }
});

// ==========================================
// CONSULTAR STATUS
// ==========================================
app.get('/api/transacao/:hash', async (req, res) => {
  try {
    const idPublico = req.params.hash;
    
    if (pagamentos[idPublico] && pagamentos[idPublico].status === 'paid') {
      return res.json({ payment_status: 'paid' });
    }

    // A GladePay permite consultar tanto pelo txId quanto pelo publicId
    const response = await fetch(`${GLADEPAY_URL}/deposito/status?txId=${idPublico}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Accept': 'application/json' }
    });

    const data = await response.json();
    
    let statusTraduzido = 'pending';
    // O status de sucesso na GladePay é SETTLED
    if (data.status === 'SETTLED') statusTraduzido = 'paid';
    if (data.status === 'EXPIRED' || data.status === 'CANCELED') statusTraduzido = 'expired';

    if (statusTraduzido === 'paid') pagamentos[idPublico] = { status: 'paid' };

    res.json({ payment_status: statusTraduzido });

  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar status.' });
  }
});

// ==========================================
// WEBHOOK (Aviso automático)
// ==========================================
app.post('/webhook', (req, res) => {
  try {
    const data = req.body;
    console.log('[WEBHOOK RECEBIDO]', data);

    // O ID enviado no webhook é o publicId
    const publicId = data.id;
    
    if (publicId && data.status === 'SETTLED') {
      pagamentos[publicId] = { status: 'paid' };
      console.log(`✅ PIX ${publicId} confirmado via webhook!`);
    }

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
