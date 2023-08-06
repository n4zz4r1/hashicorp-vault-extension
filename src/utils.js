
// Function to copy text to the clipboard
export function copyTextToClipboard(textToCopy) {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = textToCopy;
    document.body.appendChild(textarea);
  
    // Select the text in the textarea
    textarea.select();
  
    try {
      // Execute the copy command
      const success = Document.execCommand('copy');
      if (success) {
        console.log('Text copied to clipboard!');
      } else {
        console.error('Failed to copy text. Please try again.');
      }
    } catch (error) {
      console.error('Error copying text:', error);
    }
  
    // Remove the temporary textarea element
    document.body.removeChild(textarea);
  }