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
    const [isHost, setIsHost] = useState(false); // To distinguish between the host and player
    const [errorMessage, setErrorMessage] = useState('');

    const [opponentScores, setOpponentScores] = useState(Array(14).fill(null));
    const [opponentTotal, setOpponentTotal] = useState(0);

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
        });

        socket.on('gameCreated', ({ gameCode, playerNumber }) => {
            setGameCode(gameCode); // Show the game code to the host
            setPlayerNumber(playerNumber);
            setIsHost(true); // Mark this player as the host
        });

        socket.on('gameJoined', ({ playerNumber }) => {
            setPlayerNumber(playerNumber);
            alert("You joined the game successfully!");
        });

        socket.on('playerJoined', ({ playerNumber }) => {
            alert(`Player ${playerNumber} has joined!`);
        });

        socket.on('gameJoinError', (message) => {
            setErrorMessage(message); // Show an error if the game join fails
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
        if (gameCode) {
            socket.emit('joinGame', gameCode);
        } else {
            setErrorMessage("Please enter a valid game code.");
        }
    };


    const [diceValues, setDiceValues] = useState<number[]>(Array(5).fill(0));
    const [lockedDice, setLockedDice] = useState(Array(5).fill(false));
    const [rollCount, setRollCount] = useState(0);


    // Function for rolling the dice
    const handleRoll = () => {
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
        if (playedCells[index] || playerNumber !== currentTurn) return;

        const newPlayedCells = [...playedCells];
        newPlayedCells[index] = true;
        setPlayedCells(newPlayedCells);

        setTotalScore(totalScore + scoreToAdd);
        setLockedDice(Array(5).fill(false));
        setRollCount(0);
        setDiceValues(Array(5).fill(0));

        socket.emit('updateScore', { index, score: scoreToAdd });
    };
  return (
      <div>
          {!gameCode && (
              <div className="joinGameHeader">
                  <button className="joinGameButton" onClick={handleCreateGame}>Create Game</button>
                  <input
                      className="gameCodeInput"
                      type="text"
                      value={gameCode}
                      onChange={(e) => setGameCode(e.target.value)}
                      placeholder="Enter Game Code"
                  />
                  <button className="joinGameButton" onClick={joinGame}>Join Game</button>
              </div>
          )}

          {/*
            TO DO: Make this go dark until game is created/joined
          */}
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
                  handleClick={handleClick}
              />
          </div>
      </div>
  );
}

export default App;
