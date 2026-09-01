package com.submarino;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class GameBoardTest {

    @Test
    void shouldCreateBoardWithSelectedSize() {
        GameBoard board = new GameBoard(7);

        assertEquals(7, board.getSize());
        assertEquals(7, board.getCells().length);
    }

    @Test
    void shouldRegisterAttackResultsOnShipAndWater() {
        GameBoard board = new GameBoard(5);
        board.placeShip(0, 0);
        board.placeShip(0, 1);

        assertEquals("hit", board.attack(0, 0));
        assertEquals("miss", board.attack(2, 2));
        assertFalse(board.isAllShipsDestroyed());
    }

    @Test
    void shouldDetectWhenAllShipsAreDestroyed() {
        GameBoard board = new GameBoard(3);
        board.placeShip(1, 1);

        assertEquals("hit", board.attack(1, 1));
        assertTrue(board.isAllShipsDestroyed());
    }
}
