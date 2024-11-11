package org.example.Classes;

public class ItensPedidos {
    private static int geradorID = 1;
    private int id;
    private Pedidos pedidoID;
    private String descricao;
    private int quantidade;
    private double preco;

    public ItensPedidos() {
    }

    public ItensPedidos(String descricao, int quantidade, double preco) {
        this.id = id;;
        this.descricao = descricao;
        this.quantidade = quantidade;
        this.preco = preco;
    }

    public static int getGeradorID() {
        return geradorID;
    }

    public static void setGeradorID(int geradorID) {
        ItensPedidos.geradorID = geradorID;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Pedidos getPedidoID() {
        return pedidoID;
    }

    public void setPedidoID(Pedidos pedidoID) {
        this.pedidoID = pedidoID;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(int quantidade) {
        this.quantidade = quantidade;
    }

    public double getPreco() {
        return preco;
    }

    public void setPreco(double preco) {
        this.preco = preco;
    }

    @Override
    public String toString() {
        {
            String informacao = "Itens Pedidos: \n";
            return informacao += String.format("Id: %d PedidoID: %d Descricao: %s quantidade: %d preco:%.2f", id, pedidoID, descricao, quantidade, preco);
        }
    }
}
