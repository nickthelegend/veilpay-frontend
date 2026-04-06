"use client";

import { ReactNode } from "react";

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

export default function PageTransition({ children, className = "" }: PageTransitionProps) {
    return (
        <div
            className={`page-transition ${className}`}
            style={{
                animation: 'pageEnter 0.6s ease-out forwards',
                opacity: 0
            }}
        >
            {children}
        </div>
    );
}
