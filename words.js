// Лабораторная работа 4: Задание "Слова" (Вариант 2)

// Предопределенная палитра ярких и контрастных цветов для элементов
const VIBRANT_COLORS = [
    '#ff4d4d', '#22c55e', '#d946ef', '#3b82f6', 
    '#facc15', '#06b6d4', '#fb923c', '#a855f7', 
    '#ec4899', '#14b8a6', '#f87171', '#4ade80'
];

let colorIndex = 0;
function getNextColor() {
    const col = VIBRANT_COLORS[colorIndex % VIBRANT_COLORS.length];
    colorIndex++;
    return col;
}

// Данные текущих разобранных слов
let wordItems = [];

// Ссылки на элементы DOM
let inputStringElem;
let btnParseElem;
let btnClearBlock1Elem;
let block1Elem;
let block2Elem;
let block3Elem;

// Флаг для отличия простого клика от перетаскивания мышью
let isDraggingActive = false;

document.addEventListener('DOMContentLoaded', initWordsLab);

function initWordsLab() {
    inputStringElem = document.getElementById('input-string');
    btnParseElem = document.getElementById('btn-parse');
    btnClearBlock1Elem = document.getElementById('btn-clear-block1');
    block1Elem = document.getElementById('block-1');
    block2Elem = document.getElementById('block-2');
    block3Elem = document.getElementById('block-3');

    if (!btnParseElem) return;

    btnParseElem.addEventListener('click', parseInputString);
    if (btnClearBlock1Elem) {
        btnClearBlock1Elem.addEventListener('click', clearBlock1);
    }

    // Навешиваем слушатели Drag & Drop для зон сброса
    setupDropZones();

    // Автоматический первичный разбор строки из примера
    parseInputString();
}

// Разбор введенной строки
function parseInputString() {
    const rawText = inputStringElem.value.trim();
    if (!rawText) return;

    // Разделение по тире/дефисам с любыми пробелами вокруг (тире: -, –, —)
    const tokens = rawText
        .split(/\s*[-–—]\s*/)
        .map(t => t.trim())
        .filter(t => t.length > 0);

    const lowerWords = [];
    const upperWords = [];
    const numberWords = [];

    tokens.forEach(tok => {
        // Проверка: число ли это?
        if (!isNaN(tok) && !isNaN(parseFloat(tok))) {
            numberWords.push(tok);
        } else {
            const firstChar = tok[0];
            // Проверка на заглавную букву (алфавитную)
            if (firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase()) {
                upperWords.push(tok);
            } else {
                lowerWords.push(tok);
            }
        }
    });

    // Сортировка:
    // 1. Строчные по алфавиту
    lowerWords.sort((a, b) => a.localeCompare(b, 'ru', { sensitivity: 'base' }));
    // 2. Заглавные по алфавиту
    upperWords.sort((a, b) => a.localeCompare(b, 'ru', { sensitivity: 'base' }));
    // 3. Цифры по возрастанию
    numberWords.sort((a, b) => Number(a) - Number(b));

    // Создание ассоциативного массива по требованию ТЗ:
    // Ключи a1, a2... для строчных; b1, b2... для заглавных; n1, n2... для цифр
    const assocArray = {};
    wordItems = [];
    colorIndex = 0;
    let globalOrder = 0;

    let aCounter = 1;
    lowerWords.forEach(val => {
        const key = 'a' + aCounter++;
        assocArray[key] = val;
        wordItems.push({
            id: 'word-' + globalOrder,
            key: key,
            value: val,
            orderIndex: globalOrder++,
            originalColor: getNextColor(),
            currentLocation: 'block-2' // 'block-2' или 'block-3'
        });
    });

    let bCounter = 1;
    upperWords.forEach(val => {
        const key = 'b' + bCounter++;
        assocArray[key] = val;
        wordItems.push({
            id: 'word-' + globalOrder,
            key: key,
            value: val,
            orderIndex: globalOrder++,
            originalColor: getNextColor(),
            currentLocation: 'block-2'
        });
    });

    let nCounter = 1;
    numberWords.forEach(val => {
        const key = 'n' + nCounter++;
        assocArray[key] = val;
        wordItems.push({
            id: 'word-' + globalOrder,
            key: key,
            value: val,
            orderIndex: globalOrder++,
            originalColor: getNextColor(),
            currentLocation: 'block-2'
        });
    });

    // Вывод ассоциативного массива в консоль (для проверки преподавателем)
    console.log("=== Ассоциативный массив ===");
    console.table(assocArray);

    // Очистка блоков
    block2Elem.innerHTML = '<span class="block-badge badge-gray">2</span>';
    block3Elem.innerHTML = '<span class="block-badge badge-blue">3</span>';
    clearBlock1();

    // Отрисовка элементов в Блоке 2 в отсортированном порядке
    wordItems.forEach(item => {
        const card = createWordCard(item);
        block2Elem.appendChild(card);
    });
}

// Создание DOM-элемента карточки
function createWordCard(item) {
    const card = document.createElement('div');
    card.id = item.id;
    card.className = 'word-card';
    card.textContent = `${item.key} ${item.value}`;
    card.dataset.id = item.id;
    card.dataset.order = item.orderIndex;
    card.dataset.key = item.key;
    card.dataset.val = item.value;
    card.dataset.color = item.originalColor;

    // Исходный случайный цвет в Блоке 2
    card.style.backgroundColor = item.originalColor;

    // Включаем нативную перетаскиваемость (HTML5 Drag & Drop)
    card.draggable = true;

    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);

    // Обработка клика: если карточка находится в синем Блоке 3,
    // при клике отображаем её слово в красном Блоке 1
    card.addEventListener('click', (e) => {
        if (isDraggingActive) return; // предотвращаем клик при завершении drag
        if (card.parentElement === block3Elem) {
            handleCardClickInBlock3(item);
        }
    });

    // Дополнительный Pointer Drag для точного позиционирования мышью в Блоке 3
    setupPointerDrag(card);

    return card;
}

// Клик по элементу в Блоке 3 -> слово отображается в Блоке 1
function handleCardClickInBlock3(item) {
    // Убираем заглушку, если она есть
    const placeholder = block1Elem.querySelector('.block-1-empty');
    if (placeholder) {
        placeholder.remove();
    }

    // Создаем span со словом, цвет текста = исходный цвет элемента!
    const span = document.createElement('span');
    span.className = 'clicked-word';
    span.textContent = item.value;
    span.style.color = item.originalColor;

    block1Elem.appendChild(span);
}

// Очистка красного Блока 1
function clearBlock1() {
    block1Elem.innerHTML = '<span class="block-badge badge-red">1</span><span class="block-1-empty">Нажмите на слова в синем блоке 3, чтобы они отобразились здесь...</span>';
}

// HTML5 Drag and Drop логика
let draggedCard = null;
let dragStartX = 0;
let dragStartY = 0;

function handleDragStart(e) {
    draggedCard = this;
    isDraggingActive = true;
    this.classList.add('dragging');
    e.dataTransfer.setData('text/plain', this.id);
    e.dataTransfer.effectAllowed = 'move';

    // Запоминаем смещение курсора относительно карточки
    const rect = this.getBoundingClientRect();
    dragStartX = e.clientX - rect.left;
    dragStartY = e.clientY - rect.top;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    setTimeout(() => {
        isDraggingActive = false;
        draggedCard = null;
    }, 150);
}

function setupDropZones() {
    [block2Elem, block3Elem].forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', (e) => {
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');

            if (!draggedCard) return;

            if (zone === block3Elem) {
                // Сброс в Блок 3: позиционируем по координатам мыши
                const zoneRect = block3Elem.getBoundingClientRect();
                const cardWidth = draggedCard.offsetWidth || 100;
                const cardHeight = draggedCard.offsetHeight || 36;

                // Вычисляем координаты внутри зоны
                let x = e.clientX - zoneRect.left - dragStartX;
                let y = e.clientY - zoneRect.top - dragStartY;

                // Ограничиваем пределами Блока 3
                const maxX = Math.max(10, zoneRect.width - cardWidth - 10);
                const maxY = Math.max(10, zoneRect.height - cardHeight - 10);

                x = Math.max(10, Math.min(x, maxX));
                y = Math.max(25, Math.min(y, maxY)); // отступ сверху для бейджа

                moveCardToBlock3(draggedCard, x, y);

            } else if (zone === block2Elem) {
                // Сброс в Блок 2: возвращаем на прежнее место в отсортированном порядке!
                moveCardToBlock2(draggedCard);
            }
        });
    });
}

// Перемещение карточки в Блок 3
function moveCardToBlock3(card, x, y) {
    block3Elem.appendChild(card);
    card.style.position = 'absolute';
    card.style.left = `${x}px`;
    card.style.top = `${y}px`;
    card.style.width = 'auto';

    // В Блоке 3 блоки становятся одинакового серого цвета (по ТЗ и image4)
    card.style.backgroundColor = '#c4c4c4';
}

// Перемещение карточки обратно в Блок 2
function moveCardToBlock2(card) {
    // Сбрасываем абсолютное позиционирование
    card.style.position = '';
    card.style.left = '';
    card.style.top = '';
    card.style.width = '';

    // Возвращаем исходный случайный цвет
    card.style.backgroundColor = card.dataset.color;

    // Вставляем строго в отсортированном порядке по orderIndex!
    const targetOrder = parseInt(card.dataset.order, 10);
    const existingCards = Array.from(block2Elem.querySelectorAll('.word-card'));

    let inserted = false;
    for (let other of existingCards) {
        const otherOrder = parseInt(other.dataset.order, 10);
        if (otherOrder > targetOrder) {
            block2Elem.insertBefore(card, other);
            inserted = true;
            break;
        }
    }

    if (!inserted) {
        block2Elem.appendChild(card);
    }
}

// Поддержка свободного перемещения карточки ВНУТРИ Блока 3 (Pointer Events)
function setupPointerDrag(card) {
    let isMoving = false;
    let startX = 0;
    let startY = 0;
    let origLeft = 0;
    let origTop = 0;
    let moveDistance = 0;

    card.addEventListener('pointerdown', (e) => {
        // Работает только если карточка уже находится в Блоке 3
        if (card.parentElement !== block3Elem) return;

        isMoving = true;
        isDraggingActive = false;
        moveDistance = 0;
        startX = e.clientX;
        startY = e.clientY;
        origLeft = card.offsetLeft;
        origTop = card.offsetTop;

        card.setPointerCapture(e.pointerId);
    });

    card.addEventListener('pointermove', (e) => {
        if (!isMoving) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        moveDistance = Math.hypot(dx, dy);

        if (moveDistance > 4) {
            isDraggingActive = true;
        }

        const zoneRect = block3Elem.getBoundingClientRect();
        const cardWidth = card.offsetWidth;
        const cardHeight = card.offsetHeight;

        let newX = origLeft + dx;
        let newY = origTop + dy;

        // Проверяем, не перетащили ли мышку в сторону Блока 2
        const b2Rect = block2Elem.getBoundingClientRect();
        if (e.clientX >= b2Rect.left && e.clientX <= b2Rect.right &&
            e.clientY >= b2Rect.top && e.clientY <= b2Rect.bottom) {
            // Подсветка Блока 2
            block2Elem.classList.add('drag-over');
        } else {
            block2Elem.classList.remove('drag-over');
        }

        // Ограничиваем в пределах Блока 3
        const maxX = Math.max(10, zoneRect.width - cardWidth - 10);
        const maxY = Math.max(10, zoneRect.height - cardHeight - 10);

        newX = Math.max(10, Math.min(newX, maxX));
        newY = Math.max(25, Math.min(newY, maxY));

        card.style.left = `${newX}px`;
        card.style.top = `${newY}px`;
    });

    const endPointerDrag = (e) => {
        if (!isMoving) return;
        isMoving = false;
        block2Elem.classList.remove('drag-over');

        try {
            card.releasePointerCapture(e.pointerId);
        } catch (err) {}

        // Если отпустили над Блоком 2 — возвращаем карточку в Блок 2!
        const b2Rect = block2Elem.getBoundingClientRect();
        if (e.clientX >= b2Rect.left && e.clientX <= b2Rect.right &&
            e.clientY >= b2Rect.top && e.clientY <= b2Rect.bottom) {
            moveCardToBlock2(card);
        }

        // Сбрасываем флаг перетаскивания через мгновение, чтобы не сработал click
        setTimeout(() => {
            isDraggingActive = false;
        }, 100);
    };

    card.addEventListener('pointerup', endPointerDrag);
    card.addEventListener('pointercancel', endPointerDrag);
}
