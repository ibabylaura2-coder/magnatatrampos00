const produtos = {
    1: { titulo: "💰 • VIRADA DE SALDO 1K — MAGNATASTORE", preco: 60.00, estoque: 10, categoria: "viradas", descricao: "✅ • A virada é feita assim como especificado no canal de FAQS & EXPLICAÇÃO da MagnataStore.\n\n👨🏻‍💼 • De uma consul de 1K é possível extrair de R$700,00 a R$800,00 REAIS..." },
    2: { titulo: "💰 • VIRADA DE SALDO 1.5K — MAGNATASTORE", preco: 90.00, estoque: 8, categoria: "viradas", descricao: "✅ • A virada é feita assim como especificado...\n\n👨🏻‍💼 • De uma consul de 1.5K é possível extrair de R$1.100,00 a R$1.200,00 REAIS..." },
    3: { titulo: "💰 • VIRADA DE SALDO 2K — MAGNATASTORE", preco: 120.00, estoque: 6, categoria: "viradas", descricao: "✅ • A virada é feita assim como especificado...\n\n👨🏻‍💼 • De uma consul de 2K é possível extrair de R$1.500,00 a R$1.600,00 REAIS..." },
    4: { titulo: "💰 • VIRADA DE SALDO 2.5K — MAGNATASTORE", preco: 150.00, estoque: 4, categoria: "viradas", descricao: "✅ • A virada é feita assim como especificado...\n\n👨🏻‍💼 • De uma consul de 2.5K é possível extrair de R$1.900,00 a R$2.000,00 REAIS..." },
    5: { titulo: "💰 • VIRADA DE SALDO 3K — MAGNATASTORE", preco: 180.00, estoque: 2, categoria: "viradas", descricao: "✅ • A virada é feita assim como especificado...\n\n👨🏻‍💼 • De uma consul de 3K é possível extrair de R$2.300,00 a R$2.400,00 REAIS..." },
    6: { titulo: "📚 • CURSO DO 7 ATUALIZADO 2026", preco: 75.00, estoque: 2, categoria: "cursos", descricao: "CURSO EXCLUSIVO DA MAGNATASTORE PARA INICIANTES...\n🎯 CONTEÚDOS INCLUSOS:\n• COMO SÃO ADQUIRIDAS INFOCO\n• O QUE SÃO BINS\n• COMO FAZER APROVAÇÃO DE COMPRAS..." },
    7: { titulo: "💸 • REEMBOLSO PIX — MAGNATASTORE", preco: 114.90, estoque: 3, categoria: "cursos", descricao: "OBTENHA REEMBOLSO PELO MED\n✅ COM ESSE MÉTODO SERÁ POSSÍVEL RECEBER O REEMBOLSO VIA SISTEMA DE MED DO BANCO CENTRAL..." },
    8: { titulo: "💀 • SISTEMA DE ÓBITO | CADSUS", preco: 114.90, estoque: 3, categoria: "cursos", descricao: "SISTEMA DE ÓBITO | CADSUS\n💀 TOMOU LOTTER DE UM RATO? COM ESSE TRAMPO NÓS COLOCAMOS O GOLPISTA EM ÓBITO..." },
    9: { titulo: "🎮 • ESQUEMA DIMAS FREE FIRE 2026", preco: 20.00, estoque: 100, categoria: "cursos", descricao: "ESQUEMA DIMAS FF 2026\n🎮 COM ESSE MÉTODO VOCÊ SEGUIRÁ O PASSO A PASSO PARA OBTER DIAMANTES ILIMITADOS..." },
    10: { titulo: "🏥 • ATESTADO MÉDICO EDITÁVEL", preco: 19.90, estoque: 3, categoria: "cursos", descricao: "ATESTADO MÉDICO EDITÁVEL\n🏥 COM ESSE ATESTADO MÉDICO VOCÊ PODERÁ FALTAR A ESCOLA, TRABALHO..." },
    11: { titulo: "💳 • CC Standard", preco: 30.00, estoque: 10, categoria: "cc", descricao: "✅ Garantia de live e débito\n✅ Garantia de no mínimo 100 de saldo\n⏱️ Tempo de trocas 5 minutos" },
    12: { titulo: "💳 • CC Gold", preco: 50.00, estoque: 7, categoria: "cc", descricao: "✅ Garantia de live e débito\n✅ Garantia de no mínimo 100 de saldo\n⏱️ Tempo de trocas 5 minutos" },
    13: { titulo: "💳 • CC Platinum", preco: 50.00, estoque: 9, categoria: "cc", descricao: "✅ Garantia de live e débito\n✅ Garantia de no mínimo 100 de saldo\n⏱️ Tempo de trocas 5 minutos" },
    14: { titulo: "💳 • CC Black", preco: 80.00, estoque: 11, categoria: "cc", descricao: "✅ Garantia de live e débito\n✅ Garantia de no mínimo 100 de saldo\n⏱️ Tempo de trocas 5 minutos" },
    15: { titulo: "📄 • CONSULTAVEL 600 DE LIMITE", preco: 74.90, estoque: 1, categoria: "consultaveis", descricao: "💳 CONSULTAVEL COM 600 DE LIMITE MASCULINA.\n🔥 PRONTA PRA QUALQUER TRAMPO..." },
    16: { titulo: "📄 • CONSULTAVEL 1.5K DE LIMITE", preco: 100.00, estoque: 1, categoria: "consultaveis", descricao: "💳 CONSULTAVEL COM 1.5K DE LIMITE MASCULINA.\n🔥 PRONTA PRA QUALQUER TRAMPO..." }
};

let categoriaAtual = 'todos';

function mostrarProdutos() {
    const grid = document.getElementById('produtosGrid');
    grid.innerHTML = '';

    Object.entries(produtos).forEach(([id, produto]) => {
        if (categoriaAtual !== 'todos' && produto.categoria !== categoriaAtual) return;
        const estoqueClass = produto.estoque <= 1 ? 'baixo' : produto.estoque <= 3 ? 'medio' : 'alto';
        const card = document.createElement('div');
        card.className = 'produto-card';
        card.innerHTML = `
            <div class="produto-titulo">${produto.titulo}</div>
            <div class="produto-descricao">${produto.descricao.substring(0, 150)}...</div>
            <div class="produto-preco">Por <span>R$ ${produto.preco.toFixed(2)}</span></div>
            <div class="produto-estoque">📦 Estoque: <span class="${estoqueClass}">${produto.estoque}</span></div>
            <button class="btn btn-comprar" onclick="adicionarAoCarrinho(${id})" ${produto.estoque <= 0 ? 'disabled' : ''}>
                ${produto.estoque <= 0 ? '❌ Esgotado' : '🛒 Adicionar ao Carrinho'}
            </button>
        `;
        grid.appendChild(card);
    });
}

function filtrarCategoria(categoria, btn) {
    categoriaAtual = categoria;
    document.querySelectorAll('.categoria-btn').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    mostrarProdutos();
}
