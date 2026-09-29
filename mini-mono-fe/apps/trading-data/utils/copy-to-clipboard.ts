// @ts-nocheck
export const copyToClipboard = (textToCopy) => {
  // text area method
  const textArea = document.createElement('textarea');
  textArea.value = textToCopy;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  return new Promise((res, rej) => {
    // Deprecated but still widely used,
    // New API: navigator.clipboard.writeText(text_to_copy)
    // Navigator require Permission, need to check before call:
    // navigator.permissions.query({ name: "write-on-clipboard" }).then((result) => {
    //   if (result.state == "granted" || result.state == "prompt") {
    //     alert("Write access granted!");
    //   }
    // });

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    document?.execCommand?.('copy') ? res() : rej();
    textArea.remove();
  });
};
