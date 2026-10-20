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
    const { amount, name, email } = req.body;

    // 1. Garante valor válido
    const valorInteiro = Math.round(Number(amount));
    if (!valorInteiro || valorInteiro < 100) {
      return res.status(400).json({ error: 'Valor inválido. Mínimo R$ 1,00' });
    }

    // 2. Lida com o Nome (se vazio, usa padrão; se cheio, limpa acentos/emojis)
    let nomeCliente = name ? String(name).trim() : '';
    if (nomeCliente === '') {
      nomeCliente = 'Cliente MagnataStore'; // Nome padrão
    } else {
      nomeCliente = nomeCliente.normalize('NFD').replace(/[\u0300-\u036f]/g, ""); // Tira acentos
      nomeCliente = nomeCliente.replace(/[^a-zA-Z0-9 ]/g, ""); // Tira emojis
      nomeCliente = nomeCliente.substring(0, 50); // Limita tamanho
    }

    // 3. Lida com o E-mail (se vazio ou inválido, usa padrão)
    let emailCliente = email ? String(email).trim() : '';
    if (!emailCliente.includes('@')) {
      emailCliente = 'cliente@magnatastore.com'; // E-mail padrão
    }

    const payload = {
      amountCents: valorInteiro,
      reference: `pedido-${Date.now()}`,
      customerName: nomeCliente,
      customerEmail: emailCliente
    };

    if (process.env.WEBHOOK_URL) {
      payload.callbackUrl = process.env.WEBHOOK_URL;
    }

    const response = await fetch(`${GLADEPAY_URL}/deposito`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[GLADEPAY] Erro:', data);
      return res.status(response.status).json({ 
        error: data.message || data.error || 'Erro na GladePay ao gerar PIX' 
      });
    }

    pagamentos[data.publicId] = { status: 'pending', txId: data.txId };

    res.json({
      hash: data.publicId, 
      pix_qr_code: data.qrCodeText,
      qrCodeUrl: data.qrCodeUrl,
      checkoutUrl: data.checkoutUrl
    });

  } catch (error) {
    console.error('[GLADEPAY] Falha:', error.message);
    res.status(500).json({ error: 'Erro interno de conexão com o gateway.' });
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
    const response = await fetch(`${GLADEPAY_URL}/deposito/status?txId=${idPublico}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Accept': 'application/json' }
    });
    const data = await response.json();
    let statusTraduzido = 'pending';
    if (data.status === 'SETTLED') statusTraduzido = 'paid';
    if (data.status === 'EXPIRED' || data.status === 'CANCELED') statusTraduzido = 'expired';
    if (statusTraduzido === 'paid') pagamentos[idPublico] = { status: 'paid' };
    res.json({ payment_status: statusTraduzido });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar status.' });
  }
});

// ==========================================
// WEBHOOK
// ==========================================
app.post('/webhook', (req, res) => {
  try {
    const data = req.body;
    if (data.id && data.status === 'SETTLED') {
      pagamentos[data.id] = { status: 'paid' };
    }
    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send('Erro');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ MagnataStore online na porta ${PORT}`);
});
