import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="container mx-auto px-4 flex flex-col items-center justify-center space-y-12 py-16 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Ask the <span className="text-primary">CPA Guy</span>
        </h1>
        <p className="mx-auto max-w-[700px] text-lg text-muted-foreground sm:text-xl">
          Get answers to your accounting and QuickBooks questions directly from a certified CPA.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link href="/ask">
          <Button size="lg" className="px-8 shadow-gold hover:shadow-gold/80">Ask a Question</Button>
        </Link>
        <Link href="/status">
          <Button size="lg" variant="outline" className="px-8 hover:shadow-gold">Check Status</Button>
        </Link>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:mx-auto lg:max-w-5xl">
        <FeatureCard
          title="Specific Answers"
          description="Get answers tailored to your specific accounting or QuickBooks question."
        />
        <FeatureCard
          title="CPA Reviewed"
          description="All responses are personally reviewed by a certified CPA."
        />
        <FeatureCard
          title="No Registration"
          description="Simply submit your question with your email - no account needed."
        />
      </div>

      <div className="mx-auto max-w-3xl rounded-lg border border-border bg-card p-6 text-card-foreground shadow-gold/30">
        <h2 className="mb-4 text-xl font-semibold text-primary">How It Works</h2>
        <ol className="list-decimal space-y-3 text-left pl-6">
          <li>Submit your accounting or QuickBooks question through our simple form.</li>
          <li>Provide your email address where you'd like to receive your answer.</li>
          <li>Our certified CPA reviews your question and prepares a response.</li>
          <li>Receive your personalized answer directly in your inbox!</li>
        </ol>
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm hover:shadow-gold/30 transition-shadow">
      <h3 className="mb-2 text-lg font-medium text-primary">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}