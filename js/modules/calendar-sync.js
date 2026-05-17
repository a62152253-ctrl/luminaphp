export function generateICS(events) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lumina//PL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];
  for (const ev of events) {
    const dtStart = formatICSDate(ev.date, ev.time);
    const dtEnd = formatICSDate(ev.date, ev.endTime || addHour(ev.time));
    lines.push(
      'BEGIN:VEVENT',
      `UID:${ev.id || Date.now()}@lumina.app`,
      `DTSTAMP:${formatICSDateNow()}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${escapeICS(ev.title || 'Wizyta Lumina')}`,
      `DESCRIPTION:${escapeICS(ev.description || '')}`,
      `LOCATION:${escapeICS(ev.location || '')}`,
      'END:VEVENT'
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function formatICSDate(date, time = '10:00') {
  const [y, m, d] = date.split('-');
  const [hh, mm] = time.split(':');
  return `${y}${m}${d}T${hh}${mm}00`;
}

function formatICSDateNow() {
  return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function addHour(time) {
  const [h, m] = time.split(':').map(Number);
  return `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function escapeICS(str) {
  return String(str).replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
}

export function downloadICS(content, filename = 'lumina-wizyty.ics') {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToGoogle(event) {
  const start = `${event.date.replace(/-/g, '')}T${event.time.replace(':', '')}00`;
  const end = `${event.date.replace(/-/g, '')}T${addHour(event.time).replace(':', '')}00`;
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', event.title || 'Wizyta Lumina');
  url.searchParams.set('dates', `${start}/${end}`);
  url.searchParams.set('details', event.description || '');
  url.searchParams.set('location', event.location || '');
  window.open(url.toString(), '_blank');
}

export function syncOutlook(event) {
  const ics = generateICS([event]);
  downloadICS(ics, 'wizyta.ics');
}

export function parseICS(text) {
  const events = [];
  const blocks = text.split('BEGIN:VEVENT');
  blocks.slice(1).forEach(block => {
    const summary = block.match(/SUMMARY:(.+)/)?.[1];
    const dtstart = block.match(/DTSTART:(\d{8}T\d{6})/)?.[1];
    if (summary && dtstart) {
      events.push({
        title: summary,
        date: `${dtstart.slice(0,4)}-${dtstart.slice(4,6)}-${dtstart.slice(6,8)}`,
        time: `${dtstart.slice(9,11)}:${dtstart.slice(11,13)}`,
      });
    }
  });
  return events;
}
