(function () {
  function fallbackCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var copied = document.execCommand('copy');
    document.body.removeChild(area);
    return copied;
  }

  function copyCode(button) {
    var code = button.parentElement.querySelector('pre code');
    var text = code.textContent;
    var copy = window.isSecureContext && navigator.clipboard
      ? navigator.clipboard.writeText(text)
      : Promise.resolve(fallbackCopy(text));

    copy.then(function (success) {
      if (success === false) throw new Error('Copy failed');
      button.classList.add('copied');
      button.setAttribute('aria-label', 'Copied');
      button.title = 'Copied';
      window.setTimeout(function () {
        button.classList.remove('copied');
        button.setAttribute('aria-label', 'Copy code');
        button.title = 'Copy code';
      }, 1400);
    }).catch(function () {
      button.setAttribute('aria-label', 'Copy failed');
      button.title = 'Copy failed';
    });
  }

  document.querySelectorAll('.copy-button').forEach(function (button) {
    button.addEventListener('click', function () { copyCode(button); });
  });
})();
