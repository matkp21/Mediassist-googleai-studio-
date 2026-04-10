import { PageWrapper } from '@/components/layout/page-wrapper';
import { PatientTabs } from '@/components/patient-management/patient-tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PatientManagementPage() {
  return (
    <PageWrapper title="Patient Management">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Patient Records & Tools</CardTitle>
          <CardDescription>Manage patient rounds, view timelines, and set reminders.</CardDescription>
        </CardHeader>
        <CardContent>
          <PatientTabs />
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
