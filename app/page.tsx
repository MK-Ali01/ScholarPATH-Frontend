import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function ResultsPage() {
  const supabase = getSupabase();

  if (!supabase) {
    return (
      <main className="page">
        <p className="empty">
          Supabase environment variables are not configured. Add SUPABASE_URL and
          SUPABASE_SERVICE_ROLE_KEY, then redeploy.
        </p>
      </main>
    );
  }

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(`
      id, github_username, status, structured_profile, created_at,
      domain_recommendations (
        id, domain, reasoning,
        papers ( id, title, plain_summary, relevance_confidence, url ),
        scholarship_matches:scholarship_matches!domain_recommendation_id (
          id, match_confidence, match_reasoning,
          scholarships ( name, country_or_region, deadline_text )
        )
      ),
      professors ( id, name, affiliation, identification_confidence ),
      review_packages (
        id, status, drafted_email_subject, drafted_email_body,
        edited_email_subject, edited_email_body
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <main className="page">
        <p className="empty">Query error: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="page">
      <h1>ScholarPath — Results</h1>

      {(!profiles || profiles.length === 0) && (
        <p className="empty">No candidates yet.</p>
      )}

      {profiles?.map((p: any) => (
        <section key={p.id} className="card">
          <div className="card-head">
            <h2>@{p.github_username}</h2>
            <span className="badge">{p.status}</span>
          </div>

          {p.structured_profile?.skills?.length > 0 && (
            <div className="tags">
              {p.structured_profile.skills.slice(0, 8).map((s: string) => (
                <span key={s} className="tag">{s}</span>
              ))}
            </div>
          )}

          {p.domain_recommendations?.map((d: any) => (
            <div key={d.id} className="block">
              <h3>{d.domain}</h3>
              <p className="muted">{d.reasoning}</p>

              {d.papers?.map((paper: any) => (
                <div key={paper.id} className="subblock">
                  <a href={paper.url ?? '#'} target="_blank" rel="noreferrer">{paper.title}</a>
                  {paper.relevance_confidence && (
                    <span className={`chip chip-${paper.relevance_confidence}`}>{paper.relevance_confidence}</span>
                  )}
                  {paper.plain_summary && <p className="muted small">{paper.plain_summary}</p>}
                </div>
              ))}

              {d.scholarship_matches?.map((m: any) => (
                <div key={m.id} className="subblock">
                  <strong>{m.scholarships?.name}</strong>
                  <span className={`chip chip-${m.match_confidence}`}>{m.match_confidence}</span>
                  <p className="muted small">{m.match_reasoning}</p>
                </div>
              ))}
            </div>
          ))}

          {p.professors?.map((prof: any) => (
            <div key={prof.id} className="block">
              <h3>Professor: {prof.name}</h3>
              <p className="muted small">
                {prof.affiliation ?? 'Affiliation not determined'} · {prof.identification_confidence} confidence
              </p>
            </div>
          ))}

          {p.review_packages?.map((r: any) => (
            <div key={r.id} className="block email-block">
              <h3>Drafted Email — {r.status}</h3>
              <p className="muted small"><strong>Subject:</strong> {r.edited_email_subject ?? r.drafted_email_subject}</p>
              <p className="muted small">{r.edited_email_body ?? r.drafted_email_body}</p>
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
