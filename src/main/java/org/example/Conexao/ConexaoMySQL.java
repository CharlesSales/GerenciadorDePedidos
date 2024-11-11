package org.example.Conexao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConexaoMySQL implements Conexao{

    private final String User = "root";
    private final String Senha = "";
    private final String URL = "jdbc:mysql://localhost:3306/gerenciadordetarefas";
    private Connection conn;

    @Override
    public Connection getConnection() throws SQLException {
        if (conn == null) {
            conn = DriverManager.getConnection(URL, User, Senha);
        }
        return conn;
    }
}