package org.example.Classes;

import org.example.Conexao.Conexao;
import org.example.Conexao.ConexaoMySQL;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class FuncionariosDAO {
    private final Conexao conexao;

    public FuncionariosDAO() {
        ;this.conexao = new ConexaoMySQL();
    }
    public void criarFuncionario(){

    }
    public String salvarEstoque(Funcionarios func){
        String sql = "insert into Funcionarios(nome, cargo, salario) values (? ,? ,?)";
        try {
            PreparedStatement preparedStatement = conexao.getConnection().prepareStatement(sql);
            addValor(preparedStatement, func);
            preparedStatement.executeUpdate();
            return "Feito";
        }
        catch (SQLException e) {
            System.out.println("Erro: " + e.getMessage());
        }
        return null;
    }
    private void addValor(PreparedStatement preparedStatement, Funcionarios func) throws SQLException{
        preparedStatement.setString(1, func.getNome());
        preparedStatement.setString(2, func.getCargo());
        preparedStatement.setDouble(3, func.getSalario());
    }
    public List<Funcionarios> listaDeFuncionarios(){
        String sql = "select * from Funcionarios";
        List<Funcionarios> listaDeFuncionarios = new ArrayList<>();

        try{
            ResultSet result = conexao.getConnection().prepareStatement(sql).executeQuery();
            while(result.next()){
                listaDeFuncionarios.add(getFuncionario(result));
            }
        }
        catch (SQLException e){
            System.out.println("Erro: " + e.getMessage());
        }
        return listaDeFuncionarios;
    }

    private  Funcionarios getFuncionario(ResultSet result) throws SQLException {
        var func = new Funcionarios();
        func.setId(result.getInt("ID"));
        func.setNome(result.getString("Nome"));
        func.setCargo(result.getString("Cargo"));
        func.setSalario(result.getDouble("Salario"));
        return func;
    }
}
