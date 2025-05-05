// src/components/shared/footer.tsx
'use client';

import { usePathname } from 'next/navigation';

export default function Footer() {
    const pathname = usePathname();

    // don’t render footer on Ask or Status pages
    if (pathname === '/ask' || pathname === '/status') {
        return null;
    }

    return (
        <footer className="w-full bg-background mt-auto py-12">
            <div className="w-full px-6 flex flex-col items-center justify-center space-y-2 text-center text-sm text-muted-foreground">
                <p>© {new Date().getFullYear()} Ask the CPA Guy. All rights reserved.</p>
                <div className="text-xs max-w-2xl mt-1">
                    <p className="mb-2">
                        <strong>Disclaimer:</strong> This service provides general accounting guidance and QuickBooks assistance only.
                    </p>
                    <p>
                        We do not provide tax filing services, legal advice, estate planning, or assistance with complex accounting matters.
                        Information provided is not a substitute for professional accounting or tax services.
                        Please consult with a qualified professional for specific advice related to your situation.
                    </p>
                </div>
            </div>
        </footer>
    );
}
