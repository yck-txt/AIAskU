
import React, { useEffect, useState, useMemo } from 'react';

const COLORS = ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'];

interface ConfettiPiece {
    style: React.CSSProperties;
    id: number;
}

export const Confetti: React.FC<{ count?: number }> = ({ count = 150 }) => {
    const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

    const memoizedPieces = useMemo(() => {
        return Array.from({ length: count }).map((_, index) => {
            const style: React.CSSProperties = {
                position: 'fixed',
                width: `${Math.random() * 8 + 6}px`,
                height: `${Math.random() * 8 + 6}px`,
                backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
                top: `${Math.random() * -20}%`, // Start above the screen
                left: `${Math.random() * 100}%`,
                opacity: 1,
                transform: `rotate(${Math.random() * 360}deg)`,
                animation: `confetti-fall ${Math.random() * 4 + 3}s linear ${Math.random() * 2}s forwards`,
                borderRadius: '50%',
            };
            return { style, id: index };
        });
    }, [count]);

    useEffect(() => {
       setPieces(memoizedPieces);
    }, [memoizedPieces]);


    return (
        <div className="fixed inset-0 pointer-events-none z-[100]">
            {pieces.map(piece => (
                <div key={piece.id} style={piece.style} />
            ))}
            <style>
                {`
                    @keyframes confetti-fall {
                        0% {
                            transform: translateY(0) rotate(0deg);
                            opacity: 1;
                        }
                        100% {
                            transform: translateY(110vh) rotate(720deg);
                            opacity: 0;
                        }
                    }
                `}
            </style>
        </div>
    );
};
