const API_BASE = 'http://localhost:5000/api/opportunities';

let allOpportunities = [];
let editingId = null;
let deletingId = null;

// ---------- Elements ----------
const listingItems = document.getElementById('listingItems');
const emptyState = document.getElementById('emptyState');
const resultCount = document.getElementById('resultCount');
const searchInput = document.getElementById('searchInput');
const departmentFilter = document.getElementById('departmentFilter');
const statusFilter = document.getElementById('statusFilter');

const detailOverlay = document.getElementById('detailOverlay');
const detailContent = document.getElementById('detailContent');
const detailCloseBtn = document.getElementById('detailCloseBtn');

const formOverlay = document.getElementById('formOverlay');
const formTitle = document.getElementById('formTitle');
const opportunityForm = document.getElementById('opportunityForm');
const formError = document.getElementById('formError');
const openCreateBtn = document.getElementById('openCreateBtn');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const formCloseBtn = document.getElementById('formCloseBtn');

const deleteOverlay = document.getElementById('deleteOverlay');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

const toast = document.getElementById('toast');

// ---------- Toast ----------
let toastTimer = null;
function showToast(message, isError = false) {
  toast.textContent = message;
  toast.classList.toggle('toast--error', isError);
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3200);
}

// ---------- Fetch & render ----------
async function loadOpportunities() {
  try {
    const res = await fetch(API_BASE);
    const body = await res.json();
    if (!res.ok || !body.success) throw new Error(body.message || 'Could not load opportunities.');
    allOpportunities = body.data;
    populateDepartmentFilter();
    renderList();
  } catch (err) {
    showToast(err.message || 'Could not reach the server. Is the backend running?', true);
    listingItems.innerHTML = '';
    emptyState.hidden = false;
    emptyState.textContent = 'Could not load opportunities. Check that the backend server is running.';
  }
}

function populateDepartmentFilter() {
  const current = departmentFilter.value;
  const departments = [...new Set(allOpportunities.map(o => o.department))].sort();
  departmentFilter.innerHTML = '<option value="">All departments</option>' +
    departments.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join('');
  departmentFilter.value = current;
}

function getFiltered() {
  const q = searchInput.value.trim().toLowerCase();
  const dept = departmentFilter.value;
  const status = statusFilter.value;

  return allOpportunities.filter(o => {
    const matchesQuery = !q ||
      o.title.toLowerCase().includes(q) ||
      o.required_skills.toLowerCase().includes(q) ||
      o.faculty_name.toLowerCase().includes(q);
    const matchesDept = !dept || o.department === dept;
    const matchesStatus = !status || o.status === status;
    return matchesQuery && matchesDept && matchesStatus;
  });
}

function renderList() {
  const filtered = getFiltered();
  resultCount.textContent = `${filtered.length} opportunit${filtered.length === 1 ? 'y' : 'ies'}`;

  if (filtered.length === 0) {
    listingItems.innerHTML = '';
    emptyState.hidden = false;
    emptyState.textContent = 'No opportunities match your search yet.';
    return;
  }
  emptyState.hidden = true;

  listingItems.innerHTML = filtered.map(o => `
    <article class="entry ${o.status === 'Closed' ? 'entry--closed' : ''}" data-id="${o.id}">
      <div>
        <div class="entry__title">${escapeHtml(o.title)}</div>
        <div class="entry__meta">
          <strong>${escapeHtml(o.faculty_name)}</strong> · ${escapeHtml(o.department)} · ${escapeHtml(o.research_area)}
        </div>
        <div class="entry__skills">
          ${splitSkills(o.required_skills).map(s => `<span class="tag">${escapeHtml(s)}</span>`).join('')}
        </div>
      </div>
      <div class="entry__side">
        <span class="pill ${o.status === 'Open' ? 'pill--open' : 'pill--closed'}">${o.status}</span>
        <span class="entry__deadline">Deadline <strong>${formatDate(o.application_deadline)}</strong></span>
        <span class="entry__deadline">${o.positions_available} position${o.positions_available == 1 ? '' : 's'}</span>
      </div>
    </article>
  `).join('');
}

function splitSkills(str) {
  return str.split(',').map(s => s.trim()).filter(Boolean);
}
function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------- Detail panel ----------
function openDetail(id) {
  const o = allOpportunities.find(x => x.id == id);
  if (!o) return;

  detailContent.innerHTML = `
    <div class="detail__dept">${escapeHtml(o.department)}</div>
    <h2>${escapeHtml(o.title)}</h2>
    <div class="detail__row"><strong>Faculty:</strong> ${escapeHtml(o.faculty_name)}</div>
    <div class="detail__row"><strong>Research area:</strong> ${escapeHtml(o.research_area)}</div>
    <div class="detail__row"><strong>Skills needed:</strong> ${escapeHtml(o.required_skills)}</div>
    <div class="detail__row"><strong>Positions:</strong> ${o.positions_available}</div>
    <div class="detail__row"><strong>Deadline:</strong> ${formatDate(o.application_deadline)}</div>
    <div class="detail__row"><strong>Status:</strong> <span class="pill ${o.status === 'Open' ? 'pill--open' : 'pill--closed'}">${o.status}</span></div>
    <p class="detail__desc">${escapeHtml(o.description)}</p>
    <div class="detail__actions">
      <button class="btn btn--ghost" id="editBtn">Edit</button>
      <button class="btn btn--ghost" id="toggleStatusBtn">Mark as ${o.status === 'Open' ? 'Closed' : 'Open'}</button>
      <button class="btn btn--danger" id="deleteBtn">Delete</button>
    </div>
  `;

  document.getElementById('editBtn').addEventListener('click', () => openForm(o));
  document.getElementById('toggleStatusBtn').addEventListener('click', () => toggleStatus(o));
  document.getElementById('deleteBtn').addEventListener('click', () => openDeleteConfirm(o));

  detailOverlay.hidden = false;
}
function closeDetail() { detailOverlay.hidden = true; }

async function toggleStatus(o) {
  const newStatus = o.status === 'Open' ? 'Closed' : 'Open';
  try {
    const res = await fetch(`${API_BASE}/${o.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const body = await res.json();
    if (!res.ok || !body.success) throw new Error(body.message || 'Could not update status.');
    showToast(`Marked as ${newStatus}.`);
    closeDetail();
    await loadOpportunities();
  } catch (err) {
    showToast(err.message, true);
  }
}

// ---------- Create / edit form ----------
function openForm(existing = null) {
  editingId = existing ? existing.id : null;
  formTitle.textContent = existing ? 'Edit research opportunity' : 'Post a research opportunity';
  formError.hidden = true;
  opportunityForm.reset();

  if (existing) {
    document.getElementById('title').value = existing.title;
    document.getElementById('description').value = existing.description;
    document.getElementById('research_area').value = existing.research_area;
    document.getElementById('department').value = existing.department;
    document.getElementById('faculty_name').value = existing.faculty_name;
    document.getElementById('required_skills').value = existing.required_skills;
    document.getElementById('positions_available').value = existing.positions_available;
    document.getElementById('application_deadline').value = existing.application_deadline.slice(0, 10);
    document.getElementById('status').value = existing.status;
  } else {
    document.getElementById('status').value = 'Open';
  }

  detailOverlay.hidden = true;
  formOverlay.hidden = false;
}
function closeForm() { formOverlay.hidden = true; editingId = null; }

opportunityForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.hidden = true;

  const payload = {
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim(),
    research_area: document.getElementById('research_area').value.trim(),
    department: document.getElementById('department').value.trim(),
    faculty_name: document.getElementById('faculty_name').value.trim(),
    required_skills: document.getElementById('required_skills').value.trim(),
    positions_available: Number(document.getElementById('positions_available').value),
    application_deadline: document.getElementById('application_deadline').value,
    status: document.getElementById('status').value
  };

  // Basic client-side validation, mirrors backend rules
  const missing = Object.entries(payload).filter(([k, v]) => v === '' || v === null || Number.isNaN(v));
  if (missing.length > 0) {
    formError.textContent = 'Please fill in every field before saving.';
    formError.hidden = false;
    return;
  }
  if (payload.positions_available < 1) {
    formError.textContent = 'Available positions must be at least 1.';
    formError.hidden = false;
    return;
  }

  try {
    const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;
    const method = editingId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const body = await res.json();

    if (!res.ok || !body.success) {
      formError.textContent = (body.errors && body.errors.join(' ')) || body.message || 'Could not save this opportunity.';
      formError.hidden = false;
      return;
    }

    showToast(editingId ? 'Opportunity updated.' : 'Opportunity posted.');
    closeForm();
    await loadOpportunities();
  } catch (err) {
    formError.textContent = 'Could not reach the server. Is the backend running?';
    formError.hidden = false;
  }
});

// ---------- Delete ----------
function openDeleteConfirm(o) {
  deletingId = o.id;
  document.getElementById('deleteWarning').textContent = `"${o.title}" will be permanently removed.`;
  deleteOverlay.hidden = false;
}
function closeDeleteConfirm() { deleteOverlay.hidden = true; deletingId = null; }

confirmDeleteBtn.addEventListener('click', async () => {
  if (!deletingId) return;
  try {
    const res = await fetch(`${API_BASE}/${deletingId}`, { method: 'DELETE' });
    const body = await res.json();
    if (!res.ok || !body.success) throw new Error(body.message || 'Could not delete opportunity.');
    showToast('Opportunity deleted.');
    closeDeleteConfirm();
    closeDetail();
    await loadOpportunities();
  } catch (err) {
    showToast(err.message, true);
  }
});

// ---------- Event wiring ----------
listingItems.addEventListener('click', (e) => {
  const card = e.target.closest('.entry');
  if (card) openDetail(card.dataset.id);
});
searchInput.addEventListener('input', renderList);
departmentFilter.addEventListener('change', renderList);
statusFilter.addEventListener('change', renderList);

detailCloseBtn.addEventListener('click', closeDetail);
detailOverlay.addEventListener('click', (e) => { if (e.target === detailOverlay) closeDetail(); });

openCreateBtn.addEventListener('click', () => openForm(null));
cancelFormBtn.addEventListener('click', closeForm);
formCloseBtn.addEventListener('click', closeForm);
formOverlay.addEventListener('click', (e) => { if (e.target === formOverlay) closeForm(); });

cancelDeleteBtn.addEventListener('click', closeDeleteConfirm);
deleteOverlay.addEventListener('click', (e) => { if (e.target === deleteOverlay) closeDeleteConfirm(); });

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDetail();
    closeForm();
    closeDeleteConfirm();
  }
});

// ---------- Init ----------
loadOpportunities();
