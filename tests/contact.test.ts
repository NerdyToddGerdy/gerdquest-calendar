import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Issue #22: one public contact address, used by every site page's footer and
// by the Contact sections of the privacy policy and terms.
const CONTACT = 'toadimous+calendarquest@gmail.com';
const PAGES = ['index.html', '404.html', 'privacy.html', 'terms.html'];

describe('contact address', () => {
  it.each(PAGES)('%s footer Contact link is the email address', (page) => {
    const html = readFileSync(page, 'utf8');
    expect(html).toContain(`<a href="mailto:${CONTACT}">Contact</a>`);
  });

  it.each(['privacy.html', 'terms.html'])('%s Contact section shows the address', (page) => {
    const html = readFileSync(page, 'utf8');
    const section = html.slice(html.indexOf('<h2>Contact</h2>'));
    expect(section).toContain(`>${CONTACT}</a>`);
  });

  it('every mailto link on the site uses the same address', () => {
    for (const page of PAGES) {
      const addrs = [...readFileSync(page, 'utf8').matchAll(/mailto:([^"?]+)/g)].map((m) => m[1]);
      for (const a of addrs) expect(a).toBe(CONTACT);
    }
  });
});
