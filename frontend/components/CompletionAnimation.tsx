import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti'; // นำเข้าตัวยิงพลุ

interface CompletionAnimationProps {
    show: boolean;
    onComplete: () => void;
    onAnimationStateChange?: (isAnimating: boolean) => void;
}

export default function CompletionAnimation({ show, onComplete, onAnimationStateChange }: CompletionAnimationProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setVisible(true);
            // แจ้ง parent ว่า animation เริ่มแล้ว
            onAnimationStateChange?.(true);

            // 1. ยิงพลุจริงทันทีที่โชว์
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                zIndex: 100
            });

            // 2. ตั้งเวลาปิด
            const timer = setTimeout(() => {
                setVisible(false);
                // แจ้ง parent ว่า animation เสร็จแล้ว
                onAnimationStateChange?.(false);
                onComplete();
            }, 4000);

            return () => {
                clearTimeout(timer);
                onAnimationStateChange?.(false);
            };
        } else {
            // ถ้า show เป็น false ให้แจ้งว่า animation ไม่แสดง
            onAnimationStateChange?.(false);
        }
    }, [show, onComplete, onAnimationStateChange]);

    if (!visible) return null;

    return (
        <>
            {/* Overlay ที่บล็อกการคลิกทั้งหมด */}
            <div className="fixed inset-0 z-[59] bg-black/20 backdrop-blur-sm pointer-events-auto" />
            
            {/* Animation Layer */}
            <div className="fixed inset-0 pointer-events-none z-[60] flex flex-col items-center justify-center overflow-hidden">
                {/* Emoji รางวัลที่พุ่งขึ้นมา */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className={`absolute bottom-0 text-6xl animate-shoot-up`}
                            style={{
                                left: `${15 + (i * 15)}%`,
                                animationDelay: `${0.2 * i}s`,
                                opacity: 0
                            }}
                        >
                            {['🎉', '✨', '🎊', '⭐️', '🔥', '💎'][i]}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}