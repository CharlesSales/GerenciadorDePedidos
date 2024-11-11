package org.example;

import org.example.Classes.ItensPedidos;
import org.example.Classes.ItensPedidosDAO;
import org.example.Conexao.Conexao;
import org.example.Conexao.ConexaoMySQL;

public class Main {
    public static void main(String[] args) {
        Conexao conn = new ConexaoMySQL();
        var ip = new ItensPedidosDAO();

        var ip1 = new ItensPedidos("", 0, 1.00);
    }
}