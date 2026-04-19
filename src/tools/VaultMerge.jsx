import { useState } from 'react';
import ToolShell from '../components/ToolShell';
import KpiCard from '../components/KpiCard';
import { Section, Btn, InfoBox } from '../components/FormControls';
import { T, fmtN } from '../shared';

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return { headers: [], rows: [] };
  const splitLine = line => {
    const r = []; let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { if (inQ && line[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
      else if (c === ',' && !inQ) { r.push(cur); cur = ''; }
      else cur += c;
    }
    r.push(cur); return r;
  };
  const headers = splitLine(lines[0]);
  const rows = lines.slice(1).map(l => { const vals = splitLine(l); const obj = {}; headers.forEach((h, i) => obj[h] = vals[i] || ''); return obj; });
  return { headers, rows };
}

function DropZone({ id, label, onFile, loaded, filename }) {
  return (
    <div onClick={() => document.getElementById(id).click()} style={{
      border: `2px dashed ${loaded ? T.green : T.border}`,
      borderRadius: T.radius, padding: '28px 20px',
      textAlign: 'center', cursor: 'pointer',
      background: loaded ? T.greenSoft : T.surface2,
      transition: T.transition,
    }}>
      <div style={{
        fontSize: 14, fontWeight: 500,
        color: loaded ? T.greenDk : T.text2, marginBottom: 4,
      }}>{loaded ? `✓ ${filename || 'File loaded'}` : label}</div>
      <div style={{ fontSize: 12, color: T.text3 }}>Click to select .csv file</div>
      <input id={id} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => onFile(e.target.files[0])} />
    </div>
  );
}

export default function VaultMerge() {
  const [vwFile, setVwFile] = useState(null);
  const [vwName, setVwName] = useState('');
  const [braveFile, setBraveFile] = useState(null);
  const [braveName, setBraveName] = useState('');
  const [result, setResult] = useState(null);
  const [keepBlank, setKeepBlank] = useState(false);
  const [mergedRows, setMergedRows] = useState(null);

  const handleFile = (file, setter, setName) => {
    if (!file) return;
    setName(file.name);
    const reader = new FileReader();
    reader.onload = e => setter(parseCSV(e.target.result));
    reader.readAsText(file, 'UTF-8');
  };

  const merge = () => {
    if (!vwFile || !braveFile) return;
    const normalize = url => {
      try { let u = url.trim().toLowerCase(); if (!/^https?:\/\//i.test(u)) u = 'https://' + u; const p = new URL(u); return p.hostname.replace(/^www\./, '') + p.pathname.replace(/\/+$/, ''); }
      catch { return url.trim().toLowerCase(); }
    };
    const convert = r => ({ folder: '', favorite: '', type: 'login', name: r.name || '', notes: r.note || '', fields: '', reprompt: '0', archivedDate: '', login_uri: r.url || '', login_username: r.username || '', login_password: r.password || '', login_totp: '' });
    const braveFiltered = braveFile.rows.filter(r => keepBlank || r.password?.trim());
    const skipped = braveFile.rows.length - braveFiltered.length;
    const combined = [...vwFile.rows, ...braveFiltered.map(convert)];
    const key = r => [normalize(r.login_uri || ''), (r.login_username || '').toLowerCase().trim(), (r.login_password || '').trim()].join('|||');
    const seen = new Set(); const merged = []; let dupes = 0;
    for (const row of combined) { const k = key(row); if (seen.has(k)) { dupes++; continue; } seen.add(k); merged.push(row); }
    setResult({ merged: merged.length, dupes, skipped, vw: vwFile.rows.length, brave: braveFile.rows.length });
    setMergedRows(merged);
  };

  const download = () => {
    if (!mergedRows?.length) return;
    const headers = Object.keys(mergedRows[0]);
    const csv = [
      headers.join(','),
      ...mergedRows.map(r => headers.map(h => {
        const v = r[h] || '';
        return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
      }).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'vaultwarden_merged.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolShell
      title="VaultMerge"
      subtitle="Merge Brave passwords into a Vaultwarden export"
    >
      <div style={{
        background: T.white, borderRadius: T.radiusLg,
        border: `1px solid ${T.border}`, padding: '24px 26px',
        maxWidth: 780,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text3, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Step 1 · Vaultwarden
            </div>
            <DropZone id="vw-file" label="Upload Vaultwarden CSV" filename={vwName}
              onFile={f => handleFile(f, setVwFile, setVwName)} loaded={!!vwFile} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text3, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Step 2 · Brave
            </div>
            <DropZone id="brave-file" label="Upload Brave CSV" filename={braveName}
              onFile={f => handleFile(f, setBraveFile, setBraveName)} loaded={!!braveFile} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, marginBottom: 16 }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: T.text2, cursor: 'pointer' }}>
            <input type="checkbox" checked={keepBlank} onChange={e => setKeepBlank(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: T.accent }} />
            Keep entries with blank passwords
          </label>
          <Btn onClick={merge} disabled={!vwFile || !braveFile}>
            Merge passwords
          </Btn>
        </div>

        {result && (
          <>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 16, marginBottom: 16,
            }}>
              <KpiCard label="Vaultwarden" value={fmtN(result.vw)} useMono={false} />
              <KpiCard label="Brave" value={fmtN(result.brave)} useMono={false} />
              <KpiCard label="Duplicates" value={fmtN(result.dupes)} useMono={false} />
              <KpiCard label="Final merged" value={fmtN(result.merged)} useMono={false} />
            </div>
            <InfoBox variant="success">
              Merge complete. {result.dupes} duplicates removed, {result.skipped} blank-password entries skipped.
            </InfoBox>
            <Btn onClick={download}>Download merged CSV</Btn>
          </>
        )}

        {!result && (
          <div style={{
            marginTop: 20, padding: '14px 16px',
            background: T.surface2, borderRadius: T.radius,
            fontSize: 13, color: T.text3, lineHeight: 1.6,
          }}>
            Everything runs in your browser — no data leaves your machine.
            Upload both files above, then merge.
          </div>
        )}
      </div>
    </ToolShell>
  );
}
