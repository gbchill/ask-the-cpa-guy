import QuestionForm from '@/components/question-form';

export const metadata = {
    title: 'Ask a Question - Ask the CPA Guy',
    description: 'Submit your accounting or QuickBooks question to the CPA Guy',
};

export default function AskPage() {
    return (
        <div className="container max-w-2xl py-10">
            <QuestionForm />
        </div>
    );
}