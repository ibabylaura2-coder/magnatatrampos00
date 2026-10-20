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

// Fecha modal clicando fora
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) event.target.style.display = 'none';
};

document.addEventListener('DOMContentLoaded', () => {
    mostrarProdutos();
    atualizarCarrinhoCount();
});
