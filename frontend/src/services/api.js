const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
  health: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },
  submitViolation: async (data) => {
    const res = await fetch(`${API_BASE}/violations/input`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to submit violation");
    return res.json();
  },
  getRecommendations: async () => {
    const res = await fetch(`${API_BASE}/recommendations`);
    return res.json();
  },
  simulateCascade: async (ids) => {
    const res = await fetch(`${API_BASE}/cascade-sim?violation_ids=${ids.join(',')}`);
    return res.json();
  },
  getNetworkGraph: async () => {
    const res = await fetch(`${API_BASE}/network-graph`);
    if (!res.ok) throw new Error("Failed to fetch network graph");
    return res.json();
  },
  getUnseenEvents: async () => {
    const response = await fetch(`${API_BASE}/unseen-events`);
    if (!response.ok) throw new Error('Failed to fetch unseen events');
    return response.json();
  }
};
