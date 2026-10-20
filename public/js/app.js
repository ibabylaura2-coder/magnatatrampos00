function abrirModal(id) { 
  document.getElementById(id).style.display = 'flex'; 
}

function fecharModal(id) { 
  document.getElementById(id).style.display = 'none'; 
}

function abrirModalCarrinho() { 
  mostrarCarrinho(); 
  abrirModal('modalCarrinho'); 
}

window.onclick = (e) => { 
  if (e.target.classList.contains('modal')) {
    e.target.style.display = 'none'; 
  }
};

document.addEventListener('DOMContentLoaded', () => {
  mostrarProdutos();
  atualizarCarrinhoCount();
});
