const produtos = {
  1: { titulo: "VIRADA DE SALDO 1K", preco: 60.00, estoque: 10, categoria: "viradas", descricao: "De uma consul de 1K extraia de R$700 a R$800." },
  2: { titulo: "VIRADA DE SALDO 1.5K", preco: 90.00, estoque: 8, categoria: "viradas", descricao: "De uma consul de 1.5K extraia de R$1.100 a R$1.200." },
  3: { titulo: "VIRADA DE SALDO 2K", preco: 120.00, estoque: 6, categoria: "viradas", descricao: "De uma consul de 2K extraia de R$1.500 a R$1.600." },
  4: { titulo: "VIRADA DE SALDO 2.5K", preco: 150.00, estoque: 4, categoria: "viradas", descricao: "De uma consul de 2.5K extraia de R$1.900 a R$2.000." },
  5: { titulo: "VIRADA DE SALDO 3K", preco: 180.00, estoque: 2, categoria: "viradas", descricao: "De uma consul de 3K extraia de R$2.300 a R$2.400." },
  6: { titulo: "CURSO DO 7 ATUALIZADO 2026", preco: 75.00, estoque: 2, categoria: "cursos", descricao: "Curso exclusivo para iniciantes e veteranos." },
  7: { titulo: "REEMBOLSO PIX", preco: 114.90, estoque: 3, categoria: "cursos", descricao: "Receba reembolso via MED do Banco Central." },
  8: { titulo: "SISTEMA DE OBITO", preco: 114.90, estoque: 3, categoria: "cursos", descricao: "Coloque golpistas em obito via CADSUS." },
  9: { titulo: "ESQUEMA FREE FIRE", preco: 20.00, estoque: 100, categoria: "cursos", descricao: "Obtenha diamantes ilimitados no FF." },
  10: { titulo: "ATESTADO MEDICO", preco: 19.90, estoque: 3, categoria: "cursos", descricao: "Atestado editavel para faltar escola/trabalho." },
  11: { titulo: "CC Standard", preco: 30.00, estoque: 10, categoria: "cc", descricao: "Garantia de live e debito. Saldo min 100." },
  12: { titulo: "CC Gold", preco: 50.00, estoque: 7, categoria: "cc", descricao: "Garantia de live e debito. Saldo min 100." },
  13: { titulo: "CC Platinum", preco: 50.00, estoque: 9, categoria: "cc", descricao: "Garantia de live e debito. Saldo min 100." },
  14: { titulo: "CC Black", preco: 80.00, estoque: 11, categoria: "cc", descricao: "Garantia de live e debito. Saldo min 100." },
  15: { titulo: "CONSULTAVEL 600", preco: 74.90, estoque: 1, categoria: "consultaveis", descricao: "Limite de 600 masculina." },
  16: { titulo: "CONSULTAVEL 1.5K", preco: 100.00, estoque: 1, categoria: "consultaveis", descricao: "Limite de 1.5K masculina." }
};

let categoriaAtual = 'todos';

function mostrarProdutos() {
  const grid = document.getElementById('produtosGrid');
  grid.innerHTML = '';
  
  Object.entries(produtos).forEach(([id, p]) => {
    if (categoriaAtual !== 'todos' && p.categoria !== categoriaAtual) return;
    
    const card = document.createElement('div');
    card.className = 'produto-card';
    card.innerHTML = `
      <div class="produto-titulo">${p.titulo}</div>
      <div class="produto-descricao">${p.descricao}</div>
      <div class="produto-preco">Por <span>R$ ${p.preco.toFixed(2)}</span></div>
      <div class="produto-estoque">Estoque: ${p.estoque}</div>
      <button class="btn btn-comprar" onclick="adicionarAoCarrinho(${id})">Adicionar</button>
    `;
    grid.appendChild(card);
  });
}

function filtrarCategoria(cat, btn) {
  categoriaAtual = cat;
  document.querySelectorAll('.categoria-btn').forEach(b => b.classList.remove('ativo'));
  btn.classList.add('ativo');
  mostrarProdutos();
}
