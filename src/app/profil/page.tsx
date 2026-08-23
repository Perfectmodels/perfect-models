import LegacyRoute from '@/app/_legacy/LegacyRoute';
import FirstLoginSecurityPrompt from '@/components/auth/FirstLoginSecurityPrompt';

export default function Page() {
  return (
    <>
      <LegacyRoute component="ModelDashboard" role="student" />
      <FirstLoginSecurityPrompt />
    </>
  );
}
