'use client'

import { usePathname } from 'next/navigation'
import React from 'react'

export default function LayoutWrapper({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const isAskPage = pathname === '/ask'

    return (
        <main
            className={[
                'flex-grow flex justify-center w-full transition-all',
                isAskPage ? 'items-start pt-50' : 'items-center',
            ].join(' ')}
        >
            {children}
        </main>
    )
}
