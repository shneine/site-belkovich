const colors = [
    '#ff4d4d', '#22c55e', '#d946ef', '#3b82f6',
    '#facc15', '#06b6d4', '#fb923c', '#a855f7'
];

const input = document.getElementById('input-string');
const block1 = document.getElementById('block-1');
const block2 = document.getElementById('block-2');
const block3 = document.getElementById('block-3');

let dragged = null;
let isDrag = false;
let offsetX = 0;
let offsetY = 0;

document.getElementById('btn-parse').addEventListener('click', parse);

const clearBtn = document.getElementById('btn-clear-block1');
if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        block1.innerHTML = '<span class="block-badge badge-red">1</span>';
    });
}

function parse() {
    const text = input.value.trim();
    if (!text) return;

    const parts = text.split(/[-–—]/).map(s => s.trim()).filter(Boolean);

    const lower = [];
    const upper = [];
    const numbers = [];

    parts.forEach(item => {
        if (!isNaN(item)) {
            numbers.push(item);
        } else if (item[0] === item[0].toUpperCase() && item[0] !== item[0].toLowerCase()) {
            upper.push(item);
        } else {
            lower.push(item);
        }
    });

    lower.sort((a, b) => a.localeCompare(b, 'ru'));
    upper.sort((a, b) => a.localeCompare(b, 'ru'));
    numbers.sort((a, b) => Number(a) - Number(b));

    const assoc = {};
    const items = [];
    let order = 0;

    lower.forEach((w, i) => {
        const key = 'a' + (i + 1);
        assoc[key] = w;
        items.push({ key, val: w, order: order++, color: colors[order % colors.length] });
    });

    upper.forEach((w, i) => {
        const key = 'b' + (i + 1);
        assoc[key] = w;
        items.push({ key, val: w, order: order++, color: colors[order % colors.length] });
    });

    numbers.forEach((n, i) => {
        const key = 'n' + (i + 1);
        assoc[key] = n;
        items.push({ key, val: n, order: order++, color: colors[order % colors.length] });
    });

    console.log('Ассоциативный массив:', assoc);

    block2.innerHTML = '<span class="block-badge badge-gray">2</span>';
    block3.innerHTML = '<span class="block-badge badge-blue">3</span>';
    block1.innerHTML = '<span class="block-badge badge-red">1</span>';

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'word-card';
        card.textContent = `${item.key} ${item.val}`;
        card.draggable = true;
        card.dataset.val = item.val;
        card.dataset.order = item.order;
        card.dataset.color = item.color;
        card.style.backgroundColor = item.color;

        card.addEventListener('dragstart', (e) => {
            isDrag = true;
            dragged = card;
            const rect = card.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
        });

        card.addEventListener('dragend', () => {
            setTimeout(() => { isDrag = false; }, 50);
        });

        card.addEventListener('click', () => {
            if (isDrag) return;
            if (card.parentElement === block3) {
                const span = document.createElement('span');
                span.className = 'clicked-word';
                span.textContent = item.val;
                span.style.color = item.color;
                block1.appendChild(span);
            }
        });

        block2.appendChild(card);
    });
}

[block2, block3].forEach(zone => {
    zone.addEventListener('dragover', (e) => e.preventDefault());

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        if (!dragged) return;

        if (zone === block3) {
            const rect = block3.getBoundingClientRect();
            const x = Math.max(10, e.clientX - rect.left - offsetX);
            const y = Math.max(25, e.clientY - rect.top - offsetY);

            dragged.style.position = 'absolute';
            dragged.style.left = x + 'px';
            dragged.style.top = y + 'px';
            dragged.style.backgroundColor = '#c4c4c4';
            block3.appendChild(dragged);
        } else if (zone === block2) {
            dragged.style.position = '';
            dragged.style.left = '';
            dragged.style.top = '';
            dragged.style.backgroundColor = dragged.dataset.color;

            const myOrder = Number(dragged.dataset.order);
            const cards = Array.from(block2.querySelectorAll('.word-card'));
            const next = cards.find(c => Number(c.dataset.order) > myOrder);

            if (next) {
                block2.insertBefore(dragged, next);
            } else {
                block2.appendChild(dragged);
            }
        }
        dragged = null;
    });
});

parse();
