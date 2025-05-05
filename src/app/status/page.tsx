// src/app/status/page.tsx

import StatusCheck from '@/components/status-check'

export const metadata = {
    title: 'Check Status - Ask the CPA Guy',
    description: 'Check the status of your submitted questions',
}

export default function StatusPage() {
    return (
        <div className="container mx-auto px-4 py-12 w-full">
            <StatusCheck />
        </div>
    )
}
