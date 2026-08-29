// V2.1 — ByteAndBook AI Assistant. Dynamically imported by
// ChatLauncher.astro's bootstrap script on first interaction (see that
// file's comment for why) — everything the widget needs at runtime lives
// in this one module so the rest of the site pays nothing for it until
// a visitor actually opens the chat.
//
// Talks only to /api/chat.php (see public/api/chat.php) — never calls an
// AI provider directly from the browser, and renders every answer as
// plain text (never innerHTML) so a model response can never inject
// markup into the page.

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  ok: boolean;
  answer?: string;
  suggestedAction?: { type: 'start_project' | 'email'; service?: string } | null;
  error?: string;
}

const HISTORY_KEY = 'bb-chat-history';
const MAX_HISTORY_MESSAGES = 16; // 8 turns — bounded per CLAUDE.md's chat-history rule
const EMAIL = 'info@byteandbook.com';

function loadHistory(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(history: ChatMessage[]): void {
  try {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-MAX_HISTORY_MESSAGES)));
  } catch {
    // sessionStorage unavailable (private mode / quota) — chat still
    // works for this page view, it just won't persist across navigation.
  }
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let mounted = false;

export function mountChatbot(): void {
  if (mounted) return;

  const launcher = document.getElementById('chat-launcher') as HTMLButtonElement | null;
  const panel = document.getElementById('chat-panel');
  const closeBtn = panel?.querySelector<HTMLButtonElement>('[data-chat-close]');
  const messagesEl = panel?.querySelector<HTMLElement>('[data-chat-messages]');
  const statusEl = panel?.querySelector<HTMLElement>('[data-chat-status]');
  const chipsEl = panel?.querySelector<HTMLElement>('[data-chat-chips]');
  const form = panel?.querySelector<HTMLFormElement>('[data-chat-form]');
  const input = panel?.querySelector<HTMLTextAreaElement>('[data-chat-input]');
  const sendBtn = panel?.querySelector<HTMLButtonElement>('[data-chat-send]');

  if (!launcher || !panel || !closeBtn || !messagesEl || !statusEl || !form || !input || !sendBtn) {
    return;
  }
  mounted = true;

  let lastFocused: HTMLElement | null = null;
  let sending = false;
  const history = loadHistory();

  function appendBubble(
    role: 'user' | 'assistant',
    text: string,
    actions?: { startProject?: string | true; email?: boolean }
  ) {
    const bubble = document.createElement('div');
    bubble.className = `chat-message chat-message-${role}`;
    const p = document.createElement('p');
    p.textContent = text; // plain text only — never render model output as HTML
    bubble.appendChild(p);

    if (actions?.startProject) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chat-inline-action';
      btn.textContent = 'Start a Project';
      btn.setAttribute('data-start-project-trigger', '');
      if (typeof actions.startProject === 'string') {
        btn.setAttribute('data-preselect-service', actions.startProject);
      }
      btn.addEventListener('click', closePanel);
      bubble.appendChild(btn);
    }
    if (actions?.email) {
      const link = document.createElement('a');
      link.className = 'chat-inline-action chat-inline-action-outline';
      link.href = `mailto:${EMAIL}`;
      link.textContent = `Email ${EMAIL}`;
      bubble.appendChild(link);
    }

    messagesEl!.appendChild(bubble);
    messagesEl!.scrollTop = messagesEl!.scrollHeight;
  }

  // Continue an in-progress conversation across page navigation within
  // the same tab session (transient sessionStorage, never persisted
  // permanently — see CLAUDE.md's Privacy section).
  if (history.length > 0) {
    chipsEl?.remove();
    for (const msg of history) appendBubble(msg.role, msg.content);
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closePanel();
    }
  }

  function openPanel() {
    panel!.hidden = false;
    launcher!.setAttribute('aria-expanded', 'true');
    lastFocused = document.activeElement as HTMLElement | null;
    document.addEventListener('keydown', onKeydown);
    requestAnimationFrame(() => {
      panel!.classList.add('is-visible');
      input!.focus();
    });
  }

  function closePanel() {
    panel!.classList.remove('is-visible');
    launcher!.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', onKeydown);
    const finish = () => {
      panel!.hidden = true;
    };
    if (prefersReducedMotion()) finish();
    else setTimeout(finish, 200);
    lastFocused?.focus();
  }

  launcher.addEventListener('click', () => {
    if (panel!.hidden) openPanel();
    else closePanel();
  });
  closeBtn.addEventListener('click', closePanel);

  chipsEl?.querySelectorAll<HTMLButtonElement>('[data-chat-chip]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const question = chip.dataset.chatChip;
      if (question) void sendMessage(question);
    });
  });

  // Enable the input now that the module has actually mounted.
  input.disabled = false;
  sendBtn.disabled = false;
  input.placeholder = 'Ask about services, process, or getting started…';

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form!.requestSubmit();
    }
  });
  input.addEventListener('input', () => {
    input!.style.height = 'auto';
    input!.style.height = `${Math.min(input!.scrollHeight, 120)}px`;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input!.value.trim();
    if (!value) return;
    void sendMessage(value);
  });

  function showFailure() {
    statusEl!.textContent = '';
    appendBubble(
      'assistant',
      "I'm having trouble answering right now. You can still start a project or email info@byteandbook.com.",
      { startProject: true, email: true }
    );
  }

  async function sendMessage(text: string) {
    if (sending) return;
    sending = true;
    chipsEl?.remove();

    appendBubble('user', text);
    history.push({ role: 'user', content: text });
    saveHistory(history);

    input!.value = '';
    input!.style.height = 'auto';
    input!.disabled = true;
    sendBtn!.disabled = true;
    statusEl!.textContent = 'Thinking…';

    try {
      // Only the bounded history *before* this turn is sent — the server
      // re-derives the full turn from `message` + `history`.
      const response = await fetch('/api/chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history.slice(0, -1) }),
      });

      let payload: ChatResponse | null = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (response.ok && payload?.ok) {
        statusEl!.textContent = '';
        const answer = payload.answer || "I don't have an answer for that right now.";
        const suggested = payload.suggestedAction;
        appendBubble('assistant', answer, {
          startProject: suggested?.type === 'start_project' ? suggested.service || true : undefined,
          email: suggested?.type === 'email',
        });
        history.push({ role: 'assistant', content: answer });
        saveHistory(history);
      } else if (response.status === 429) {
        statusEl!.textContent = '';
        appendBubble('assistant', "You're sending messages a little fast — please wait a moment and try again.");
      } else {
        showFailure();
      }
    } catch {
      showFailure();
    } finally {
      sending = false;
      input!.disabled = false;
      sendBtn!.disabled = false;
      input!.focus();
    }
  }

  // The click that reached the bootstrap's dynamic import was itself the
  // opening click — complete that gesture now that mounting is done.
  openPanel();
}
