const STORAGE_PREFIX = 'submarino.room.';

const state = {
  room: null,
  playerId: null,
};

const refs = {
  setupScreen: document.getElementById('setupScreen'),
  lobbyScreen: document.getElementById('lobbyScreen'),
  gameScreen: document.getElementById('gameScreen'),
  hostName: document.getElementById('hostName'),
  maxPlayers: document.getElementById('maxPlayers'),
  boardSize: document.getElementById('boardSize'),
  joinCode: document.getElementById('joinCode'),
  joinName: document.getElementById('joinName'),
  roomCodeText: document.getElementById('roomCodeText'),
  roomMeta: document.getElementById('roomMeta'),
  playersList: document.getElementById('playersList'),
  logList: document.getElementById('logList'),
  toggleReadyBtn: document.getElementById('toggleReadyBtn'),
  startGameBtn: document.getElementById('startGameBtn'),
  turnLabel: document.getElementById('turnLabel'),
  playerBoard: document.getElementById('playerBoard'),
  enemyBoards: document.getElementById('enemyBoards'),
};

function getRoomKey(code) {
  return `${STORAGE_PREFIX}${code}`;
}

function generateCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += letters[Math.floor(Math.random() * letters.length)];
  }
  return code;
}

function createBoard(size) {
  const board = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ type: 'water', status: 'none' }))
  );

  const shipCount = Math.max(3, Math.min(6, Math.ceil(size / 2)));
  let placed = 0;
  while (placed < shipCount) {
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);
    if (board[row][col].type === 'water') {
      board[row][col].type = 'ship';
      placed += 1;
    }
  }
  return board;
}

function saveRoom(room) {
  localStorage.setItem(getRoomKey(room.code), JSON.stringify(room));
}

function loadRoom(code) {
  const raw = localStorage.getItem(getRoomKey(code));
  return raw ? JSON.parse(raw) : null;
}

function currentPlayer() {
  if (!state.room) return null;
  return state.room.players.find((player) => player.id === state.playerId) ?? null;
}

function getHost() {
  return state.room?.players.find((player) => player.id === state.room.hostId) ?? null;
}

function getCurrentTurnPlayer() {
  if (!state.room || !state.room.turnOrder?.length) return null;
  const currentId = state.room.turnOrder[state.room.currentTurn];
  return state.room.players.find((player) => player.id === currentId) ?? null;
}

function addLog(message) {
  if (!state.room) return;
  state.room.logs = state.room.logs || [];
  state.room.logs.unshift(message);
  while (state.room.logs.length > 8) {
    state.room.logs.pop();
  }
}

function syncState(room) {
  state.room = room;
  if (!state.room) {
    refs.lobbyScreen.classList.add('hidden');
    refs.gameScreen.classList.add('hidden');
    refs.setupScreen.classList.remove('hidden');
    return;
  }

  if (!state.playerId && state.room.players.length) {
    state.playerId = state.room.hostId;
    sessionStorage.setItem('submarino.playerId', state.playerId);
  }

  if (state.playerId && !state.room.players.some((player) => player.id === state.playerId)) {
    state.playerId = null;
    sessionStorage.removeItem('submarino.playerId');
  }

  refs.setupScreen.classList.add('hidden');

  if (state.room.phase === 'lobby') {
    refs.lobbyScreen.classList.remove('hidden');
    refs.gameScreen.classList.add('hidden');
    renderLobby();
    return;
  }

  refs.lobbyScreen.classList.add('hidden');
  refs.gameScreen.classList.remove('hidden');
  renderGame();
}

function isMyTurn() {
  if (!state.room || !state.playerId) return false;
  const currentPlayer = getCurrentTurnPlayer();
  return currentPlayer && currentPlayer.id === state.playerId;
}

function notify(message) {
  addLog(message);
  saveRoom(state.room);
  renderLobby();
  renderGame();
}

function createRoom() {
  const hostName = refs.hostName.value.trim();
  const maxPlayers = Number(refs.maxPlayers.value);
  const boardSize = Number(refs.boardSize.value);

  if (!hostName) {
    alert('Necesitas un nombre para crear la sala.');
    return;
  }

  const code = generateCode();
  const playerId = crypto.randomUUID();
  const hostPlayer = {
    id: playerId,
    name: hostName,
    ready: true,
    eliminated: false,
    isHost: true,
    board: createBoard(boardSize),
  };

  const room = {
    code,
    hostId: playerId,
    boardSize,
    maxPlayers,
    phase: 'lobby',
    players: [hostPlayer],
    turnOrder: [playerId],
    currentTurn: 0,
    logs: [`La sala ${code} fue creada por ${hostName}.`],
  };

  state.playerId = playerId;
  sessionStorage.setItem('submarino.roomCode', room.code);
  sessionStorage.setItem('submarino.playerId', playerId);
  saveRoom(room);
  syncState(room);
}

function joinRoom() {
  const code = refs.joinCode.value.trim().toUpperCase();
  const name = refs.joinName.value.trim();

  if (!code || !name) {
    alert('Escribe la clave de la sala y tu nombre.');
    return;
  }

  const room = loadRoom(code);
  if (!room) {
    alert('No existe una sala con esa clave.');
    return;
  }

  if (room.phase !== 'lobby') {
    alert('La sala ya comenzó la partida.');
    return;
  }

  if (room.players.length >= room.maxPlayers) {
    alert('La sala ya alcanzó el máximo de participantes.');
    return;
  }

  const playerId = crypto.randomUUID();
  room.players.push({
    id: playerId,
    name,
    ready: false,
    eliminated: false,
    isHost: false,
    board: createBoard(room.boardSize),
  });

  room.turnOrder.push(playerId);
  room.logs.unshift(`${name} se unió a la sala.`);
  state.playerId = playerId;
  sessionStorage.setItem('submarino.roomCode', room.code);
  sessionStorage.setItem('submarino.playerId', playerId);
  saveRoom(room);
  syncState(room);
}

function toggleReady() {
  const player = currentPlayer();
  if (!player || !state.room) return;
  player.ready = !player.ready;
  addLog(`${player.name} ${player.ready ? 'está listo' : 'no está listo'} para jugar.`);
  saveRoom(state.room);
  renderLobby();
}

function startGame() {
  if (!state.room || state.room.hostId !== state.playerId) {
    return;
  }

  if (state.room.players.length !== state.room.maxPlayers) {
    alert('No todos los jugadores han entrado todavía.');
    return;
  }

  if (!state.room.players.every((player) => player.ready)) {
    alert('Todos los jugadores deben confirmar que están listos.');
    return;
  }

  state.room.phase = 'playing';
  state.room.currentTurn = 0;
  state.room.logs.unshift('La partida ha comenzado.');
  saveRoom(state.room);
  syncState(state.room);
}

function canStartGame() {
  if (!state.room || state.room.hostId !== state.playerId) return false;
  return state.room.players.length === state.room.maxPlayers && state.room.players.every((player) => player.ready);
}

function renderLobby() {
  if (!state.room) return;

  refs.roomCodeText.textContent = state.room.code;
  refs.roomMeta.textContent = `Tablero ${state.room.boardSize}x${state.room.boardSize} • ${state.room.players.length}/${state.room.maxPlayers} participantes`;
  refs.playersList.innerHTML = '';

  state.room.players.forEach((player) => {
    const card = document.createElement('div');
    card.className = `player-card ${player.ready ? 'ready' : ''} ${player.id === state.room.hostId ? 'host' : ''}`;
    card.innerHTML = `
      <span class="player-name">${player.name}</span>
      <span class="player-badge">${player.id === state.room.hostId ? 'Host' : player.ready ? 'Listo' : 'Esperando'}</span>
    `;
    refs.playersList.appendChild(card);
  });

  refs.logList.innerHTML = (state.room.logs || []).map((entry) => `<li>${entry}</li>`).join('');
  refs.toggleReadyBtn.textContent = currentPlayer()?.ready ? 'Quitar listo' : 'Marcar como listo';
  refs.startGameBtn.disabled = !canStartGame();
}

function renderGame() {
  if (!state.room || state.room.phase !== 'playing') return;

  const currentTurn = getCurrentTurnPlayer();
  refs.turnLabel.textContent = currentTurn ? `Turno de ${currentTurn.name}` : 'Turno';

  const me = currentPlayer();
  refs.playerBoard.style.setProperty('--board-size', state.room.boardSize);
  refs.playerBoard.innerHTML = renderBoard(me.board, true, null);

  refs.enemyBoards.innerHTML = '';
  state.room.players.forEach((player) => {
    if (player.id === state.playerId) return;

    const enemyCard = document.createElement('div');
    enemyCard.className = 'enemy-card';
    enemyCard.innerHTML = `
      <div class="enemy-name">${player.name}</div>
      <div class="board" style="--board-size:${state.room.boardSize};">
        ${renderBoard(player.board, false, player.id)}
      </div>
    `;
    refs.enemyBoards.appendChild(enemyCard);
  });
}

function renderBoard(board, isMyBoard, targetPlayerId) {
  const rows = [];
  for (let row = 0; row < board.length; row += 1) {
    const cells = [];
    for (let col = 0; col < board[row].length; col += 1) {
      const cell = board[row][col];
      const stateClass = cell.status === 'hit' ? 'hit' : cell.status === 'miss' ? 'miss' : cell.type === 'ship' && isMyBoard ? 'ship' : 'water';
      const isLocked = !isMyBoard && (cell.status === 'hit' || cell.status === 'miss' || !isMyTurn() || state.room.phase !== 'playing' || targetPlayerId === state.playerId);
      const cellContent = cell.status === 'hit' ? 'X' : cell.status === 'miss' ? '·' : '';
      const canAttack = !isMyBoard && !isLocked && targetPlayerId && targetPlayerId !== state.playerId;
      const cellHtml = `
        <button
          class="board-cell ${stateClass} ${isLocked ? 'locked' : ''}"
          data-row="${row}"
          data-col="${col}"
          data-target="${targetPlayerId || ''}"
          ${canAttack ? '' : 'disabled'}
          title="${cell.type === 'ship' && isMyBoard ? 'Submarino' : 'Celda'}"
        >${cellContent}</button>
      `;
      cells.push(cellHtml);
    }
    rows.push(`<div class="board-row">${cells.join('')}</div>`);
  }
  return rows.join('');
}

function registerBoardClicks() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('.board-cell');
    if (!button || button.disabled) return;

    const targetId = button.dataset.target;
    const row = Number(button.dataset.row);
    const col = Number(button.dataset.col);

    if (!targetId || Number.isNaN(row) || Number.isNaN(col)) return;
    attackEnemy(targetId, row, col);
  });
}

function attackEnemy(targetId, row, col) {
  if (!state.room || state.room.phase !== 'playing') return;
  const current = getCurrentTurnPlayer();
  if (!current || current.id !== state.playerId) {
    alert('No es tu turno.');
    return;
  }

  const target = state.room.players.find((player) => player.id === targetId);
  if (!target) return;

  if (row < 0 || col < 0 || row >= target.board.length || col >= target.board.length) {
    return;
  }

  const cell = target.board[row][col];
  if (cell.status === 'hit' || cell.status === 'miss') {
    alert('Esa posición ya fue atacada.');
    return;
  }

  const result = cell.type === 'ship' ? 'hit' : 'miss';
  cell.status = result;

  addLog(`${current.name} atacó a ${target.name} en ${row + 1}, ${col + 1}: ${result === 'hit' ? 'impacto' : 'agua'}.`);

  const hasRemainingShips = target.board.some((boardRow) =>
    boardRow.some((innerCell) => innerCell.type === 'ship' && innerCell.status !== 'hit')
  );

  if (!hasRemainingShips) {
    target.eliminated = true;
    addLog(`${target.name} fue eliminado. ${current.name} gana la ronda.`);
  }

  const remainingPlayers = state.room.players.filter((player) => !player.eliminated);
  if (remainingPlayers.length <= 1) {
    state.room.phase = 'finished';
    state.room.winnerId = remainingPlayers[0]?.id || current.id;
    addLog(`La partida terminó. Ganó ${state.room.winnerId === current.id ? current.name : remainingPlayers[0]?.name ?? 'nadie'}.`);
  } else {
    let nextIndex = state.room.turnOrder.indexOf(current.id) + 1;
    if (nextIndex >= state.room.turnOrder.length) nextIndex = 0;
    while (state.room.players.find((player) => player.id === state.room.turnOrder[nextIndex])?.eliminated) {
      nextIndex += 1;
      if (nextIndex >= state.room.turnOrder.length) nextIndex = 0;
    }
    state.room.currentTurn = nextIndex;
  }

  saveRoom(state.room);
  renderGame();
}

function leaveGame() {
  state.playerId = null;
  sessionStorage.removeItem('submarino.roomCode');
  if (state.room) {
    localStorage.removeItem(getRoomKey(state.room.code));
  }
  state.room = null;
  sessionStorage.removeItem('submarino.playerId');
  refs.setupScreen.classList.remove('hidden');
  refs.lobbyScreen.classList.add('hidden');
  refs.gameScreen.classList.add('hidden');
}

function handleStorageChange(event) {
  if (!event.key || !event.key.startsWith(STORAGE_PREFIX)) return;
  const room = event.newValue ? JSON.parse(event.newValue) : null;
  if (!room) return;
  syncState(room);
}

refs.createRoomBtn.addEventListener('click', createRoom);
refs.joinRoomBtn.addEventListener('click', joinRoom);
refs.toggleReadyBtn.addEventListener('click', toggleReady);
refs.startGameBtn.addEventListener('click', startGame);
refs.copyCodeBtn.addEventListener('click', async () => {
  if (!state.room) return;
  await navigator.clipboard.writeText(state.room.code);
});
refs.leaveGameBtn.addEventListener('click', leaveGame);
window.addEventListener('storage', handleStorageChange);
registerBoardClicks();

const savedRoomCode = sessionStorage.getItem('submarino.roomCode');
const savedPlayerId = sessionStorage.getItem('submarino.playerId');
if (savedRoomCode) {
  const room = loadRoom(savedRoomCode);
  if (room) {
    state.room = room;
    state.playerId = savedPlayerId || room.hostId;
  }
}

if (state.room) {
  syncState(state.room);
}
