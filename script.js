const page = document.body.dataset.page || 'index';
const DEFAULT_WHATSAPP_NUMBER = '6285159884344';
const GUEST_DATA = [
  {
    id: '1',
    nama_tamu: 'Athar Waldan Putera Erfian',
    instansi: 'Siswa SMKN 6 Kota Tangerang Selatan',
    kategori: 'Siswa',
    no_whatsapp: '082133416201'
  },
  {
    id: '2',
    nama_tamu: 'buk dinda',
    instansi: 'Guru SMKN 6 Kota Tangerang Selatan',
    kategori: 'Guru',
    no_whatsapp: '082260060509'
  },
  {
    id: '3',
    nama_tamu: 'Siti Rahmawati',
    instansi: 'Institut Teknologi Bandung',
    kategori: 'Universitas',
    no_whatsapp: '085159884344'
  },
  {
    id: '4',
    nama_tamu: 'Ahmad Fauzi',
    instansi: 'Alumni Angkatan 2022 - Software Engineer',
    kategori: 'Alumni',
    no_whatsapp: '085159884344'
  },
  {
    id: '5',
    nama_tamu: 'Dian Pratama, S.T.',
    instansi: 'PT Astra International Tbk',
    kategori: 'Perusahaan',
    no_whatsapp: '085159884344'
  }
];
let guestRecords = [];

function normalizeWhatsAppNumber(value) {
  const digits = (value || '').replace(/\D/g, '');
  if (!digits) {
    return DEFAULT_WHATSAPP_NUMBER;
  }
  if (digits.startsWith('62')) {
    return digits;
  }
  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`;
  }
  return digits;
}

function getQueryValue(name, fallback = '') {
  const params = new URLSearchParams(window.location.search);
  const value = params.get(name);
  return value ? decodeURIComponent(value) : fallback;
}

function renderIndexContent() {
  const recipientName = getQueryValue('to', 'Bapak/Ibu/Saudara/i');
  const recipientCategory = getQueryValue('kategori', 'Tamu Undangan');
  const recipientInstansi = getQueryValue('instansi', 'Instansi Mitra');

  const recipientNode = document.getElementById('recipientName');
  const metaNode = document.getElementById('recipientMeta');
  const titleNode = document.getElementById('eventTitle');
  const headingNode = document.getElementById('eventHeading');

  if (recipientNode) {
    recipientNode.textContent = recipientName;
  }

  if (metaNode) {
    metaNode.textContent = `${recipientCategory} • ${recipientInstansi}`;
  }

  if (titleNode) {
    titleNode.textContent = 'Edu Fair & Career Day 2026';
  }

  if (headingNode) {
    headingNode.textContent = 'Undangan Resmi';
  }

  const messageText = document.getElementById('messageText');
  if (messageText) {
    messageText.textContent = `Kami mengundang Bapak/Ibu/Saudara/i ${recipientName} untuk hadir dalam acara Edu Fair & Career Day 2026.`;
  }

  const ctaLink = document.getElementById('ctaLink');
  if (ctaLink) {
    ctaLink.href = `https://wa.me/${DEFAULT_WHATSAPP_NUMBER}?text=${encodeURIComponent(
      `Yth. ${recipientName}\nKami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam acara Edu Fair & Career Day 2026.\nKlik tautan berikut: ${window.location.href}`
    )}`;
  }
}

function parseCSV(csvText) {
  const rows = [];
  let current = '';
  let field = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i += 1) {
    const char = csvText[i];
    const next = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (field || row.length) {
        row.push(field);
        if (row.some((cell) => cell.trim() !== '')) {
          rows.push(row);
        }
      }
      row = [];
      field = '';
      if (char === '\r' && next === '\n') {
        i += 1;
      }
    } else {
      field += char;
    }
    current += char;
  }

  if (field || row.length) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== '')) {
      rows.push(row);
    }
  }

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((values) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = (values[index] || '').trim();
    });
    return obj;
  });
}

function buildInviteLink(record) {
  const targetUrl = new URL('index.html', window.location.href);
  targetUrl.searchParams.set('to', record.nama_tamu || 'Bapak/Ibu/Saudara/i');
  targetUrl.searchParams.set('instansi', record.instansi || 'Instansi Mitra');
  targetUrl.searchParams.set('kategori', record.kategori || 'Tamu Undangan');
  return targetUrl.href;
}

function generateWhatsAppMessage(record) {
  const link = buildInviteLink(record);
  return `Yth. ${record.nama_tamu}\nKami mengundang Anda untuk hadir dalam acara Edu Fair & Career Day 2026.\nInstansi: ${record.instansi}\nKategori: ${record.kategori}\nKlik tautan undangan: ${link}`;
}

function renderGuests(records) {
  const tableBody = document.getElementById('guestTableBody');
  const emptyState = document.getElementById('emptyState');

  if (!tableBody) {
    return;
  }

  guestRecords = records;
  tableBody.innerHTML = '';
  const search = (document.getElementById('guestSearch')?.value || '').trim().toLocaleLowerCase('id');
  const selectedCategory = document.getElementById('categoryFilter')?.value || '';
  const filteredRecords = records.filter((record) => {
    const searchable = [record.nama_tamu, record.instansi, record.no_whatsapp, record.kategori]
      .join(' ')
      .toLocaleLowerCase('id');
    return searchable.includes(search) && (!selectedCategory || record.kategori === selectedCategory);
  });

  filteredRecords.forEach((record) => {
    const row = document.createElement('tr');
    [record.id, record.nama_tamu, record.instansi, record.kategori, record.no_whatsapp].forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value || '-';
      row.appendChild(cell);
    });

    const actionCell = document.createElement('td');
    const sendButton = document.createElement('button');
    sendButton.className = 'send-btn';
    sendButton.type = 'button';
    sendButton.textContent = 'Kirim WhatsApp';
    sendButton.addEventListener('click', () => {
      const phone = normalizeWhatsAppNumber(record.no_whatsapp || DEFAULT_WHATSAPP_NUMBER);
      const message = encodeURIComponent(generateWhatsAppMessage(record));
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank', 'noopener,noreferrer');
    });
    actionCell.appendChild(sendButton);
    row.appendChild(actionCell);
    tableBody.appendChild(row);
  });

  if (emptyState) {
    emptyState.hidden = filteredRecords.length > 0;
  }

  const totalNode = document.getElementById('totalGuests');
  const categoriesNode = document.getElementById('totalCategories');
  const readyNode = document.getElementById('readyGuests');
  const countNode = document.getElementById('guestCount');
  const filterNode = document.getElementById('categoryFilter');
  const categories = [...new Set(records.map((record) => record.kategori).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'id'));

  if (totalNode) totalNode.textContent = String(records.length);
  if (categoriesNode) categoriesNode.textContent = String(categories.length);
  if (readyNode) readyNode.textContent = String(records.filter((record) => record.no_whatsapp).length);
  if (countNode) countNode.textContent = `Menampilkan ${filteredRecords.length} dari ${records.length} tamu`;

  if (filterNode) {
    const currentCategory = filterNode.value;
    filterNode.replaceChildren(new Option('Semua kategori', ''));
    categories.forEach((category) => filterNode.add(new Option(category, category)));
    filterNode.value = categories.includes(currentCategory) ? currentCategory : '';
  }
}

function setAdminStatus(message, isError = false) {
  const status = document.getElementById('adminStatus');
  if (!status) {
    return;
  }
  status.textContent = message;
  status.hidden = !message;
  status.classList.toggle('admin-status--error', isError);
}

async function loadGuestData() {
  const fileInput = document.getElementById('csvFile');

  if (fileInput && fileInput.files && fileInput.files[0]) {
    try {
      const file = fileInput.files[0];
      const records = parseCSV(await file.text());
      if (!records.length) {
        setAdminStatus('File CSV kosong atau formatnya tidak sesuai. Periksa nama kolom dan data tamu.', true);
        renderGuests([]);
        return;
      }
      setAdminStatus(`Data berhasil dimuat dari ${file.name}.`);
      renderGuests(records);
    } catch (error) {
      setAdminStatus('File CSV gagal dibaca. Coba pilih file CSV yang valid.', true);
      renderGuests([]);
    }
    return;
  }

  setAdminStatus('Data tamu dimuat dari script.js.');
  renderGuests(GUEST_DATA);
}

function setupGuestControls() {
  const search = document.getElementById('guestSearch');
  const categoryFilter = document.getElementById('categoryFilter');
  const fileInput = document.getElementById('csvFile');

  search?.addEventListener('input', () => renderGuests(guestRecords));
  categoryFilter?.addEventListener('change', () => renderGuests(guestRecords));
  fileInput?.addEventListener('change', () => loadGuestData());
}

function setupRsvpForm() {
  const form = document.getElementById('rsvpForm');
  const status = document.getElementById('rsvpStatus');

  if (!form || !status) {
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = (formData.get('name') || 'Tamu').toString();
    const attendance = (formData.get('attendance') || 'Hadir').toString();
    const note = (formData.get('note') || '').toString();

    status.textContent = `Terima kasih, ${name}. Konfirmasi Anda: ${attendance}${note ? ` — ${note}` : ''}`;
    status.classList.add('visible');
    form.reset();
  });
}

function setupThemeToggle() {
  const savedTheme = localStorage.getItem('edu-fair-theme');
  const initialTheme = savedTheme === 'dark' ? 'dark' : 'light';
  document.body.dataset.theme = initialTheme;

  document.querySelectorAll('.theme-toggle').forEach((button) => {
    const updateButton = (theme) => {
      const isDark = theme === 'dark';
      button.setAttribute('aria-pressed', String(isDark));
      button.setAttribute('aria-label', isDark ? 'Aktifkan mode cerah' : 'Aktifkan mode gelap');
      button.querySelector('.theme-toggle__icon').textContent = isDark ? '☀️' : '🌙';
      button.querySelector('.theme-toggle__label').textContent = isDark ? 'Mode Cerah' : 'Mode Gelap';
    };

    updateButton(initialTheme);
    button.addEventListener('click', () => {
      const theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
      document.body.dataset.theme = theme;
      localStorage.setItem('edu-fair-theme', theme);
      document.querySelectorAll('.theme-toggle').forEach((toggle) => {
        toggle.setAttribute('aria-pressed', String(theme === 'dark'));
        toggle.setAttribute('aria-label', theme === 'dark' ? 'Aktifkan mode cerah' : 'Aktifkan mode gelap');
        toggle.querySelector('.theme-toggle__icon').textContent = theme === 'dark' ? '☀️' : '🌙';
        toggle.querySelector('.theme-toggle__label').textContent = theme === 'dark' ? 'Mode Cerah' : 'Mode Gelap';
      });
    });
  });
}

function initializePage() {
  setupThemeToggle();

  if (page === 'admin') {
    setupGuestControls();
    loadGuestData();
    return;
  }

  renderIndexContent();
  setupRsvpForm();
}

initializePage();
