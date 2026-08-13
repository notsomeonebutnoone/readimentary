import React from 'react';
import { ArrowLeft, Mail } from 'lucide-react';

const content = {
  '/privacy': {
    eyebrow: 'Legal draft',
    title: 'Privacy Policy',
    body: 'Readimentary processes uploaded PDFs in your browser and stores PDF files in browser storage. Account and subscription records are handled by configured service providers. This placeholder must receive final legal review before launch.'
  },
  '/terms': {
    eyebrow: 'Legal draft',
    title: 'Terms of Service',
    body: 'These draft terms are a launch placeholder and do not yet form final production terms. They must be reviewed and approved by qualified legal counsel before paid subscriptions are enabled.'
  },
  '/support': {
    eyebrow: 'Reader support',
    title: 'How can we help?',
    body: 'For account, billing, or PDF-reading help, contact the configured Readimentary support address. Include the browser you use and a short description of the issue. Do not email sensitive payment information.'
  },
  '/contact': {
    eyebrow: 'Contact',
    title: 'Talk with Readimentary',
    body: 'Questions about reading workflows, subscriptions, or future team access are welcome. Use the support address below and the team will reply when support operations are active.'
  }
};

export const STATIC_PATHS = Object.keys(content);

export default function StaticPage({ path, supportEmail }) {
  const page = content[path];
  if (!page) return null;
  return (
    <main className="min-h-screen bg-[#050505] px-5 py-10 text-white sm:px-8 md:py-20">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/55 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-500"><ArrowLeft size={15} /> Back to Readimentary</a>
        <article className="mt-12 rounded-3xl border border-white/10 bg-white/[0.025] p-7 md:p-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-500">{page.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">{page.title}</h1>
          <p className="mt-7 text-base leading-8 text-white/60">{page.body}</p>
          <a href={`mailto:${supportEmail}`} className="mt-8 inline-flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-sm font-bold text-amber-400 hover:bg-amber-500/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-500"><Mail size={16} /> {supportEmail}</a>
        </article>
      </div>
    </main>
  );
}
