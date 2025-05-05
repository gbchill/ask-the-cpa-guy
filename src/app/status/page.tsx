import StatusCheck from '../../components/status-check';

export const metadata = {
    title: 'Check Status - Ask the CPA Guy',
    description: 'Check the status of your submitted questions',
};

export default function StatusPage() {
    return (
        <div className="container max-w-3xl py-10">
            <StatusCheck />
        </div>
    );
}