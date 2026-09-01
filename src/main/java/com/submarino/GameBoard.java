package com.submarino;

import java.util.HashSet;
import java.util.Set;

public class GameBoard {
    private final int size;
    private final String[][] cells;
    private final Set<String> attackedCells = new HashSet<>();
    private int remainingShips;

    public GameBoard(int size) {
        if (size < 3 || size > 20) {
            throw new IllegalArgumentException("El tamaño del tablero debe estar entre 3 y 20.");
        }
        this.size = size;
        this.cells = new String[size][size];
        for (int row = 0; row < size; row++) {
            for (int col = 0; col < size; col++) {
                this.cells[row][col] = "water";
            }
        }
    }

    public int getSize() {
        return size;
    }

    public String[][] getCells() {
        return cells;
    }

    public boolean isAllShipsDestroyed() {
        return remainingShips == 0;
    }

    public int getRemainingShips() {
        return remainingShips;
    }

    public void placeShip(int row, int col) {
        validatePosition(row, col);
        if ("ship".equals(cells[row][col])) {
            return;
        }
        cells[row][col] = "ship";
        remainingShips++;
    }

    public String attack(int row, int col) {
        validatePosition(row, col);
        String key = row + ":" + col;
        if (attackedCells.contains(key)) {
            return "repeated";
        }

        attackedCells.add(key);
        if ("ship".equals(cells[row][col])) {
            remainingShips = Math.max(0, remainingShips - 1);
            return "hit";
        }
        return "miss";
    }

    private void validatePosition(int row, int col) {
        if (row < 0 || row >= size || col < 0 || col >= size) {
            throw new IllegalArgumentException("La posición está fuera del tablero.");
        }
    }
}
