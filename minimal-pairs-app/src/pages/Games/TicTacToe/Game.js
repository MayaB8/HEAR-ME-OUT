import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Button, Grid, Paper, Typography } from '@mui/material';
import PageBg from './../../../images/pagesBg/skyAndCloudsBg.png';
import xImage from './../../../images/games/Ximg.png';
import oImage from './../../../images/games/Oimg.png';

const TicTacToeGame = () => {
    const theme = useTheme();
    const [showPopup, setShowPopup] = useState(true);
    const [gameMode, setGameMode] = useState(1);
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [isComputerTurn, setIsComputerTurn] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [status, setStatus] = useState("X :תור");

    const handleClick = (index) => {
        if (board[index] || calculateWinner(board) || gameOver || isComputerTurn) {
            return;
        }

        const newBoard = board.slice();
        newBoard[index] = (gameMode === 1 || (isXNext && gameMode === 2)) ? 'X' : 'O';
        setBoard(newBoard);
        setIsXNext(!isXNext);
        setStatus(`${(gameMode === 1 || (isXNext && gameMode === 2)) ? 'O' : 'X'} :תור`);

        if (calculateWinner(newBoard)) {
            setGameOver(true);
        } else if (gameMode === 1) {
            // Computer's random move with delay
            setIsComputerTurn(true);
            setTimeout(() => {
            const randomMove = generateRandomMove(newBoard);
            if (randomMove !== null) {
                newBoard[randomMove] = 'O';
                setBoard(newBoard);
                setStatus("X :תור");
            }
            setIsComputerTurn(false);
            }, 1000); // 1 second delay
        }
    };

    const renderSquare = (index) => (
        <Button
            className="square"
            variant="outlined"
            onClick={() => handleClick(index)}
            style={{ width: '120px', height: '120px', fontSize: '24px', backgroundColor: theme.palette.white }}
            disabled={isComputerTurn}
        >
            {board[index] === 'X' ? (
                <img src={xImage} alt="X" style={{ maxWidth: '100%', maxHeight: '100%' }} />
            ) : ( board[index] === 'O' ?
                <img src={oImage} alt="O" style={{ maxWidth: '100%', maxHeight: '100%' }} />
            : null)}
        </Button>
    );

    const handleGameModeSelect = (mode) => {
        setShowPopup(false);
        setGameMode(mode);
    };

    const winner = calculateWinner(board);
    const draw = isDraw(board);
    const gameStatus  = winner
        ? `ניצח ${winner}`
        : (draw ? `תיקו` : `${status}`);

    const handleRestart = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setGameOver(false);
    };

    return (
        <div className="App" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            position: 'absolute',
            width: '100%',
            backgroundImage: `url(${PageBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: -1,
        }}>
            {showPopup && (
                <div className="overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1 }}>
                <div className="popup" style={{ backgroundColor: theme.palette.white, border: '2px solid #ccc', padding: '20px', textAlign: 'center', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)' }}>
                    <Typography variant="h4" gutterBottom>
                        איקס עיגול
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                        בחר כמות שחקנים
                    </Typography>
                    <Button variant="contained" style={{ backgroundColor: theme.palette.darkBlue, width: "90px", marginRight: '10px' }} onClick={() => handleGameModeSelect(2)}>
                        2 שחקנים
                    </Button>
                    <Button variant="contained" style={{ backgroundColor: theme.palette.darkBlue, width: "90px" }} onClick={() => handleGameModeSelect(1)}>
                        שחקן 1
                    </Button>
                </div>
                </div>
            )}
            <div className="board-container">
                <Typography fontWeight="bold" variant="h3" color={theme.palette.darkBlue} gutterBottom>
                    איקס עיגול
                </Typography>
                <Typography variant="h5" gutterBottom>
                    {gameStatus}
                </Typography>
                <Paper elevation={3} style={{ padding: '10px' ,backgroundColor: theme.palette.darkBlue }}>
                    <Grid container spacing={0} justifyContent="center">
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                                gridGap: '10px',
                            }}
                        >
                            <Grid item xs={4}>
                                {renderSquare(0)}
                            </Grid>
                            <Grid item xs={4}>
                                {renderSquare(1)}
                            </Grid>
                            <Grid item xs={4}>
                                {renderSquare(2)}
                            </Grid>
                            <Grid item xs={4}>
                                {renderSquare(3)}
                            </Grid>
                            <Grid item xs={4}>
                                {renderSquare(4)}
                            </Grid>
                            <Grid item xs={4}>
                                {renderSquare(5)}
                            </Grid>
                            <Grid item xs={4}>
                                {renderSquare(6)}
                            </Grid>
                            <Grid item xs={4}>
                                {renderSquare(7)}
                            </Grid>
                            <Grid item xs={4}>
                                {renderSquare(8)}
                            </Grid>
                        </div>
                    </Grid>
                </Paper>
                <Button variant="contained" style={{ marginTop: '10px' ,backgroundColor: theme.palette.darkBlue }} onClick={handleRestart}>
                    שחקו שוב
                </Button>
            </div>
        </div>
    );
};

const generateRandomMove = (currentBoard) => {
    const emptySquares = [];
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        emptySquares.push(i);
      }
    }
    const randomIndex = Math.floor(Math.random() * emptySquares.length);
    return emptySquares[randomIndex];
};

// Helper function to determine the winner
const calculateWinner = (squares) => {
    const winningCombos = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (const combo of winningCombos) {
        const [a, b, c] = combo;
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
};

const isDraw = (squares) => {
    if (squares.every(square => square !== null)) {
        return true;
    }
    return false;
}

export default TicTacToeGame;
