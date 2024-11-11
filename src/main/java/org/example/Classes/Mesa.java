package org.example.Classes;

public class Mesa {
    private static int geradorId = 1;
    private int id;
    private String status;

    public Mesa() {
    }

    public Mesa(String status) {
        this.id = geradorId++;
        this.status = status;
    }


    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        String informacao = "Mesas: \n";
        return informacao += String.format("Id: %d Status: %s", id, status);
    }
}
