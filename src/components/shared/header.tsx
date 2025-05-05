import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-primary">Ask the CPA Guy</span>
                </Link>
                <nav className="flex items-center gap-4">
                    <Link href="/ask">
                        <Button variant="default">Ask a Question</Button>
                    </Link>
                    <Link href="/status">
                        <Button variant="outline">Check Status</Button>
                    </Link>
                </nav>
            </div>
        </header>
    );
}