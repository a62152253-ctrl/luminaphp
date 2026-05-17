export function exportAppointmentsCSV(appointments, filename = 'wizyty.csv') {
  const headers = ['Data', 'Godzina', 'Klient', 'Usługa', 'Pracownik', 'Cena (zł)', 'Status'];

  const statusPl = {
    pending: 'Oczekująca', zaplanowana: 'Zaplanowana', potwierdzona: 'Potwierdzona',
    confirmed: 'Potwierdzona', 'w trakcie': 'W trakcie', zakończona: 'Zakończona',
    completed: 'Zakończona', cancelled: 'Anulowana', anulowana: 'Anulowana',
    'nie przyszedł': 'Nie przyszedł',
  };

  const rows = appointments.map(a => [
    a.date    || '',
    a.time    || '',
    (a.clientName  || '').replace(/[",\n]/g, ' '),
    (a.serviceName || '').replace(/[",\n]/g, ' '),
    (a.staffName   || '').replace(/[",\n]/g, ' '),
    a.price   || 0,
    statusPl[a.status] || a.status || '',
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
