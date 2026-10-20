// 1. Configuração do dotenv (Lê o arquivo local .env OU as variáveis do Railway)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 2. Puxando as variáveis (funciona local e no Railway)
const GLADEPAY_URL = process.env.GATEWAY_BASE_URL || 'https://app.gladepay.com.br/v1';
const TOKEN = process.env.GATEWAY_API_TOKEN;

// ==========================================
// CRIAR DEPÓSITO PIX
// ==========================================
app.post('/api/transacao', async (req, res) => {
  try {
    const { amount } = req.body; // Valor em centavos

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
        callbackUrl: process.env.WEBHOOK_URL || undefined
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[GLADEPAY] Erro:', data);
      return res.status(response.status).json({ error: data.message || 'Erro na GladePay' });
    }

    // Retorna apenas o que o frontend precisa
    res.json({
      hash: data.txId,
      pix_qr_code: data.qrcodeText,
      checkoutUrl: data.checkoutUrl
    });

  } catch (error) {
    console.error('[GLADEPAY] Falha na requisição:', error.message);
    res.status(500).json({ error: 'Erro de conexão com o gateway.' });
  }
});

// ==========================================
// CONSULTAR STATUS
// ==========================================
app.get('/api/transacao/:hash', async (req, res) => {
  try {
    const txId = req.params.hash;
    
    const response = await fetch(`${GLADEPAY_URL}/deposito/${txId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    let statusTraduzido = 'pending';
    if (data.status === 'PAID' || data.status === 'COMPLETED' || data.status === 'APPROVED') {
      statusTraduzido = 'paid';
    } else if (data.status === 'EXPIRED' || data.status === 'CANCELED') {
      statusTraduzido = 'expired';
    }

    res.json({ payment_status: statusTraduzido, original: data });

  } catch (error) {
    console.error('[GLADEPAY] Erro consulta:', error.message);
    res.status(500).json({ error: 'Erro ao verificar status.' });
  }
});

// ==========================================
// INICIAR SERVIDOR (Railway usa a PORT dinâmica)
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ MagnataStore online na porta ${PORT}`);
  console.log(`🔗 Gateway: ${GLADEPAY_URL}`);
});
