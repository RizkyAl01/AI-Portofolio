import { PROFILE, CHAT_SUGGESTIONS } from '../data.js';
import { sound } from '../sound.js';

const STORAGE_USERNAME_KEY = 'rizkyos_chat_username';

const NUDGE_REPLIES = [
  'Woi! Jangan digoyang-goyang jendelanya, GPU inference lagi antre. Mau tanya apa soal Rizky?',
  'Hadir, hadir! Layarnya sampai ikut getar. Coba ketik pertanyaan soal Komdigi, LLM, atau proyek Graph-RAG Rizky.',
  'Siap komandan — status masih Online (Groq LLM + Supabase aktif). Klik salah satu Quick Prompt atau langsung ketik pesanmu.',
  'Nudge diterima. Tenang, RizkyBot tidak ketiduran seperti cron job hari Jumat sore. Ada yang bisa dibantu?'
];

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isSafeHttpUrl(url) {
  return /^https?:\/\/[^\s<>"'`]+$/i.test(url);
}

function formatInlineMarkdown(escapedLine) {
  const codeTokens = [];
  let text = escapedLine.replace(/`([^`\n]+)`/g, (_, code) => {
    const idx = codeTokens.length;
    codeTokens.push(`<code class="msn-code">${code}</code>`);
    return `\u0000CODE${idx}\u0000`;
  });

  // Markdown links: [label](https://...)
  const linkTokens = [];
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (match, label, rawUrl) => {
    const cleanUrl = rawUrl.replace(/&amp;/g, '&');
    if (!isSafeHttpUrl(cleanUrl)) return match;
    const idx = linkTokens.length;
    linkTokens.push(
      `<a class="msn-link" href="${escapeHtml(cleanUrl)}" target="_blank" rel="noopener noreferrer">${label}</a>`
    );
    return `\u0000LINK${idx}\u0000`;
  });

  // Bare URLs: https://... or http://...
  text = text.replace(/(https?:\/\/[^\s<]+)/g, (match) => {
    let urlPart = match;
    let trailing = '';
    while (/[.,;:!?)\]]$/.test(urlPart)) {
      trailing = urlPart.slice(-1) + trailing;
      urlPart = urlPart.slice(0, -1);
    }
    const cleanUrl = urlPart.replace(/&amp;/g, '&');
    if (!isSafeHttpUrl(cleanUrl)) return match;
    const idx = linkTokens.length;
    linkTokens.push(
      `<a class="msn-link" href="${escapeHtml(cleanUrl)}" target="_blank" rel="noopener noreferrer">${urlPart}</a>`
    );
    return `\u0000LINK${idx}\u0000${trailing}`;
  });

  // Bold (**text**) then italic (*text*)
  text = text.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/(^|[\s(])\*([^*\n]+)\*(?=$|[\s.,;:!?)])/g, '$1<em>$2</em>');

  text = text.replace(/\u0000LINK(\d+)\u0000/g, (_, idx) => linkTokens[Number(idx)] || '');
  text = text.replace(/\u0000CODE(\d+)\u0000/g, (_, idx) => codeTokens[Number(idx)] || '');
  return text;
}

function formatBotMarkdown(rawText) {
  const escaped = escapeHtml(rawText).replace(/\r\n?/g, '\n');
  const lines = escaped.split('\n');
  const blocks = [];
  let listType = null;
  let listItems = [];

  const flushList = () => {
    if (listType && listItems.length) {
      blocks.push({ type: listType, items: listItems });
    }
    listType = null;
    listItems = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    const ulMatch = trimmed.match(/^(?:[-*•])\s+(.+)$/);
    if (ulMatch) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listItems.push(formatInlineMarkdown(ulMatch[1]));
      continue;
    }

    const olMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (olMatch) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listItems.push(formatInlineMarkdown(olMatch[1]));
      continue;
    }

    flushList();
    blocks.push({ type: 'p', html: formatInlineMarkdown(line) });
  }
  flushList();

  if (!blocks.length) return '';

  // Render the first paragraph inline right after "RizkyBot AI says:" (authentic 1999 MSN flow)
  return blocks
    .map((blk, idx) => {
      if (blk.type === 'p') {
        if (idx === 0) return `<span class="msn-para-inline">${blk.html}</span>`;
        return `<p class="msn-para">${blk.html}</p>`;
      }
      const tag = blk.type === 'ol' ? 'ol' : 'ul';
      return `<${tag} class="msn-list">${blk.items.map((it) => `<li>${it}</li>`).join('')}</${tag}>`;
    })
    .join('');
}

function formatPlainText(rawText) {
  return escapeHtml(rawText).replace(/\r\n?/g, '\n').replace(/\n/g, '<br>');
}

function createSessionId() {
  return `web_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function formatTime(date = new Date()) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function loadSavedUsername() {
  try {
    const saved = localStorage.getItem(STORAGE_USERNAME_KEY);
    if (saved && saved.trim()) return saved.trim().slice(0, 32);
  } catch {
    // Ignore storage restriction
  }
  return 'Tamu';
}

function saveUsername(name) {
  try {
    localStorage.setItem(STORAGE_USERNAME_KEY, name);
  } catch {
    // Ignore storage restriction
  }
}

export const messengerApp = {
  id: 'messenger',
  title: 'RizkyBot AI - Conversation',
  icon: 'messenger',
  width: 470,
  height: 550,
  minWidth: 330,
  minHeight: 400,
  singleton: true,
  resizable: true,

  onOpen(containerEl, winApi, args = {}) {
    let sessionId = createSessionId();
    let username = loadSavedUsername();
    let busy = false;
    let showSuggestions = true;
    let openMenuName = null;
    let nudgeCount = 0;
    let lastNudgeReplyAt = 0;
    const activeTimers = new Set();
    const transcript = [];

    const suggestions =
      Array.isArray(CHAT_SUGGESTIONS) && CHAT_SUGGESTIONS.length
        ? CHAT_SUGGESTIONS
        : [
            'Ceritain pengalaman Rizky sebagai AI Engineer di Komdigi dong!',
            'Proyek LLM, Graph-RAG, atau fine-tuning apa saja yang paling menonjol?',
            'Apa saja sertifikasi resmi & keahlian teknis utama Rizky?'
          ];

    const botAddress = `${PROFILE?.handle || 'ai'}@rizky.os`;

    containerEl.innerHTML = `
      <div class="msn-app">
        <div class="win95-menubar msn-menubar" role="menubar">
          <div class="msn-menu-group">
            <button type="button" class="win95-menubar-item msn-menu-btn" data-menu="file" aria-haspopup="true"><u>F</u>ile</button>
            <div class="win95-menu-dropdown msn-menu-dropdown" data-dropdown="file" hidden>
              <button type="button" class="win95-menu-item msn-menu-item" data-action="new-session">New Session</button>
              <button type="button" class="win95-menu-item msn-menu-item" data-action="export-chat">Export Chat (.txt)...</button>
              <div class="win95-menu-sep"></div>
              <button type="button" class="win95-menu-item msn-menu-item" data-action="close">Close</button>
            </div>
          </div>
          <div class="msn-menu-group">
            <button type="button" class="win95-menubar-item msn-menu-btn" data-menu="actions" aria-haspopup="true"><u>A</u>ctions</button>
            <div class="win95-menu-dropdown msn-menu-dropdown" data-dropdown="actions" hidden>
              <button type="button" class="win95-menu-item msn-menu-item" data-action="send-nudge">Send a Nudge</button>
              <button type="button" class="win95-menu-item msn-menu-item" data-action="focus-name">Change Display Name</button>
              <button type="button" class="win95-menu-item msn-menu-item" data-action="toggle-prompts">Toggle Quick Prompts</button>
              <div class="win95-menu-sep"></div>
              <button type="button" class="win95-menu-item msn-menu-item" data-action="clear-log">Clear Window</button>
            </div>
          </div>
          <div class="msn-menu-group">
            <button type="button" class="win95-menubar-item msn-menu-btn" data-menu="help" aria-haspopup="true"><u>H</u>elp</button>
            <div class="win95-menu-dropdown msn-menu-dropdown" data-dropdown="help" hidden>
              <button type="button" class="win95-menu-item msn-menu-item" data-action="about">About RizkyBot Messenger 95...</button>
            </div>
          </div>
        </div>

        <div class="msn-buddy-bar">
          <div class="msn-buddy-left">
            <span class="msn-online-led" title="Online"></span>
            <div class="msn-buddy-meta">
              <div class="msn-buddy-to">To: <strong>RizkyBot AI</strong> &lt;${escapeHtml(botAddress)}&gt;</div>
              <div class="msn-buddy-status">Online · Groq LLM + Supabase Memory</div>
            </div>
          </div>
          <label class="msn-user-box">
            <span class="msn-user-label">Nama:</span>
            <input type="text" class="win95-field msn-username-input" maxlength="32" value="${escapeHtml(username)}" placeholder="Tamu" aria-label="Display Name">
          </label>
        </div>

        <div class="msn-chat-log win95-sunken win95-scrollbar win95-selectable" role="log" aria-live="polite" aria-label="Chat transcript"></div>

        <div class="msn-suggestions">
          <div class="msn-suggestions-label">Quick Prompts:</div>
          <div class="msn-chips">
            ${suggestions
              .map(
                (prompt, i) =>
                  `<button type="button" class="win95-btn win95-btn-sm msn-chip" data-prompt-idx="${i}">${escapeHtml(prompt)}</button>`
              )
              .join('')}
          </div>
        </div>

        <div class="msn-typing-bar" aria-live="polite">
          <span class="msn-typing-indicator" hidden>
            <span class="msn-typing-dots" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span>
            Rizky AI sedang mengetik...
          </span>
          <span class="msn-hint-text">Enter untuk kirim · Shift+Enter baris baru</span>
        </div>

        <form class="msn-composer" autocomplete="off">
          <textarea class="win95-field msn-input win95-scrollbar" rows="3" placeholder="Type a message..." aria-label="Pesan chat"></textarea>
          <div class="msn-composer-actions">
            <button type="submit" class="win95-btn msn-send-btn">Send</button>
            <button type="button" class="win95-btn msn-nudge-btn" title="Kirim Nudge klasik MSN Messenger">Nudge</button>
          </div>
        </form>
      </div>
    `;

    const rootEl = containerEl.querySelector('.msn-app');
    const chatLogEl = containerEl.querySelector('.msn-chat-log');
    const usernameInput = containerEl.querySelector('.msn-username-input');
    const suggestionsEl = containerEl.querySelector('.msn-suggestions');
    const typingIndicatorEl = containerEl.querySelector('.msn-typing-indicator');
    const hintTextEl = containerEl.querySelector('.msn-hint-text');
    const formEl = containerEl.querySelector('.msn-composer');
    const inputEl = containerEl.querySelector('.msn-input');
    const sendBtn = containerEl.querySelector('.msn-send-btn');
    const nudgeBtn = containerEl.querySelector('.msn-nudge-btn');

    function scheduleTimer(fn, delay) {
      const id = setTimeout(() => {
        activeTimers.delete(id);
        fn();
      }, delay);
      activeTimers.add(id);
      return id;
    }

    function setStatus(text) {
      if (typeof winApi?.setStatus === 'function') {
        winApi.setStatus(text);
      }
    }

    function scrollToBottom() {
      chatLogEl.scrollTop = chatLogEl.scrollHeight;
    }

    function appendJoinNotice(text) {
      const time = formatTime();
      transcript.push({ role: 'system', sender: 'SYSTEM', text, time });
      const row = document.createElement('div');
      row.className = 'msn-msg msn-msg-join';
      row.textContent = text;
      chatLogEl.appendChild(row);
      scrollToBottom();
    }

    function appendNudgeNotice(text) {
      const time = formatTime();
      transcript.push({ role: 'system', sender: 'NUDGE', text, time });
      const row = document.createElement('div');
      row.className = 'msn-msg msn-msg-nudge';
      row.textContent = text;
      chatLogEl.appendChild(row);
      scrollToBottom();
    }

    function appendMessage(role, text) {
      const time = formatTime();
      const sender = role === 'user' ? username || 'Tamu' : 'RizkyBot AI';
      transcript.push({ role, sender, text, time });

      const row = document.createElement('div');
      row.className = `msn-msg msn-msg-${role}`;

      if (role === 'bot') {
        row.innerHTML = `<span class="msn-sender msn-sender-bot">RizkyBot AI says:</span> <span class="msn-msg-body">${formatBotMarkdown(text)}</span> <span class="msn-time">[${escapeHtml(time)}]</span>`;
      } else if (role === 'user') {
        row.innerHTML = `<span class="msn-sender msn-sender-user">${escapeHtml(sender)} says:</span> <span class="msn-msg-body">${formatPlainText(text)}</span> <span class="msn-time">[${escapeHtml(time)}]</span>`;
      } else {
        row.innerHTML = `<span class="msn-sender msn-sender-error">System:</span> <span class="msn-msg-body">${formatPlainText(text)}</span> <span class="msn-time">[${escapeHtml(time)}]</span>`;
      }

      chatLogEl.appendChild(row);
      scrollToBottom();
    }

    function triggerNudge() {
      const shakeTarget = winApi?.el || rootEl;
      shakeTarget.classList.remove('msn-nudge-shake');
      // Force reflow so rapid nudges always replay the animation
      void shakeTarget.offsetWidth;
      shakeTarget.classList.add('msn-nudge-shake');
      scheduleTimer(() => {
        shakeTarget.classList.remove('msn-nudge-shake');
      }, 540);

      // Authentic retro multi-tone MSN nudge alert
      sound.playBeep(440, 0.06);
      scheduleTimer(() => sound.playBeep(587, 0.07), 75);
      scheduleTimer(() => sound.playBeep(440, 0.07), 160);

      appendNudgeNotice('Kamu baru saja mengirim Nudge ke RizkyBot!');
      setStatus(`Nudge terkirim · ${formatTime()}`);

      const now = Date.now();
      if (!busy && now - lastNudgeReplyAt > 1800) {
        lastNudgeReplyAt = now;
        const replyText = NUDGE_REPLIES[nudgeCount % NUDGE_REPLIES.length];
        nudgeCount += 1;
        scheduleTimer(() => {
          appendMessage('bot', replyText);
          sound.playMessage();
        }, 380);
      }
    }

    function setBusyState(state) {
      busy = state;
      inputEl.disabled = state;
      sendBtn.disabled = state;
      typingIndicatorEl.hidden = !state;
      hintTextEl.hidden = state;
      setStatus(state ? 'Rizky AI sedang mengetik...' : `${formatTime()} · Sesi ${sessionId.slice(-6)}`);
    }

    function startNewSession(isReset = false) {
      sessionId = createSessionId();
      chatLogEl.innerHTML = '';
      transcript.length = 0;
      appendJoinNotice('RizkyBot AI telah bergabung ke percakapan.');
      appendMessage(
        'bot',
        isReset
          ? 'Sesi obrolan baru dimulai. Silakan tanyakan apa saja soal pengalaman AI Engineer, proyek, atau latar belakang **Rizky Alviando**.'
          : 'Halo! Saya **RizkyBot AI**, asisten portofolio **Rizky Alviando** (AI Engineer di Komdigi, lulusan S1 Matematika ITS Cum Laude).\n\nTanyakan apa saja soal pengalaman kerja, fine-tuning LLM, Graph-RAG, sertifikasi, atau klik salah satu **Quick Prompt** di bawah.'
      );
      setStatus(`${formatTime()} · Online`);
      inputEl.focus();
    }

    function exportChatTxt() {
      const lines = [
        '==================================================',
        'RizkyBot Messenger 95 — Chat Transcript',
        `Session ID : ${sessionId}`,
        `User       : ${username}`,
        `Exported   : ${new Date().toLocaleString()}`,
        '==================================================',
        ''
      ];
      for (const entry of transcript) {
        lines.push(`[${entry.time}] ${entry.sender}:`);
        lines.push(entry.text);
        lines.push('');
      }
      const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
      link.href = url;
      link.download = `RizkyBot-Chat-${stamp}.txt`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      scheduleTimer(() => URL.revokeObjectURL(url), 1000);
      setStatus('Transcript diekspor ke .txt');
    }

    async function sendMessage(rawText) {
      const text = String(rawText || '').trim();
      if (!text || busy) return;

      username = (usernameInput.value || '').trim().slice(0, 32) || 'Tamu';
      usernameInput.value = username;
      saveUsername(username);

      appendMessage('user', text);
      inputEl.value = '';
      setBusyState(true);

      try {
        const response = await fetch('/api/web-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: sessionId,
            session_id: sessionId,
            username,
            text
          })
        });

        let data = null;
        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (response.ok && data && data.status === 'ok' && typeof data.reply === 'string') {
          appendMessage('bot', data.reply);
          sound.playMessage();
        } else if (response.status === 422) {
          appendMessage('error', 'Format pesan tidak valid (HTTP 422). Pastikan pesan tidak kosong.');
          sound.playError();
        } else if (response.status === 429) {
          appendMessage(
            'error',
            'Terlalu banyak permintaan (HTTP 429). Mohon tunggu sekitar 1 menit sebelum mencoba lagi.'
          );
          sound.playError();
        } else if (response.status === 503) {
          appendMessage(
            'error',
            'Layanan chatbot sementara tidak tersedia (HTTP 503). Silakan hubungi Rizky langsung via Email atau LinkedIn.'
          );
          sound.playError();
        } else {
          const detail = data?.detail ? ` (${String(data.detail)})` : '';
          appendMessage(
            'error',
            `Server mengalami kendala (HTTP ${response.status})${detail}. Coba beberapa saat lagi.`
          );
          sound.playError();
        }
      } catch {
        appendMessage(
          'error',
          'Tidak dapat terhubung ke endpoint /api/web-chat. Periksa koneksi jaringan atau status server FastAPI.'
        );
        sound.playError();
      } finally {
        setBusyState(false);
        inputEl.focus();
      }
    }

    function closeMenus() {
      openMenuName = null;
      rootEl.querySelectorAll('.msn-menu-dropdown').forEach((dd) => {
        dd.hidden = true;
      });
      rootEl.querySelectorAll('.msn-menu-btn').forEach((btn) => {
        btn.classList.remove('is-open');
      });
    }

    function toggleMenu(menuName) {
      if (openMenuName === menuName) {
        closeMenus();
        return;
      }
      closeMenus();
      openMenuName = menuName;
      const dd = rootEl.querySelector(`.msn-menu-dropdown[data-dropdown="${menuName}"]`);
      const btn = rootEl.querySelector(`.msn-menu-btn[data-menu="${menuName}"]`);
      if (dd) dd.hidden = false;
      if (btn) btn.classList.add('is-open');
    }

    rootEl.addEventListener('click', (e) => {
      const menuBtn = e.target.closest('.msn-menu-btn');
      if (menuBtn) {
        e.stopPropagation();
        sound.playClick();
        toggleMenu(menuBtn.dataset.menu);
        return;
      }

      const menuItem = e.target.closest('.msn-menu-item');
      if (menuItem) {
        e.stopPropagation();
        sound.playClick();
        const action = menuItem.dataset.action;
        closeMenus();
        if (action === 'new-session') {
          startNewSession(true);
        } else if (action === 'export-chat') {
          exportChatTxt();
        } else if (action === 'close') {
          winApi?.close?.();
        } else if (action === 'send-nudge') {
          triggerNudge();
        } else if (action === 'focus-name') {
          usernameInput.focus();
          usernameInput.select();
        } else if (action === 'toggle-prompts') {
          showSuggestions = !showSuggestions;
          suggestionsEl.hidden = !showSuggestions;
        } else if (action === 'clear-log') {
          chatLogEl.innerHTML = '';
          appendJoinNotice('Jendela percakapan dibersihkan (memori sesi tetap aktif).');
        } else if (action === 'about') {
          winApi?.os?.showDialog?.({
            title: 'About RizkyBot Messenger 95',
            icon: 'messenger',
            message:
              'RizkyBot Messenger 95 (Build 4.00.950)\n\nAsisten portofolio AI untuk Rizky Alviando.\nBackend: FastAPI + Groq LLM + Supabase Chat Memory.\nEndpoint: POST /api/web-chat',
            buttons: ['OK']
          });
        }
        return;
      }

      const chip = e.target.closest('.msn-chip');
      if (chip) {
        sound.playClick();
        const idx = Number(chip.dataset.promptIdx);
        const prompt = suggestions[idx];
        if (prompt && !busy) {
          sendMessage(prompt);
        }
        return;
      }

      if (openMenuName) closeMenus();
    });

    usernameInput.addEventListener('change', () => {
      const clean = usernameInput.value.trim().slice(0, 32) || 'Tamu';
      username = clean;
      usernameInput.value = clean;
      saveUsername(clean);
      setStatus(`Nama tampilan diubah ke "${clean}"`);
    });

    nudgeBtn.addEventListener('click', () => {
      triggerNudge();
    });

    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      sound.playClick();
      sendMessage(inputEl.value);
    });

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!busy && inputEl.value.trim()) {
          sendMessage(inputEl.value);
        }
      }
    });

    const onDocClick = (e) => {
      if (openMenuName && !rootEl.contains(e.target)) {
        closeMenus();
      }
    };
    const onDocKeydown = (e) => {
      if (e.key === 'Escape' && openMenuName) {
        closeMenus();
      }
    };

    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onDocKeydown);

    function handlePrefill(promptText, autoSend = true) {
      const clean = String(promptText || '').trim();
      if (!clean) return;
      winApi?.focus?.();
      inputEl.value = clean;
      inputEl.focus();
      if (autoSend && !busy) {
        scheduleTimer(() => {
          if (!busy) sendMessage(clean);
        }, 140);
      }
    }

    winApi?.onArgs?.((newArgs = {}) => {
      if (newArgs && newArgs.prefillPrompt) {
        handlePrefill(newArgs.prefillPrompt, newArgs.autoSend !== false);
      }
    });

    winApi?.onClose?.(() => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onDocKeydown);
      for (const id of activeTimers) clearTimeout(id);
      activeTimers.clear();
      if (winApi?.el) winApi.el.classList.remove('msn-nudge-shake');
    });

    startNewSession(false);

    if (args && args.prefillPrompt) {
      handlePrefill(args.prefillPrompt, args.autoSend !== false);
    }
  }
};
