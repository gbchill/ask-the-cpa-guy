import { Suspense } from 'react';
import DashboardClient from '@/components/DashboardClient';

export default function DashboardPage() {
    return (
        <Suspense
            fallback={
                <div className="container mx-auto px-4 py-10">
                    <div className="flex justify-center">
                        <p>Loading dashboard…</p>
                    </div>
                </div>
            }
        >
            <DashboardClient />
        </Suspense>
    );
}
