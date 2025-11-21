"use client";

import React, { useEffect, useState } from 'react';

interface RenderModel {
  studentName: string;
  academics: {
    gpaWeighted: number | null;
    gpaUnweighted: number | null;
    rigorLevel: string;
    plannedAPs: number;
    testScoresSummary: string | null;
  };
  oracles: {
    aptitude: number;
    passion: number;
    service: number;
    composite: number;
  };
  narrative: {
    flagship: string;
    positioning: string;
    themes: string[];
    risks: string[];
    opportunities: string[];
  };
  strategy: {
    months: { month: string; focus: string }[];
    summer: {
      baseline: string;
      stretch: string;
      moonshot: string;
    };
    awardsTargets: {
      name: string;
      tier: string;
      likelihood: string;
    }[];
  };
  lastUpdated: string;
}

export default function AssessmentSummaryPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const [renderModel, setRenderModel] = useState<RenderModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    async function fetchAssessment() {
      try {
        const res = await fetch(
          `${API_URL}/assessment/${params.sessionId}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (!json.success) {
          setError(json.error || "Failed to load assessment");
          return;
        }
        setRenderModel(json.data.renderModel);
      } catch (err) {
        setError("Failed to load assessment");
      } finally {
        setLoading(false);
      }
    }

    fetchAssessment();
  }, [params.sessionId]);

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading assessment...</div>;
  }

  if (error || !renderModel) {
    return (
      <div style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#dc2626' }}>Error</h1>
        <p>{error || "Assessment not found"}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '16px' }}>
        Assessment Summary for {renderModel.studentName}
      </h1>

      {/* APS Scores */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <ScoreCard label="Aptitude" value={renderModel.oracles.aptitude} />
        <ScoreCard label="Passion" value={renderModel.oracles.passion} />
        <ScoreCard label="Service" value={renderModel.oracles.service} />
        <ScoreCard label="Composite" value={renderModel.oracles.composite} />
      </section>

      {/* Academics */}
      <section style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Academics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div>
            <span style={{ fontWeight: '500' }}>Weighted GPA:</span>{' '}
            {renderModel.academics.gpaWeighted ?? 'N/A'}
          </div>
          <div>
            <span style={{ fontWeight: '500' }}>Unweighted GPA:</span>{' '}
            {renderModel.academics.gpaUnweighted ?? 'N/A'}
          </div>
          <div>
            <span style={{ fontWeight: '500' }}>Rigor Level:</span>{' '}
            {renderModel.academics.rigorLevel}
          </div>
          <div>
            <span style={{ fontWeight: '500' }}>Planned APs:</span>{' '}
            {renderModel.academics.plannedAPs}
          </div>
          {renderModel.academics.testScoresSummary && (
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ fontWeight: '500' }}>Test Scores:</span>{' '}
              {renderModel.academics.testScoresSummary}
            </div>
          )}
        </div>
      </section>

      {/* Narrative */}
      <section style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Narrative</h2>
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: '500', marginBottom: '4px' }}>Flagship Narrative:</div>
          <p style={{ color: '#374151' }}>{renderModel.narrative.flagship}</p>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: '500', marginBottom: '4px' }}>Positioning:</div>
          <p style={{ color: '#374151' }}>{renderModel.narrative.positioning}</p>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: '500', marginBottom: '4px' }}>Themes:</div>
          <ul style={{ listStyle: 'disc', listStylePosition: 'inside', color: '#374151' }}>
            {renderModel.narrative.themes?.map((theme: string) => (
              <li key={theme}>{theme}</li>
            ))}
          </ul>
        </div>
        {renderModel.narrative.risks.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: '500', marginBottom: '4px' }}>Risks:</div>
            <ul style={{ listStyle: 'disc', listStylePosition: 'inside', color: '#dc2626' }}>
              {renderModel.narrative.risks?.map((risk: string) => (
                <li key={risk}>{risk}</li>
              ))}
            </ul>
          </div>
        )}
        {renderModel.narrative.opportunities.length > 0 && (
          <div>
            <div style={{ fontWeight: '500', marginBottom: '4px' }}>Opportunities:</div>
            <ul style={{ listStyle: 'disc', listStylePosition: 'inside', color: '#059669' }}>
              {renderModel.narrative.opportunities?.map((opp: string) => (
                <li key={opp}>{opp}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Strategy */}
      <section style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>12-Month Plan</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {renderModel.strategy.months?.slice(0, 12).map((m: any) => (
            <div key={m.month} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>{m.month}</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>{m.focus}</div>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: '16px', marginBottom: '8px' }}>Summer Planning</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div style={{ padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Baseline</div>
            <div style={{ fontSize: '14px', color: '#374151' }}>{renderModel.strategy.summer.baseline}</div>
          </div>
          <div style={{ padding: '12px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Stretch</div>
            <div style={{ fontSize: '14px', color: '#374151' }}>{renderModel.strategy.summer.stretch}</div>
          </div>
          <div style={{ padding: '12px', backgroundColor: '#ddd6fe', borderRadius: '8px' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Moonshot</div>
            <div style={{ fontSize: '14px', color: '#374151' }}>{renderModel.strategy.summer.moonshot}</div>
          </div>
        </div>

        {renderModel.strategy.awardsTargets.length > 0 && (
          <>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: '16px', marginBottom: '8px' }}>Awards Targets</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {renderModel.strategy.awardsTargets.map((award: any, idx: number) => (
                <div key={idx} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <div style={{ fontWeight: '600' }}>{award.name}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Tier: {award.tier} | Likelihood: {award.likelihood}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <div style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'right' }}>
        Last updated: {new Date(renderModel.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: 'white'
    }}>
      <div style={{ fontSize: '14px', color: '#6b7280' }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: '700' }}>{Math.round(value)}</div>
    </div>
  );
}
