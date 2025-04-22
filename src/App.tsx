import React, {useState} from 'react';
import './App.css';
import {FaCrown, FaDiceFive, FaDiceFour, FaDiceOne, FaDiceSix, FaDiceThree, FaDiceTwo} from "react-icons/fa";
import {Bs3Square, Bs4Square} from "react-icons/bs";
import {IoMdGift} from "react-icons/io";
import {HiOutlineQuestionMarkCircle} from "react-icons/hi";
import {PiHouseLineBold} from "react-icons/pi";
import {MdOutlineKeyboardArrowUp, MdOutlineKeyboardDoubleArrowUp} from "react-icons/md";
import {checkUpperBonus, getAllPossibleScores} from "./scoreUtils";

function App() {
    const [diceValues, setDiceValues] = useState<number[]>(Array(5).fill(0));
    const [lockedDice, setLockedDice] = useState(Array(5).fill(false));
    const [rollCount, setRollCount] = useState(0);


    // Function for rolling the dice
    const handleRoll = () => {
        if (rollCount >= 3) return;

        const newDiceValues = diceValues.map((val, index) =>
            lockedDice[index] ? val : Math.floor(Math.random() * 6) + 1
        );

        setDiceValues(newDiceValues);
        calculateScores(newDiceValues);
        setRollCount(prevCount => prevCount + 1);
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


    // Function for handling setting a score
    const handleClick = (index: number, scoreToAdd: number) => {
        if (!playedCells[index]) {

            const newPlayedCells = [...playedCells];
            newPlayedCells[index] = true;
            setPlayedCells(newPlayedCells);

            setTotalScore(totalScore + scoreToAdd);
            setLockedDice(Array(5).fill(false));
            setRollCount(0);
            setDiceValues(Array(5).fill(0));
        }
    };
  return (
    <div className="App">
        <div className="gameSide">
            <div className="diceContainer">
                {diceValues.map((value, index) => (
                    <div key={index}
                        className={`dice ${lockedDice[index] ? 'locked' : ''}`}
                        onClick={() => toggleLockDie(index)}>
                        <span className="diceNumber">{value !==  0 ? value : ''}</span>
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
                                style={{
                                    backgroundColor: index === 12 && score === 35 ? '#cce9ff' : undefined,
                                }}
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
