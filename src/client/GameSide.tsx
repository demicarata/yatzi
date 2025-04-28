import React from 'react';

interface GameSideProps {
    playerNumber: number | null;
    currentTurn: number | null;
    gameCode: string;
    errorMessage: string;
    diceValues: number[];
    lockedDice: boolean[];
    handleRoll: () => void;
    toggleLockDie: (index: number) => void;
    setGameCode: (code: string) => void;
    joinGame: () => void;
    isHost: boolean;
}

const GameSide: React.FC<GameSideProps> = ({
    playerNumber,
    currentTurn,
    gameCode,
    errorMessage,
    diceValues,
    lockedDice,
    handleRoll,
    toggleLockDie,
    setGameCode,
    joinGame,
}) => {
    return (
        <div className="gameSide">
            {gameCode && (
                <div className="game-code-display">
                    <h3>Game Code: <span>{gameCode}</span></h3>
                    <p>Share this code with a friend to join!</p>
                </div>
            )}
            <div className="joinGameSection">
                <input
                    className="gameCodeInput"
                    type="text"
                    value={gameCode}
                    placeholder="Join another game"
                    onChange={(e) => setGameCode(e.target.value)}
                />
                <button className="joinGameButton" onClick={joinGame}>Join Game</button>
                {errorMessage && <p style={{color: 'red'}}>{errorMessage}</p>}
            </div>
            <div className="turnStatus">
                {playerNumber === currentTurn
                    ? "🎲 Your turn!"
                    : "⏳ Waiting for opponent..."}
            </div>
            <div className="diceContainer">
                {diceValues.map((value, index) => (
                    <div key={index}
                         className={`dice ${lockedDice[index] ? 'locked' : ''}`}
                         onClick={() => toggleLockDie(index)}>
                        <span className="diceNumber">{value !== 0 ? value : ''}</span>
                    </div>
                ))}
            </div>
            <button className="rollButton" onClick={handleRoll}>
                Roll
            </button>
            <div className="abilityContainer">
                Bottom Text
            </div>
        </div>
    );

}

export default GameSide;