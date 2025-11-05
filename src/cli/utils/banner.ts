import figlet from 'figlet';
import gradient from 'gradient-string';

/**
 * Generate the Bugzy ASCII banner with gradient colors matching the logo
 * Colors: Peach (#f4b28c) -> Orange (#ff6b35) -> Red (#c62e2e)
 */
export function getBanner(): string {
  const text = figlet.textSync('BUGZY', {
    font: 'Slant',
    horizontalLayout: 'fitted',
    verticalLayout: 'default',
    width: 80,
    whitespaceBreak: true,
  });

  // Create gradient matching Bugzy logo colors
  const bugzyGradient = gradient(['#f4b28c', '#ff6b35', '#c62e2e']);
  return bugzyGradient.multiline(text);
}
