package com.submarino;

import java.util.ArrayList;
import java.util.List;

public class GameRoom {
    private String code;
    private String hostId;
    private int maxPlayers;
    private int boardSize;
    private final List<Player> players = new ArrayList<>();
    private int currentTurnIndex;
    private boolean started;

    public GameRoom() {
    }

    public GameRoom(String code, String hostId, int boardSize, int maxPlayers) {
        this.code = code;
        this.hostId = hostId;
        this.boardSize = boardSize;
        this.maxPlayers = maxPlayers;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getHostId() {
        return hostId;
    }

    public void setHostId(String hostId) {
        this.hostId = hostId;
    }

    public int getMaxPlayers() {
        return maxPlayers;
    }

    public void setMaxPlayers(int maxPlayers) {
        this.maxPlayers = maxPlayers;
    }

    public int getBoardSize() {
        return boardSize;
    }

    public void setBoardSize(int boardSize) {
        this.boardSize = boardSize;
    }

    public List<Player> getPlayers() {
        return players;
    }

    public boolean addPlayer(Player player) {
        if (players.size() >= maxPlayers) {
            return false;
        }
        players.add(player);
        return true;
    }

    public void startGame() {
        if (!canStart()) {
            throw new IllegalStateException("La sala no puede iniciar con estas condiciones.");
        }
        started = true;
        currentTurnIndex = 0;
    }

    public boolean canStart() {
        return players.size() == maxPlayers && players.stream().allMatch(Player::isReady);
    }

    public Player getCurrentPlayer() {
        if (players.isEmpty()) {
            return null;
        }
        return players.get(currentTurnIndex % players.size());
    }

    public void advanceTurn() {
        if (players.isEmpty()) {
            return;
        }

        int nextIndex = currentTurnIndex;
        for (int i = 0; i < players.size(); i++) {
            nextIndex = (nextIndex + 1) % players.size();
            if (!players.get(nextIndex).isEliminated()) {
                currentTurnIndex = nextIndex;
                return;
            }
        }
    }

    public boolean isStarted() {
        return started;
    }

    public void setStarted(boolean started) {
        this.started = started;
    }
}
