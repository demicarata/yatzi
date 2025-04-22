import React, {useState} from 'react';
import './App.css';
import {FaCrown, FaDiceFive, FaDiceFour, FaDiceOne, FaDiceSix, FaDiceThree, FaDiceTwo} from "react-icons/fa";
import {Bs3Square, Bs4Square} from "react-icons/bs";
import {IoMdGift} from "react-icons/io";
import {HiOutlineQuestionMarkCircle} from "react-icons/hi";
import {PiHouseLineBold} from "react-icons/pi";
import {MdOutlineKeyboardArrowUp, MdOutlineKeyboardDoubleArrowUp} from "react-icons/md";

function App() {
    const [diceValues, setDiceValues] = useState(Array(5).fill(1)); // 5 dice, default value is 1

    const handleRoll = () => {
        // Generate a random number between 1 and 6 for each dice
        const newDiceValues = diceValues.map(() => Math.floor(Math.random() * 6) + 1);
        setDiceValues(newDiceValues);
        calculateScores(newDiceValues);
    };

    const calculateScores = (diceValues: number[]) => {
        const newScores = [...scores];

        for (let i = 0; i < 6; i++) {
            const index = i * 2; // properly mapped interleaved index

            if (!playedCells[index]) {
                const score = diceValues.filter((d) => d === i + 1).reduce((acc, val) => acc + val, 0);
                newScores[index] = score;
            }
        }

        if (!playedCells[11]) {
            if (diceValues[0] === diceValues[1] && diceValues[1] === diceValues[2] && diceValues[2] === diceValues[3] && diceValues[3] === diceValues[4]) {
                newScores[11] = 50;
            }
        }

        if (!playedCells[13]) {
            newScores[13] = diceValues.reduce((acc, val) => acc + val, 0);
        }

        setScores(newScores);
    };

    const [playedCells, setPlayedCells] = useState(Array(14).fill(false)); // Track clicked status for each cell
    const [totalScore, setTotalScore] = useState(0); // Track total score

    const [scores, setScores] = useState(Array(14).fill(null));
    const icons = [
        FaDiceOne,
        Bs3Square,
        FaDiceTwo,
        Bs4Square,
        FaDiceThree,
        PiHouseLineBold,
        FaDiceFour,
        MdOutlineKeyboardArrowUp ,
        FaDiceFive,
        MdOutlineKeyboardDoubleArrowUp,
        FaDiceSix,
        FaCrown,
        IoMdGift,
        HiOutlineQuestionMarkCircle
    ];

    console.log("Icons:", icons);

    const handleClick = (index: number, scoreToAdd: number) => {
        if (!playedCells[index]) {

            const newPlayedCells = [...playedCells];
            newPlayedCells[index] = true;
            setPlayedCells(newPlayedCells);

            // Update the total score
            setTotalScore(totalScore + scoreToAdd);
        }
    };
  return (
    <div className="App">
        <div className="gameSide">
            <div className="diceContainer">
                {diceValues.map((value, index) => (
                    <div key={index} className="dice">
                        <span className="diceNumber">{value}</span>
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
        <div className="scoreSide">
            <div className="scoreContainer">
                <div className="scoreColumn">
                    <div className="scoreTitle">Your Score</div>
                    <div className="rolledScore">
                        {scores.map((score, index) => {
                            const IconComponent = icons[index] as React.ComponentType<{ color?: string; size?: number }>;
                            return(
                            <div
                                key={index}
                                className={`rollCell ${playedCells[index] ? 'clicked' : ''}`}
                                onClick={() => handleClick(index, score)}
                            >
                                <IconComponent color={playedCells[index] ? '#2d5d7b' : '#457eac'} size={28} />
                                <div
                                    style={{
                                        color: playedCells[index] ? '#2d5d7b' : '#457eac',
                                        fontSize: '22px',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {score !== null ? score : '0'}
                                </div>
                            </div>
                        );
                        })}
                    </div>
                    <div className="totalPoints"> TOTAL: {totalScore} </div>
                </div>
                <div className="scoreColumn">
                    <div className="scoreTitle">Opponent Score</div>
                    <div className="rolledScore">
                        {scores.map((number, index) => {
                            const IconComponent = icons[index] as React.ComponentType<{ color?: string; size?: number }>;
                            return(
                                <div
                                    key={index}
                                    className={`rollCell`}
                                >
                                    <IconComponent color={'#457eac'} size={28} />
                                    <div
                                        style={{
                                            color: '#457eac',
                                            fontSize: '22px',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {'-'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="totalPoints"> TOTAL: 0</div>
                </div>
            </div>
        </div>
    </div>
  );
}

export default App;
