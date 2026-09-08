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
    var copy = window.isSecureContext && navigator.clipboard
      ? navigator.clipboard.writeText(code.textContent)
      : Promise.resolve(fallbackCopy(code.textContent));

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

  document.querySelectorAll('[data-accordion-action]').forEach(function (button) {
    button.addEventListener('click', function () {
      var shouldOpen = button.dataset.accordionAction === 'expand';
      document.querySelectorAll('details.assignment').forEach(function (details) {
        details.open = shouldOpen;
      });
    });
  });

  document.querySelectorAll('.print-assignment').forEach(function (button) {
    button.addEventListener('click', function () {
      var assignment = button.closest('details.assignment');
      var group = assignment.closest('.difficulty-group');
      var title = assignment.querySelector('.assignment-title').textContent.trim();
      var previousTitle = document.title;
      var wasOpen = assignment.open;

      assignment.open = true;
      assignment.classList.add('print-target');
      group.classList.add('print-group');
      document.body.classList.add('print-single');
      document.title = title.replace(/[^a-z0-9 _-]+/gi, '').trim();

      function restorePage() {
        document.body.classList.remove('print-single');
        assignment.classList.remove('print-target');
        group.classList.remove('print-group');
        assignment.open = wasOpen;
        document.title = previousTitle;
        window.removeEventListener('afterprint', restorePage);
      }

      window.addEventListener('afterprint', restorePage);
      window.print();
    });
  });
})();
