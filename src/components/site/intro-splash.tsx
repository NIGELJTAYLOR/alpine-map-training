/**
 * First-run gate (V1.4.0+).
 *
 * The forced redirect to /onboarding was retired in V1.4.0. New visitors
 * now land on the home page and see a dismissible WelcomeCard that
 * offers them course selection and sign-in as optional next steps,
 * rather than being pushed into a mandatory wizard.
 *
 * This component is kept as a no-op so layout.tsx does not need to
 * change. It can be removed in a future cleanup pass.
 */
export function IntroSplash() {
  return null;
}
