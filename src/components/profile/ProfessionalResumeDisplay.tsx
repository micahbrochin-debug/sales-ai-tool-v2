'use client';
import React from 'react';
import type { ProspectProfile } from '@/types';

export function ProfessionalResumeDisplay({ profile }: { profile: ProspectProfile }) {
  const { full_name, headline, location, contact, notes, experience, education, licenses_certifications } = profile;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card p-6">
        <h1 className="text-2xl font-bold">{full_name}</h1>
        {headline && <p className="text-muted mt-1">{headline}</p>}
        <div className="text-subtle mt-2 flex flex-wrap gap-4">
          {location && <span>📍 {location}</span>}
          {contact?.email && <span>✉️ {contact.email}</span>}
          {contact?.phone && <span>📞 {contact.phone}</span>}
          {contact?.linkedin_url && (
            <a className="text-primary-600 hover:underline" href={contact.linkedin_url} target="_blank">
              LinkedIn
            </a>
          )}
        </div>
      </div>

      {/* Summary / About */}
      {notes?.length ? (
        <section className="space-y-2">
          <h2 className="heading-md">Summary</h2>
          <div className="card p-6">
            <ul className="list-disc pl-6 space-y-1">
              {notes.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Experience */}
      <section className="space-y-4">
        <h2 className="heading-md">Experience</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {experience?.map((ex, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold">{ex.title}</h3>
                <span className="text-subtle text-sm">
                  {ex.start_date}{ex.end_date ? ` – ${ex.end_date}` : ''}
                </span>
              </div>
              <p className="text-muted">{ex.company}</p>
              {ex.location && <p className="text-subtle">{ex.location}</p>}
              {ex.summary_bullets?.length ? (
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  {ex.summary_bullets.map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      {education?.length ? (
        <section className="space-y-3">
          <h2 className="heading-md">Education</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {education.map((ed, i) => (
              <div key={i} className="card p-5">
                <div className="font-semibold">{ed.school}</div>
                <div className="text-muted">{[ed.degree, ed.field].filter(Boolean).join(' • ')}</div>
                <div className="text-subtle text-sm">{[ed.start_year, ed.end_year].filter(Boolean).join(' – ')}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Licenses & Certifications */}
      {licenses_certifications?.length ? (
        <section className="space-y-3">
          <h2 className="heading-md">Licenses & Certifications</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {licenses_certifications.map((c, i) => (
              <div key={i} className="card p-5">
                <div className="font-semibold">{c.name}</div>
                <div className="text-muted">{c.issuer}</div>
                <div className="text-subtle text-sm">
                  {[c.issue_date, c.expiry_date].filter(Boolean).join(' • ')}
                </div>
                {c.credential_id && <div className="text-subtle text-xs mt-1">ID: {c.credential_id}</div>}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}