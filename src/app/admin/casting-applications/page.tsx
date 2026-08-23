import LegacyRoute from '@/app/_legacy/LegacyRoute';
import CastingAccountProvisioner from '@/components/admin/CastingAccountProvisioner';

export default function Page() {
  return (
    <>
      <LegacyRoute component="AdminCasting" role="admin" />
      <CastingAccountProvisioner />
    </>
  );
}
