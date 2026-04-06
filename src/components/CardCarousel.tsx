"use client";

import { useRef, useEffect, useState } from "react";
import CreditCard from "./CreditCard";
import type { Card } from "@/lib/mockData";

interface CardCarouselProps {
    cards: Card[];
}

export default function CardCarousel({ cards }: CardCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [cardWidth, setCardWidth] = useState(0);

    // Calculate card width based on container
    useEffect(() => {
        const updateWidth = () => {
            if (scrollRef.current) {
                setCardWidth(scrollRef.current.offsetWidth);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    // Auto scroll
    useEffect(() => {
        if (isPaused || cards.length <= 1 || cardWidth === 0) return;

        const interval = setInterval(() => {
            if (scrollRef.current) {
                const nextIndex = (currentIndex + 1) % cards.length;

                scrollRef.current.scrollTo({
                    left: nextIndex * cardWidth,
                    behavior: 'smooth'
                });

                setCurrentIndex(nextIndex);
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [isPaused, currentIndex, cards.length, cardWidth]);

    // Pause on interaction
    const handleInteractionStart = () => {
        setIsPaused(true);
    };

    const handleInteractionEnd = () => {
        setTimeout(() => setIsPaused(false), 3000);
    };

    // Update current index on scroll
    const handleScroll = () => {
        if (scrollRef.current && cardWidth > 0) {
            const index = Math.round(scrollRef.current.scrollLeft / cardWidth);
            setCurrentIndex(index);
        }
    };

    return (
        <div>
            {/* Carousel */}
            <div
                ref={scrollRef}
                onMouseEnter={handleInteractionStart}
                onMouseLeave={handleInteractionEnd}
                onTouchStart={handleInteractionStart}
                onTouchEnd={handleInteractionEnd}
                onScroll={handleScroll}
                style={{
                    display: 'flex',
                    overflowX: 'auto',
                    scrollSnapType: 'x mandatory',
                    scrollBehavior: 'smooth',
                    WebkitOverflowScrolling: 'touch'
                }}
                className="hide-scrollbar"
            >
                {cards.map((card) => (
                    <div
                        key={card.id}
                        style={{
                            flexShrink: 0,
                            width: '100%',
                            scrollSnapAlign: 'start'
                        }}
                    >
                        <CreditCard card={card} variant="carousel" />
                    </div>
                ))}
            </div>

            {/* Dots indicator */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '16px'
            }}>
                {cards.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            if (scrollRef.current && cardWidth > 0) {
                                scrollRef.current.scrollTo({
                                    left: index * cardWidth,
                                    behavior: 'smooth'
                                });
                                setCurrentIndex(index);
                            }
                        }}
                        style={{
                            width: currentIndex === index ? '24px' : '8px',
                            height: '8px',
                            borderRadius: '4px',
                            border: 'none',
                            background: currentIndex === index ? '#ccff00' : 'rgba(255, 255, 255, 0.2)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
