export function getTenantGymId(req) {
  const headerGym = req.headers['x-gym-id'];
  const queryGym = req.query.gymId;
  let gymId = headerGym || queryGym || 'gym-gudiyatham';

  // Normalize slug like 'gudiyatham' -> 'gym-gudiyatham' if needed
  if (gymId && !gymId.startsWith('gym-') && gymId !== 'all') {
    gymId = `gym-${gymId}`;
  }
  return gymId;
}


