// переменные
const containerGame = document.querySelector('.game-grid');
const currentScoreElement = document.querySelector('.score-current');
const maxScoreElement = document.querySelector('.score-max');
const gameOverElement = document.querySelector('.container-game-over')

const SIZE = 4;

let board = [];

let currentScore = 0;
let maxScore = localStorage.getItem('max-score') || 0;
maxScoreElement.textContent = maxScore;

// функция для обновления счета
function updateScore(value) {
  currentScore += value;
  currentScoreElement.textContent = currentScore;

  if (currentScore > maxScore) {
    maxScore = currentScore;
    maxScoreElement.textContent = maxScore; // проверить точно ли надо
    localStorage.setItem('max-score', maxScore);
  }
};

// функция для рестарта игры
function restartGame() {
  currentScore = 0;
  currentScoreElement.textContent = currentScore;
  gameOverElement.style.display = 'none';
  initializeGame();
};

// функция запуска игры
function initializeGame() {
  board = [...Array(SIZE)].map(() => Array(SIZE).fill(0));

  inputRandomTile();
  inputRandomTile();

  renderBoard();
};

// отрисовка плитки
function renderBoard() {
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      // HTML элемент ячейки
      const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
      const prevValue = cell.dataset.value;
      const currentValue = board[i][j];

      if (currentValue !== 0) {
        cell.dataset.value = currentValue;
        cell.textContent = currentValue;

        // добавляем анимацию, если измененное значение и это не новый квадратик
        if (currentValue !== parseInt(prevValue) && !cell.classList.contains('new-tile')) {
          cell.classList.add('merged-tile');
        }

      } else {
        cell.textContent = '';
        delete cell.dataset.value;
        cell.classList.remove('merged-tile', 'new-tile');
      }
    }
  };

  // через 300ms после конца анимации убираем классы
  setTimeout(() => {
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
      cell.classList.remove('merged-tile', 'new-tile');
    });
  }, 300)
};

// создает рандомные плитки с цифрой 2 или 4
function inputRandomTile() {
  const available = [];

  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (board[i][j] === 0) {
        available.push({i, j})
      };
    };
  };

  if (available.length > 0) {
    const randomCell = available[Math.floor(Math.random()*available.length)];
    board[randomCell.i][randomCell.j] = Math.random() < 0.9 ? 2 : 4;

    const cell = document.querySelector(`[data-row="${randomCell.i}"][data-col="${randomCell.j}"]`);
    cell.classList.add('new-tile');
  };
};

// двигать клавишами
function moveTile(direction) {
  let hasChanged = false;

  if (direction === 'ArrowUp' || direction === 'ArrowDown') {
    for (let j = 0; j < SIZE; j++) {
      const column = [...Array(SIZE)].map((_, i) => board[i][j]);
      const newColumn = transform(column, direction ==='ArrowUp');

      for (let i = 0; i < SIZE; i++) {
        if (board[i][j] !== newColumn[i]) {
          hasChanged = true;
          board[i][j] = newColumn[i]
        }
      } 
    } 
  } else if (direction === 'ArrowLeft' || direction === 'ArrowRight') {
    for (let i = 0; i < SIZE; i++) {
      const row = board[i];
      const newRow = transform(row, direction === 'ArrowLeft');

      if (row.join(',') !== newRow.join(',')) {
        hasChanged = true;
        board[i] = newRow;
      }
    } 
  }

  if (hasChanged) {
    inputRandomTile();
    renderBoard();
    checkGameOver();
  }
};

// функция 
function transform(line, direction) {
  let newLine = line.filter(cell => cell !== 0);

  if (!direction) {
    newLine.reverse();
  }

  for (let i = 0; i < newLine.length - 1; i++) {
    if(newLine[i] === newLine[i+1]) {
      newLine[i] *= 2;

      updateScore(newLine[i])

      newLine.splice(i + 1, 1)
    }
  }

  while (newLine.length < SIZE) {
    newLine.push(0)
  }

  if (!direction) {
    newLine.reverse();
  }

  return newLine;
}

// проверяет на конец игры
function checkGameOver() {
  // Проверяем пустые ячейки
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (board[i][j] === 0) return false;
    }
  }
  
  // Проверяем возможность слияния
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (j < SIZE - 1 && board[i][j] === board[i][j + 1]) return false;
      if (i < SIZE - 1 && board[i][j] === board[i + 1][j]) return false;
    }
  }
  
  // Если дошли сюда - игра окончена
  gameOverElement.style.display = 'flex';
  return true;
}

document.addEventListener('keydown', event => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    moveTile(event.key);
  }
})

document.querySelector('.btn-restart-game').addEventListener('click', restartGame);

initializeGame();

// ========== МОБИЛЬНОЕ УПРАВЛЕНИЕ (СВАЙПЫ) ==========

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// Минимальное расстояние свайпа в пикселях (чтобы случайное касание не срабатывало)
const MIN_SWIPE_DISTANCE = 30;

// Определяем направление свайпа
function getSwipeDirection(startX, startY, endX, endY) {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  
  // Определяем, горизонтальный или вертикальный свайп
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Горизонтальный свайп
    if (Math.abs(deltaX) < MIN_SWIPE_DISTANCE) return null;
    return deltaX > 0 ? 'ArrowRight' : 'ArrowLeft';
  } else {
    // Вертикальный свайп
    if (Math.abs(deltaY) < MIN_SWIPE_DISTANCE) return null;
    return deltaY > 0 ? 'ArrowDown' : 'ArrowUp';
  }
}

// Обработчик начала касания
function handleTouchStart(event) {
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
  // Предотвращаем прокрутку страницы во время свайпа
  event.preventDefault();
}

// Обработчик окончания касания
function handleTouchEnd(event) {
  touchEndX = event.changedTouches[0].clientX;
  touchEndY = event.changedTouches[0].clientY;
  
  const direction = getSwipeDirection(touchStartX, touchStartY, touchEndX, touchEndY);
  
  if (direction) {
    moveTile(direction);
  }
  
  event.preventDefault();
}

// Добавляем обработчики на контейнер игры
const gameContainer = document.querySelector('.container-game');

gameContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
gameContainer.addEventListener('touchend', handleTouchEnd, { passive: false });

// Предотвращаем случайное выделение текста при свайпах
gameContainer.addEventListener('touchmove', (event) => {
  event.preventDefault();
}, { passive: false });