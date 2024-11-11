package org.example.Classes;

import org.example.Conexao.Conexao;
import org.example.Conexao.ConexaoMySQL;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ItensPedidosDAO {
    private final Conexao conexao;

    public ItensPedidosDAO() {
        this.conexao = new ConexaoMySQL();
    }

    public String salvarIP(ItensPedidos itensP){
        String sql = "insert into IntensPedido(pedidoID, descricao, quantidade, preco) values (?, ?, ?, ? )";
        try {
            PreparedStatement preparedStatement = conexao.getConnection().prepareStatement(sql);
            addValor(preparedStatement, itensP);
            preparedStatement.executeUpdate();
            return "Feito";
        }
        catch (SQLException e) {
            System.out.println("Erro: " + e.getMessage());
        }
        return null;
    }
    private void addValor(PreparedStatement preparedStatement, ItensPedidos itensP) throws SQLException{
        preparedStatement.setString(1, itensP.getDescricao());
        preparedStatement.setInt(1, itensP.getQuantidade());
        preparedStatement.setDouble(1, itensP.getPreco());
//        preparedStatement.setInt(1, itensP.ge());

    }
    public List<ItensPedidos> listaDositens(){
        String sql = "select * from ItensPedidos";
        List<ItensPedidos> listaDosPedidos = new ArrayList<>();

        try{
            ResultSet result = conexao.getConnection().prepareStatement(sql).executeQuery();
            while(result.next()){
                listaDosPedidos.add(getIP(result));
            }
        }
        catch (SQLException e){
            System.out.println("Erro: " + e.getMessage());
        }
        return listaDosPedidos;
    }
    private  ItensPedidos getIP(ResultSet result) throws SQLException {
        var iP = new ItensPedidos();
        iP.setId(result.getInt("ID"));
        iP.setDescricao(result.getString("ID"));
        iP.setPreco(result.getInt("ID"));
        iP.setQuantidade(result.getInt("ID"));
//        iP.setPedidoID(result.("PedidoID"));
        return iP;
    }
}
