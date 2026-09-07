(function () {
  'use strict';

  var root = document.querySelector('[data-faq-app]');
  if (!root) return;

  var currentWeek = root.dataset.week || 'all';
  var list = root.querySelector('.faq-list');
  var search = root.querySelector('#faq-search');
  var scope = root.querySelector('#faq-scope');
  var count = root.querySelector('.result-count');
  var empty = root.querySelector('.empty');
  var expand = root.querySelector('[data-action="expand"]');
  var collapse = root.querySelector('[data-action="collapse"]');
  var entries = [];

  function escapeHtml(value) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function inline(value) {
    var stash = [];
    function hold(html) { stash.push(html); return '\u0000' + (stash.length - 1) + '\u0000'; }
    var s = escapeHtml(value);
    s = s.replace(/`([^`]+)`/g, function (_, x) { return hold('<code>' + x + '</code>'); });
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/__([^_]+)__/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/_([^_]+)_/g, '<em>$1</em>');
    s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1/$2').replace(/\\times\b/g, '×').replace(/\\pi\b/gi, 'π');
    s = s.replace(/\\text\{([^{}]+)\}/g, '$1').replace(/\\cdots\b/g, '⋯');
    return s.replace(/\u0000(\d+)\u0000/g, function (_, i) { return stash[Number(i)]; });
  }

  function renderMarkdown(markdown) {
    var lines = markdown.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
    var out = [], i = 0;
    while (i < lines.length) {
      var line = lines[i];
      if (!line.trim()) { i++; continue; }
      var fence = line.match(/^\s*```/);
      if (fence) {
        var code = []; i++;
        while (i < lines.length && !/^\s*```/.test(lines[i])) code.push(lines[i++]);
        if (i < lines.length) i++;
        out.push('<pre><code>' + escapeHtml(code.join('\n')) + '</code></pre>'); continue;
      }
      if (/^\s*\$\$\s*$/.test(line)) {
        var math = []; i++;
        while (i < lines.length && !/^\s*\$\$\s*$/.test(lines[i])) math.push(lines[i++]);
        if (i < lines.length) i++;
        out.push('<div class="math-block"><pre>' + inline(math.join('\n')) + '</pre></div>'); continue;
      }
      var heading = line.match(/^\s*(#{1,6})\s+(.+?)\s*#*\s*$/);
      if (heading) { out.push('<h' + heading[1].length + '>' + inline(heading[2]) + '</h' + heading[1].length + '>'); i++; continue; }
      if (/^\s*(---+|\*\s*\*\s*\*|___+)\s*$/.test(line)) { out.push('<hr>'); i++; continue; }
      if (/^\s*>/.test(line)) {
        var quote = []; while (i < lines.length && /^\s*>/.test(lines[i])) quote.push(lines[i++].replace(/^\s*>\s?/, ''));
        out.push('<blockquote>' + quote.map(function (x) { return '<p>' + inline(x) + '</p>'; }).join('') + '</blockquote>'); continue;
      }
      var marker = line.match(/^(\s*)([-*+] |\d+[.] )(.*)$/);
      if (marker) {
        var ordered = /^\d+[.] /.test(marker[2]), items = [];
        while (i < lines.length) {
          var m = lines[i].match(/^(\s*)([-*+] |\d+[.] )(.*)$/);
          if (!m || (/\d+[.] /.test(m[2])) !== ordered || m[1].length !== marker[1].length) break;
          items.push(m[3]); i++;
        }
        var tag = ordered ? 'ol' : 'ul'; out.push('<' + tag + '>' + items.map(function (x) { return '<li>' + inline(x) + '</li>'; }).join('') + '</' + tag + '>'); continue;
      }
      var para = [line]; i++;
      while (i < lines.length && lines[i].trim() && !/^\s*```/.test(lines[i]) && !/^\s*\$\$\s*$/.test(lines[i]) && !/^\s*#{1,6}\s+/.test(lines[i]) && !/^\s*>/.test(lines[i]) && !/^(\s*)([-*+] |\d+[.] )/.test(lines[i])) para.push(lines[i++]);
      out.push('<p>' + inline(para.join(' ').trim()) + '</p>');
    }
    return out.join('\n');
  }

  function buildCard(item) {
    var card = document.createElement('article'); card.className = 'faq-card';
    card.dataset.week = String(item.week); card.dataset.search = (item.question + ' ' + item.answer).toLowerCase();
    var button = document.createElement('button'); button.className = 'faq-question'; button.type = 'button'; button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<span class="week-badge">Week ' + String(item.week).padStart(2, '0') + '</span><span>' + escapeHtml(item.question) + '</span>';
    var answer = document.createElement('div'); answer.className = 'faq-answer'; answer.innerHTML = renderMarkdown(item.answer);
    button.addEventListener('click', function () { var open = card.classList.toggle('is-open'); button.setAttribute('aria-expanded', String(open)); });
    card.appendChild(button); card.appendChild(answer); return card;
  }

  function refresh() {
    var query = (search.value || '').toLowerCase().trim();
    var phrases = [];
    var phrasePattern = /"([^"]+)"/g;
    var phraseMatch;
    while ((phraseMatch = phrasePattern.exec(query))) phrases.push(phraseMatch[1].trim());
    var terms = query.replace(phrasePattern, ' ').match(/\S+/g) || [];
    var wanted = scope.value === 'current' ? currentWeek : 'all';
    var shown = 0;
    entries.forEach(function (entry) {
      var text = entry.card.dataset.search;
      var matchesPhrase = phrases.every(function (phrase) { return phrase && text.indexOf(phrase) !== -1; });
      var termMatch = !terms.length || terms.some(function (term) { return text.indexOf(term) !== -1; });
      var visible = (wanted === 'all' || entry.card.dataset.week === wanted) && (!query || (matchesPhrase && termMatch));
      entry.card.hidden = !visible; if (visible) shown++;
    });
    count.textContent = shown + ' result' + (shown === 1 ? '' : 's'); empty.hidden = shown !== 0;
  }

  function setAll(open) { entries.forEach(function (entry) { if (!entry.card.hidden) { entry.card.classList.toggle('is-open', open); entry.card.querySelector('.faq-question').setAttribute('aria-expanded', String(open)); } }); }

  fetch('./faqs.json').then(function (response) { if (!response.ok) throw new Error('Could not load faqs.json'); return response.json(); }).then(function (data) {
    data.weeks.forEach(function (week) { week.faqs.forEach(function (faq) { var item = { week: week.week, question: faq.question, answer: faq.answer }; var card = buildCard(item); list.appendChild(card); entries.push({ card: card }); }); });
    scope.addEventListener('change', refresh); search.addEventListener('input', refresh); expand.addEventListener('click', function () { setAll(true); }); collapse.addEventListener('click', function () { setAll(false); }); refresh();
  }).catch(function (error) { count.textContent = error.message + '. Start a local web server from the project root.'; });
}());
