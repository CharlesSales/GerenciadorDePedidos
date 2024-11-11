package org.example.Classes;

public class Pedidos {
    private static int geradorID = 1;
    private int id;
    private Mesa mesaID;
    private Funcionarios funcionarioID;
    private String data;
    private String status;

    public Pedidos() {
    }

    public Pedidos(int id, Mesa mesaID, Funcionarios funcionarioID, String data, String status) {
        this.id = id;
        this.mesaID = mesaID;
        this.funcionarioID = funcionarioID;
        this.data = data;
        this.status = status;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Mesa getMesaID() {
        return mesaID;
    }

    public void setMesaID(Mesa mesaID) {
        this.mesaID = mesaID;
    }

    public Funcionarios getFuncionarioID() {
        return funcionarioID;
    }

    public void setFuncionarioID(Funcionarios funcionarioID) {
        this.funcionarioID = funcionarioID;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        {
            String informacao = "Pedidos: \n";
            return informacao += String.format("Id: %d MesaID: %d FuncionarioID: %d Data: %s Status do pedido: %s", id, mesaID, funcionarioID,data, status);
        }
    }
}
