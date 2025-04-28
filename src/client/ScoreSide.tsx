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
                                        backgroundColor: index === 12 && score === 35 ? '#cce9ff' : undefined,
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