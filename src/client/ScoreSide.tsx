import React from 'react';
import {
    FaDiceFive, FaDiceFour, FaDiceOne, FaDiceSix, FaDiceThree, FaDiceTwo, FaCrown
} from 'react-icons/fa';
import { Bs3Square, Bs4Square } from 'react-icons/bs';
import { IoMdGift } from 'react-icons/io';
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi';
import { PiHouseLineBold } from 'react-icons/pi';
import { MdOutlineKeyboardArrowUp, MdOutlineKeyboardDoubleArrowUp } from 'react-icons/md';

interface ScoreSideProps {
    scores: number[];
    playedCells: boolean[];
    totalScore: number;
    opponentScores: (number | null)[];
    opponentTotal: number;
    opponentDiceValues: number[];
    opponentPossibleScores: number[];
    handleClick: (index: number, scoreToAdd: number) => void;
}

const ScoreSide: React.FC<ScoreSideProps> = ({
    scores,
    playedCells,
    totalScore,
    opponentScores,
    opponentTotal,
    opponentDiceValues,
    opponentPossibleScores,
    handleClick,
}) => {
    const icons = [
        FaDiceOne, Bs3Square, FaDiceTwo, Bs4Square,
        FaDiceThree, PiHouseLineBold, FaDiceFour, MdOutlineKeyboardArrowUp,
        FaDiceFive, MdOutlineKeyboardDoubleArrowUp, FaDiceSix, FaCrown,
        IoMdGift, HiOutlineQuestionMarkCircle
    ];

    const scoreDescriptions = [
        "Sum of 1s",
        "Three of a kind - sum of all dice",
        "Sum of 2s",
        "Four of a kind - sum of all dice",
        "Sum of 3s",
        "Full House - 2 of one kind, 3 of another",
        "Sum of 4s",
        "Small Straight - 4 consecutive values",
        "Sum of 5s",
        "Large Straight - 5 consecutive values",
        "Sum of 6s",
        "Yahtzee - 5 identical values",
        "Bonus - for reaching at least 63 points in the first column",
        "Chance - sum of all dice"
      ];

    return (
        <div className="scoreSide">
            <div className="scoreContainer">
                <div className="scoreColumn">
                    <div className="scoreTitle">Your Score</div>
                    <div className="rolledScore">
                        {scores.map((score, index) => {
                            const IconComponent = icons[index] as React.ComponentType<{
                                color?: string;
                                size?: number
                            }>;
                            return (
                                <div
                                    key={index}
                                    className={`rollCell ${playedCells[index] ? 'clicked' : ''}`}
                                    onClick={() => handleClick(index, score)}
                                    style={{
                                        backgroundColor: index === 12 ? '#cce9ff' : undefined, 
                                        position: 'relative'
                                    }}
                                >
                                    <IconComponent color={playedCells[index] ? '#2d5d7b' : '#457eac'} size={28}/>
                                    <div
                                        style={{
                                            color: playedCells[index] ? '#2d5d7b' : '#457eac',
                                            fontSize: '22px',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {score !== null ? score : '0'}
                                    </div>
                                    <div className="tooltip">{scoreDescriptions[index]}</div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="totalPoints"> TOTAL: {totalScore} </div>
                </div>
                <div className="scoreColumn">
                    <div className="scoreTitle">Opponent Score</div>
                    <div className="rolledScore">
                        {opponentScores.map((score, index) => {
                            const IconComponent = icons[index] as React.ComponentType<{
                                color?: string;
                                size?: number
                            }>;
                            return (
                                <div
                                    key={index}
                                    className={`rollCell`}
                                >
                                    <IconComponent color={'#457eac'} size={28}/>
                                    <div
                                        style={{
                                            color: '#457eac',
                                            fontSize: '22px',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {score !== null
                                            ? score
                                            : (opponentPossibleScores[index] !== null ?
                                                opponentPossibleScores[index]
                                                : '0')}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="totalPoints"> TOTAL: {opponentTotal}</div>
                </div>
            </div>
        </div>
    );
}

export default ScoreSide;