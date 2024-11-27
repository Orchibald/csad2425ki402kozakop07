#include <Arduino.h>
#include <ArduinoJson.h>
#include <EEPROM.h>

int gameMode = 0; // 0: Player vs AI, 1: AI vs AI, 2: Player vs Player
bool gameOver = false;
char board[9]; // Represents the 3x3 Tic-Tac-Toe board
char currentPlayer; // 'X' or 'O'

#define EEPROM_ADDR_GAME_MODE     0  // 1 byte
#define EEPROM_ADDR_GAME_OVER     1  // 1 byte
#define EEPROM_ADDR_CURRENT_PLAYER 2 // 1 byte
#define EEPROM_ADDR_BOARD         3  // 9 bytes (positions 3-11)

/**
 * @brief Sends a JSON message over Serial.
 * 
 * @param type The type of message (e.g., "info", "error", "result").
 * @param message The message content.
 */
void sendJsonMessage(const char* type, const String& message) {
    StaticJsonDocument<200> doc;
    doc["type"] = type;
    doc["message"] = message;
    serializeJson(doc, Serial);
    Serial.println();
}

/**
 * @brief Initializes the game board and sets the starting player.
 */
void initializeGame() {
    for (int i = 0; i < 9; i++) {
        board[i] = ' '; // Empty spaces
    }
    currentPlayer = 'X'; // X always starts
    gameOver = false;
}

/**
 * @brief Displays the current state of the board.
 */
void displayBoard() {
    String boardState = "";
    for (int i = 0; i < 9; i++) {
        boardState += board[i];
        if ((i + 1) % 3 == 0 && i != 8) {
            boardState += "\n";
        } else if (i != 8) {
            boardState += "|";
        }
    }
    sendJsonMessage("board", boardState);
}

/**
 * @brief Checks if the current player has won the game.
 * 
 * @return True if the current player has won, false otherwise.
 */
bool checkWin() {
    // Winning combinations
    int winCombos[8][3] = {
        {0, 1, 2}, // Row 1
        {3, 4, 5}, // Row 2
        {6, 7, 8}, // Row 3
        {0, 3, 6}, // Column 1
        {1, 4, 7}, // Column 2
        {2, 5, 8}, // Column 3
        {0, 4, 8}, // Diagonal
        {2, 4, 6}  // Diagonal
    };
    for (int i = 0; i < 8; i++) {
        if (board[winCombos[i][0]] == currentPlayer &&
            board[winCombos[i][1]] == currentPlayer &&
            board[winCombos[i][2]] == currentPlayer) {
            return true;
        }
    }
    return false;
}

/**
 * @brief Checks if the game is a draw.
 * 
 * @return True if the game is a draw, false otherwise.
 */
bool checkDraw() {
    for (int i = 0; i < 9; i++) {
        if (board[i] == ' ') {
            return false;
        }
    }
    return true;
}

/**
 * @brief Handles a player's move.
 * 
 * @param position The position (0-8) where the player wants to move.
 */
void handlePlayerMove(int position) {
    if (position < 0 || position > 8) {
        sendJsonMessage("error", "Invalid position.");
        return;
    }
    if (board[position] != ' ') {
        sendJsonMessage("error", "Position already taken.");
        return;
    }
    board[position] = currentPlayer;
    displayBoard();

    if (checkWin()) {
        String resultMessage = String("Player ") + currentPlayer + " wins!";
        sendJsonMessage("result", resultMessage);
        gameOver = true;
    } else if (checkDraw()) {
        sendJsonMessage("result", "It's a draw!");
        gameOver = true;
    } else {
        // Switch player
        currentPlayer = (currentPlayer == 'X') ? 'O' : 'X';
        if ((gameMode == 0 && currentPlayer == 'O') || (gameMode == 1)) {
            handleAIMove();
        } else {
            sendJsonMessage("game_status", String("Player ") + currentPlayer + "'s turn.");
        }
    }
}

/**
 * @brief Handles the AI's move.
 */
void handleAIMove() {
    int position = -1;
    // Simple AI: choose a random available position
    do {
        position = random(9);
    } while (board[position] != ' ');

    board[position] = currentPlayer;
    String aiMoveMessage = String("AI Player ") + currentPlayer + " moved to position " + position;
    sendJsonMessage("ai_move", aiMoveMessage);
    displayBoard();

    if (checkWin()) {
        String resultMessage = String("Player ") + currentPlayer + " wins!";
        sendJsonMessage("result", resultMessage);
        gameOver = true;
    } else if (checkDraw()) {
        sendJsonMessage("result", "It's a draw!");
        gameOver = true;
    } else {
        // Switch player
        currentPlayer = (currentPlayer == 'X') ? 'O' : 'X';
        if (gameMode == 1 && !gameOver) {
            handleAIMove();
        } else {
            sendJsonMessage("game_status", String("Player ") + currentPlayer + "'s turn.");
        }
    }
}

/**
 * @brief Resets the game state.
 */
void resetGame() {
    initializeGame();
    sendJsonMessage("game_status", "Game reset.");
    displayBoard();
    if (gameMode == 1) { // AI vs AI mode: Start the game automatically
        handleAIMove();
    } else if (gameMode == 0 && currentPlayer == 'O') { // If AI starts first
        handleAIMove();
    } else {
        sendJsonMessage("game_status", String("Player ") + currentPlayer + "'s turn.");
    }
}

/**
 * @brief Saves the current game state to EEPROM.
 */
void saveGameState() {
    EEPROM.update(EEPROM_ADDR_GAME_MODE, gameMode);
    EEPROM.update(EEPROM_ADDR_GAME_OVER, gameOver);
    EEPROM.update(EEPROM_ADDR_CURRENT_PLAYER, currentPlayer);

    for (int i = 0; i < 9; i++) {
        EEPROM.update(EEPROM_ADDR_BOARD + i, board[i]);
    }

    sendJsonMessage("info", "Game state saved.");
}

/**
 * @brief Loads the game state from EEPROM.
 */
void loadGameState() {
    gameMode = EEPROM.read(EEPROM_ADDR_GAME_MODE);
    gameOver = EEPROM.read(EEPROM_ADDR_GAME_OVER);
    currentPlayer = EEPROM.read(EEPROM_ADDR_CURRENT_PLAYER);

    for (int i = 0; i < 9; i++) {
        board[i] = EEPROM.read(EEPROM_ADDR_BOARD + i);
    }

    // Send updated game state to the client
    displayBoard();

    if (gameOver) {
        sendJsonMessage("game_status", "Game over. Load a new game or reset.");
    } else {
        sendJsonMessage("game_status", String("Player ") + currentPlayer + "'s turn.");
    }

    sendJsonMessage("info", "Game state loaded.");
}

void setup() {
    Serial.begin(9600);
    randomSeed(analogRead(0)); // Initialize random seed
    initializeGame();
    sendJsonMessage("info", "Tic-Tac-Toe Game Started");
    displayBoard();
    if (gameMode == 1) { // AI vs AI mode: Start the game automatically
        handleAIMove();
    } else {
        sendJsonMessage("game_status", String("Player ") + currentPlayer + "'s turn.");
    }
}

void loop() {
    if (Serial.available() > 0) {
        StaticJsonDocument<200> doc;
        String input = Serial.readStringUntil('\n');
        DeserializationError error = deserializeJson(doc, input);

        if (!error) {
            const char* command = doc["command"];
            if (strcmp(command, "PLAY") == 0 && !gameOver) {
                int position = doc["position"];
                if ((gameMode == 0 && currentPlayer == 'X') || gameMode == 2) {
                    handlePlayerMove(position);
                } else {
                    sendJsonMessage("error", "It's not your turn.");
                }
            } else if (strcmp(command, "RESET") == 0) {
                resetGame();
            } else if (strcmp(command, "MODE") == 0) {
                gameMode = doc["mode"];
                String message = "Game mode set to " + String(gameMode);
                sendJsonMessage("game_mode", message);
                resetGame();
            } else if (strcmp(command, "SAVE") == 0) {
                saveGameState();
            } else if (strcmp(command, "LOAD") == 0) {
                loadGameState();
            }
        }
    }
}
