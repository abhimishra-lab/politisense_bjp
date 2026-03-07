import * as XLSX from 'xlsx';
import { Contact, ImportResult, ColumnMapping } from '../types';

export function parseCSV(text: string): Record<string, string>[] {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    return lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((h, i) => { row[h] = vals[i] ?? ''; });
        return row;
    });
}

export function parseXLSX(buffer: ArrayBuffer): Record<string, string>[] {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
    return raw.map(row => {
        const out: Record<string, string> = {};
        Object.keys(row).forEach(k => { out[k] = String(row[k]); });
        return out;
    });
}

export function detectColumnMapping(headers: string[]): ColumnMapping {
    const mapping: ColumnMapping = {};
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');

    const matchers: { field: keyof ColumnMapping; aliases: string[] }[] = [
        { field: 'name', aliases: ['name', 'fullname', 'contactname', 'person'] },
        { field: 'role', aliases: ['role', 'designation', 'position', 'title', 'job'] },
        { field: 'whatsapp', aliases: ['whatsapp', 'whatsappnumber', 'phone', 'mobile', 'wa', 'contact'] },
        { field: 'email', aliases: ['email', 'emailaddress', 'mail', 'emailid'] },
        { field: 'telegram', aliases: ['telegram', 'telegramid', 'tg', 'telegramhandle'] },
    ];

    headers.forEach(h => {
        const norm = normalize(h);
        matchers.forEach(({ field, aliases }) => {
            if (!mapping[field] && aliases.some(a => norm.includes(a))) {
                mapping[field] = h;
            }
        });
    });

    return mapping;
}

export function rowsToContacts(
    rows: Record<string, string>[],
    mapping: ColumnMapping
): Contact[] {
    return rows
        .map((row, i) => ({
            id: `import-${Date.now()}-${i}`,
            name: mapping.name ? row[mapping.name] ?? '' : '',
            role: mapping.role ? row[mapping.role] ?? '' : '',
            whatsapp: mapping.whatsapp ? row[mapping.whatsapp] ?? '' : '',
            email: mapping.email ? row[mapping.email] ?? '' : '',
            telegram: mapping.telegram ? row[mapping.telegram] ?? '' : '',
        }))
        .filter(c => c.name.trim() !== '');
}

export function mergeContacts(
    existing: Contact[],
    incoming: Contact[]
): ImportResult {
    const added: Contact[] = [];
    const skipped: Contact[] = [];

    const isDuplicate = (c: Contact): boolean => {
        return existing.some(e =>
            (c.whatsapp && e.whatsapp && c.whatsapp === e.whatsapp) ||
            (c.email && e.email && c.email === e.email) ||
            (c.telegram && e.telegram && c.telegram === e.telegram)
        );
    };

    incoming.forEach(c => {
        if (isDuplicate(c)) {
            skipped.push(c);
        } else {
            added.push(c);
            existing.push(c);
        }
    });

    return { added: added.length, skipped: skipped.length, contacts: [...existing] };
}
