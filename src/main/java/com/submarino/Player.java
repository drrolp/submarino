package com.submarino;

public class Player {
    private String id;
    private String name;
    private boolean ready;
    private boolean eliminated;
    private GameBoard board;

    public Player() {
    }

    public Player(String id, String name, GameBoard board) {
        this.id = id;
        this.name = name;
        this.board = board;
        this.ready = false;
        this.eliminated = false;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isReady() {
        return ready;
    }

    public void setReady(boolean ready) {
        this.ready = ready;
    }

    public boolean isEliminated() {
        return eliminated;
    }

    public void setEliminated(boolean eliminated) {
        this.eliminated = eliminated;
    }

    public GameBoard getBoard() {
        return board;
    }

    public void setBoard(GameBoard board) {
        this.board = board;
    }
}
