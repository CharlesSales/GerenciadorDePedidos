package org.example.Classes;

public class Estoque {
    private static int geradorID;
    private int ID;
    private String nome;
    private int quantidade;
    private int unidade;

    public Estoque() {
    }

    public Estoque(String nome, int quantidade, int unidade) {
        this.ID = geradorID++;
        this.nome = nome;
        this.quantidade = quantidade;
        this.unidade = unidade;
    }

    public static int getGeradorID() {
        return geradorID;
    }

    public static void setGeradorID(int geradorID) {
        Estoque.geradorID = geradorID;
    }

    public int getID() {
        return ID;
    }

    public void setID(int ID) {
        this.ID = ID;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(int quantidade) {
        this.quantidade = quantidade;
    }

    public int getUnidade() {
        return unidade;
    }

    public void setUnidade(int unidade) {
        this.unidade = unidade;
    }

    @Override
    public String toString() {
        String informacao = "Estoque: \n";
        return informacao += String.format("ID - %d Nome - %s Quantidade - %d Unidade - %d", ID, nome, quantidade, unidade);
    }
}