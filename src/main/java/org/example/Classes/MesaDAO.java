package org.example.Classes;

import org.example.Conexao.Conexao;
import org.example.Conexao.ConexaoMySQL;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;


public class MesaDAO {
    private final Conexao conexao;


    public MesaDAO() {
        this.conexao = new ConexaoMySQL();
    }

    public void criarFuncionario(){

    }
    public String salvarMesa(Mesa mesa){
        String sql = "insert into Mesa(status) values (? )";
        try {
            PreparedStatement preparedStatement = conexao.getConnection().prepareStatement(sql);
            addValor(preparedStatement, mesa);
            preparedStatement.executeUpdate();
            return "Feito";
        }
        catch (SQLException e) {
            System.out.println("Erro: " + e.getMessage());
        }
        return null;
    }
    private void addValor(PreparedStatement preparedStatement, Mesa mesa) throws SQLException{
        preparedStatement.setString(1, mesa.getStatus());

    }
    public List<Mesa> listaDeMesas(){
        String sql = "select * from mesa";
        List<Mesa> listaDeMesas = new ArrayList<>();

        try{
            ResultSet result = conexao.getConnection().prepareStatement(sql).executeQuery();
            while(result.next()){
                listaDeMesas.add(getMesas(result));
            }
        }
        catch (SQLException e){
            System.out.println("Erro: " + e.getMessage());
        }
        return listaDeMesas;
    }
    private  Mesa getMesas(ResultSet result) throws SQLException {
        var mesa = new Mesa();
        mesa.setId(result.getInt("ID"));
        mesa.setStatus(result.getString("Status"));
        return mesa;
    }
}
