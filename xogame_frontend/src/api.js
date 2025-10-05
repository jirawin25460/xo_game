
const API_BASE = "http://localhost:8080/api/games";

export async function createGame(
  size,
  playerX,
  playerO,
  botX = false,
  botO = false,
  scoreX = 0,
  scoreO = 0
) {
  const params = new URLSearchParams({ size, playerX, playerO, botX, botO, scoreX, scoreO });
  const res = await fetch(`${API_BASE}/create?${params.toString()}`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to create game");
  return res.json();
}

export async function makeMove(gameId, row, col, player) {
  const params = new URLSearchParams({ rowpos: row, colpos: col, player });
  const res = await fetch(`${API_BASE}/${gameId}/move?${params.toString()}`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to make move");
  return res.json();
}

export async function getMoves(gameId) {
  const res = await fetch(`${API_BASE}/${gameId}/moves`);
  if (!res.ok) throw new Error("Failed to fetch moves");
  return res.json();
}

export async function getGame(gameId) {
  const res = await fetch(`${API_BASE}/${gameId}`);
  if (!res.ok) throw new Error("Failed to fetch game");
  return res.json();
}

export async function getAllGames() {
  const res = await fetch(`${API_BASE}`);
  if (!res.ok) throw new Error("Failed to fetch all games");
  return res.json();
}
