// src/app/feedback/page.tsx
import { PageWrapper } from '@/components/layout/page-wrapper';
import { FeedbackForm } from '@/components/feedback/feedback-form';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FeedbackPage() {
  return (
    <PageWrapper title="Submit Feedback">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-2xl text-center">We Value Your Input!</CardTitle>
            <CardDescription className="text-center">
              Help us improve MediAssistant by sharing your thoughts, suggestions, or any issues you've encountered.
            </CardDescription>
          </CardHeader>
          {/* CardContent is implicitly part of FeedbackForm styling */}
            <FeedbackForm />
        </Card>
      </div>
    </PageWrapper>
  );
}
