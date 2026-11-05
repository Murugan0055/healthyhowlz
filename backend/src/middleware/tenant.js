export function getTenantGymId(req) {
  const headerGym = req.headers['x-gym-id'];
  const queryGym = req.query.gymId;
  const gymId = headerGym || queryGym || 'gym-gudiyatham';
  return gymId;
}

