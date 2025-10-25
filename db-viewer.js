async function fetchRows() {
  const res = await fetch('/admin/registrations');
  if (!res.ok) throw new Error('Failed to fetch');
  const data = await res.json();
  return data.rows || [];
}

function renderRows(rows) {
  const container = document.getElementById('rows');
  const filter = (document.getElementById('filter').value || '').toLowerCase();
  if (!container) return;
  container.innerHTML = '';

  if (!rows.length) {
    container.textContent = 'No registrations yet.';
    return;
  }

  const table = document.createElement('table');
  table.className = 'registrations-table';
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Time</th><th>Parent</th><th>Email</th><th>Phone</th><th>Children</th><th>Consent</th><th>UUID</th></tr>';
  table.appendChild(thead);
  const tbody = document.createElement('tbody');

  rows.forEach(r => {
    const combined = `${r.parentFirst || ''} ${r.parentLast || ''} ${r.email || ''}`.toLowerCase();
    if (filter && !combined.includes(filter)) return;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${new Date(r.createdAt).toLocaleString()}</td>
      <td>${(r.parentFirst||'') + ' ' + (r.parentLast||'')}</td>
      <td>${r.email||''}</td>
      <td>${r.phone||''}</td>
      <td>${r.children||''}</td>
      <td>${r.consent||''}</td>
      <td><code style="font-size:0.8em;">${r.uuid||''}</code></td>
    `;
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

async function refresh() {
  const last = document.getElementById('last-updated');
  try {
    const rows = await fetchRows();
    renderRows(rows);
    if (last) last.textContent = `Updated: ${new Date().toLocaleTimeString()}`;
  } catch (err) {
    const container = document.getElementById('rows');
    if (container) container.textContent = 'Error loading registrations.';
    console.error(err);
  }
}

document.getElementById('refresh').addEventListener('click', refresh);
document.getElementById('filter').addEventListener('input', () => refresh());

// Initial load
refresh();

// Poll every 5 minutes
setInterval(refresh, 5 * 60 * 1000);
