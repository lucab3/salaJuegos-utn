export const environment = {
  production: false,

  supabase: {
    url: 'https://tddltmavxmxgyhhabida.supabase.co',
    anonKey: 'sb_publishable_iaYO8mDF0eWE9iZXumjZQw_wSFZFxIO'
  },

  testUsers: [
    { label: 'Tester 1', email: 'tester1@salajuegos.test', password: 'tester1234' },
    { label: 'Tester 2', email: 'tester2@salajuegos.test', password: 'tester1234' },
    { label: 'Tester 3', email: 'tester3@salajuegos.test', password: 'tester1234' }
  ]
};
