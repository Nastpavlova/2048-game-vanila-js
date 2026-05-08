let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// min свайп, чтобы не было случайного касания
const MIN_SWIPE_DISTANCE = 30;

// функция для направления свайпа
function getSwipeDirection(startX, startY, endX, endY) {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  
  // горизонтальный свайп VS вертикальный свайп
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

// функция обработчика для начала касания
function handleTouchStart(event) {
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
  // чтобы страница не прокручивалась во время свайпа
  event.preventDefault();
}

// функция для обработчика конца касания
function handleTouchEnd(event) {
  touchEndX = event.changedTouches[0].clientX;
  touchEndY = event.changedTouches[0].clientY;
  
  const direction = getSwipeDirection(touchStartX, touchStartY, touchEndX, touchEndY);
  
  if (direction) {
    moveTile(direction);
  }
  
  event.preventDefault();
}

const gameContainer = document.querySelector('.container-game');

gameContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
gameContainer.addEventListener('touchend', handleTouchEnd, { passive: false });

// предотвращаем случайное выделение текста при свайпах
gameContainer.addEventListener('touchmove', (event) => {
  event.preventDefault();
}, { passive: false });