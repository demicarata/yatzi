import React, {useEffect, useState} from 'react';
import { io } from 'socket.io-client';
import './App.css';
import GameSide from './GameSide';
import ScoreSide from './ScoreSide';
import {checkUpperBonus, getAllPossibleScores} from "./scoreUtils";


const socket = io("http://localhost:4000", {
    transports: ["websocket", "polling"],
});

function App() {
    const [currentTurn, setCurrentTurn] = useState<number | null>(null);
    const [playerNumber, setPlayerNumber] = useState<number | null>(null);
    const [gameCode, setGameCode] = useState('');
    const [isHost, setIsHost] = useState(false); 
    const [errorMessage, setErrorMessage] = useState('');
    const [opponentJoined, setOpponentJoined] = useState(false);
    const [gameCodeInput, setGameCodeInput] = useState('');
    const [isGameOver, setIsGameOver] = useState(false);

    const [opponentScores, setOpponentScores] = useState(Array(14).fill(null));
    const [opponentTotal, setOpponentTotal] = useState(0);

    // TO DO: Move this to a separate file?
    // Listen for socket events
    useEffect(() => {
        socket.on('playerNumber', (num) => {
            setPlayerNumber(num);
        });

        socket.on('turnUpdate', (turn) => {
            setCurrentTurn(turn);
        });

        socket.on('playerNumber', (num: number) => {
            setPlayerNumber(num);
            console.log('You are player', num);
        });

        socket.on('opponentScoreUpdate', ({ index, score }: { index: number; score: number }) => {
            const newScores = [...opponentScores];
            newScores[index] = score;
            setOpponentScores(newScores);
            setOpponentTotal(prev => prev + score);

            setOpponentPlayedCells(prev => {
                const updated = [...prev];
                updated[index] = true;
                return updated;
            });
        });

        socket.on('gameCreated', ({ gameCode, playerNumber }) => {
            setGameCode(gameCode); // Show the game code to the host
            setPlayerNumber(playerNumber);
            setIsHost(true); // Mark this player as the host
        });

        socket.on('gameJoined', ({ gameCode, playerNumber }) => {
            setGameCode(gameCode);
            setPlayerNumber(playerNumber);
            alert("You joined the game successfully!");
            setGameCodeInput("");
            setOpponentJoined(true);
            setIsHost(false);
        });

        socket.on('playerJoined', ({ playerNumber }) => {
            alert(`Player ${playerNumber} has joined!`);
            setOpponentJoined(true);
        });

        socket.on('gameJoinError', (message) => {
            setErrorMessage(message); // Show an error if the game join fails
        });

        socket.on('opponentRolled', (diceValues: number[]) => {
            setOpponentDiceValues(diceValues);

            const possibleScores = getAllPossibleScores(diceValues);
            setOpponentPossibleScores(possibleScores);
        });

        return () => {
            socket.off('playerNumber');
            socket.off('turnUpdate');
            socket.off('playerNumber');
            socket.off('opponentRolled');
            socket.off('opponentScoreUpdate');
        };
    }, []);

    
    const handleCreateGame = () => {
        socket.emit('createGame');
    };


    const joinGame = () => {
        if (gameCodeInput) {
            socket.emit('joinGame', gameCodeInput);
        } else {
            setErrorMessage("Please enter a valid game code.");
        }
    };


    const [diceValues, setDiceValues] = useState<number[]>(Array(5).fill(0));
    const [lockedDice, setLockedDice] = useState(Array(5).fill(false));
    const [rollCount, setRollCount] = useState(0);

    const [opponentDiceValues, setOpponentDiceValues] = useState<number[]>(Array(5).fill(0));
    const [opponentPossibleScores, setOpponentPossibleScores] = useState<number[]>(Array(14).fill(0));
    const [opponentPlayedCells, setOpponentPlayedCells] = useState(Array(14).fill(false));

    // Function for rolling the dice
    const handleRoll = () => {
        console.log("Rolling dice...");
        if (rollCount >= 3 || playerNumber !== currentTurn) return;

        const newDiceValues = diceValues.map((val, index) =>
            lockedDice[index] ? val : Math.floor(Math.random() * 6) + 1
        );

        setDiceValues(newDiceValues);
        calculateScores(newDiceValues);
        setRollCount(prevCount => prevCount + 1);
        socket.emit('rollDice', newDiceValues);
    };


    // Function for locking dice in
    const toggleLockDie = (index: number) => {
        if (diceValues[index] === 0)  return;

        const newLockedDice = [...lockedDice];
        newLockedDice[index] = !newLockedDice[index];
        setLockedDice(newLockedDice);
    };


    // Function for calculating scores based on rolled dice
    const calculateScores = (diceValues: number[]) => {
        const possibleScores = getAllPossibleScores(diceValues);
        const newScores = [...scores];

        for (let i = 0; i < newScores.length; i++) {
            if (!playedCells[i] && playedCells[11] && possibleScores[11] === 50) {
                newScores[i] = 50;
            }
            else if (!playedCells[i]){
                newScores[i] = possibleScores[i];
            }
        }

        //TO DO: Actually make this work
        const bonusEligible = checkUpperBonus(newScores);
        if (bonusEligible && !playedCells[12]) {
            newScores[12] = 35;
            playedCells[12] = true;
        }

        setScores(newScores);
    };


    const [playedCells, setPlayedCells] = useState(Array(14).fill(false)); // Track clicked status for each cell
    const [totalScore, setTotalScore] = useState(0); // Track total score

    const [scores, setScores] = useState(Array(14).fill(null));


    // Function for handling setting a score
    const handleClick = (index: number, scoreToAdd: number) => {
        if (playedCells[index] || playerNumber !== currentTurn || rollCount < 1 || index == 12) return;

        const newPlayedCells = [...playedCells];
        newPlayedCells[index] = true;
        setPlayedCells(newPlayedCells);

        console.log("Player ", playerNumber, " played", playedCells.filter(cell => cell).length, "cells.");

        setTotalScore(totalScore + scoreToAdd);
        setLockedDice(Array(5).fill(false));
        setRollCount(0);
        setDiceValues(Array(5).fill(0));

        socket.emit('updateScore', { index, score: scoreToAdd });
    };

    useEffect(() => {
        console.log("playedCells:", playedCells);
        console.log("opponentPlayedCells:", opponentPlayedCells);
        console.log("playerDone:", playedCells.every(cell => cell));
        console.log("opponentDone:", opponentPlayedCells.every(cell => cell));

        const playerDone = playedCells.every(cell => cell);
        const opponentDone = opponentPlayedCells.every(cell => cell);

        if (playerDone && opponentDone) {
            setIsGameOver(true);
            console.log("Game over triggered!");
        }
    }, [playedCells, opponentPlayedCells]);


  return (
      <div>
          {!gameCode && (
              <div className="joinGameHeader">
                  <button className="joinGameButton" onClick={handleCreateGame}>Create Game</button>
                  <input
                      className="gameCodeInput"
                      type="text"
                      value={gameCodeInput}
                      onChange={(e) => setGameCodeInput(e.target.value)}
                      placeholder="Enter Game Code"
                  />
                  <button className="joinGameButton" onClick={joinGame}>Join Game</button>
              </div>
          )}

          {gameCode && !opponentJoined && (
              <div className="waitingScreen">
                  <h2>Waiting for opponent to join...</h2>
                  <p>Share this code: <strong>{gameCode}</strong></p>
              </div>
          )}

          {isGameOver && (
              <div className="gameOverScreen">
                  <h2>Game Over!</h2>
                  <p>Your Total Score: {totalScore}</p>
                  <p>Opponent's Total Score: {opponentTotal}</p>
                  <button onClick={() => window.location.reload()}>Play Again</button>
              </div>
          )}

          {gameCode && opponentJoined && (
              <div className="App">
                  <GameSide
                      playerNumber={playerNumber}
                      currentTurn={currentTurn}
                      gameCode={gameCode}
                      errorMessage={errorMessage}
                      diceValues={diceValues}
                      lockedDice={lockedDice}
                      handleRoll={handleRoll}
                      toggleLockDie={toggleLockDie}
                      setGameCode={setGameCode}
                      joinGame={joinGame}
                      isHost={isHost}
                  />
                  <ScoreSide
                      scores={scores}
                      playedCells={playedCells}
                      totalScore={totalScore}
                      opponentScores={opponentScores}
                      opponentTotal={opponentTotal}
                      opponentDiceValues={opponentDiceValues}
                      opponentPossibleScores={opponentPossibleScores}
                      handleClick={handleClick}
                  />
              </div>
          )}
      </div>
  );
}

export default App;
