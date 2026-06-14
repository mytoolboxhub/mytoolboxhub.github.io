/**
 * Copies text to the clipboard and temporarily updates the button's innerHTML
 * to show a success message (e.g., "Copied!").
 */
export async function copyToClipboard(text: string, button: HTMLElement, successText: string = 'Copied!'): Promise<void> {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    const originalText = button.innerHTML;
    button.innerHTML = successText;
    setTimeout(() => {
      button.innerHTML = originalText;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy text', err);
    alert('Failed to copy text');
  }
}
