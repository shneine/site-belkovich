// вопросы
const rawQuestions = [
    {
        text: "А когда с человеком может произойти дрожемент?",
        answers: [
            { text: "Когда он влюбляется", isCorrect: false },
            { text: "Когда он идет шопиться", isCorrect: false },
            { text: "Когда он слышит смешную шутку", isCorrect: false },
            { text: "Когда он боится, пугается", isCorrect: true }
        ],
        explanation: "Лексема «дрожемент» имплицирует состояние крайнего напряжения и страха: «У меня всегда дрожемент в ногах, когда копы подходят»."
    },
    {
        text: "Говорят, Антон заовнил всех. Это еще как понимать?",
        answers: [
            { text: "Как так, заовнил? Ну и хамло. Кто с ним теперь дружить-то будет?", isCorrect: false },
            { text: "Антон очень надоедливый и въедливый человек, всех задолбал", isCorrect: false },
            { text: "Молодец, Антон, всех победил!", isCorrect: true },
            { text: "Нет ничего плохого в том, что Антон тщательно выбирает себе друзей", isCorrect: false }
        ],
        explanation: "Термин «заовнить» заимствован из английского языка, он происходит от слова own и переводится как «победить», «завладеть», «получить»."
    },
    {
        text: "А фразу «заскамить мамонта» как понимать?",
        answers: [
            { text: "Разозлить кого-то из родителей", isCorrect: false },
            { text: "Увлекаться археологией", isCorrect: false },
            { text: "Развести недотепу на деньги", isCorrect: true },
            { text: "Оскорбить пожилого человека", isCorrect: false }
        ],
        explanation: "Заскамить мамонта — значит обмануть или развести на деньги. Почему мамонта? Потому что мошенники часто выбирают в жертвы пожилых людей (древних, как мамонты), которых легко обвести вокруг пальца."
    },
    {
        text: "Кто такие бефефе?",
        answers: [
            { text: "Вши?", isCorrect: false },
            { text: "Милые котики, такие милые, что бефефе", isCorrect: false },
            { text: "Лучшие друзья", isCorrect: true },
            { text: "Люди, которые не держат слово", isCorrect: false }
        ],
        explanation: "Бефефе — это лучшие друзья. Этакая аббревиатура от английского выражения best friends forever."
    },
    {
        text: "Что из перечисленного можно назвать крашем, если ты чиллишь в компании и вдруг залипаешь на кого-то?",
        answers: [
            { text: "Человек, который тебе очень нравится и вызывает симпатию", isCorrect: true },
            { text: "Тот, на кого приятно смотреть и хочется общаться", isCorrect: false },
            { text: "Твоя сильно накрашенная подруга, которая переоценила свой макияж", isCorrect: false },
            { text: "Трэш в более мягкой интерпретации", isCorrect: false }
        ],
        explanation: "«Краш» — это объект симпатии; «чиллить» — расслабляться, отдыхать; «залипать» — засматриваться или задумываться."
    }
];

// Перемешивание элементов массива
function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

// Элементы страницы
const questionsList = document.getElementById('questions-list');
const dynamicArea = document.getElementById('dynamic-area');
const answersContainer = document.getElementById('answers-container');
const endMessage = document.getElementById('end-message');

let questions = [];
let currentQuestionIndex = 0;
let correctAnswersCount = 0;
let isAnswering = false;
const questionRecords = [];

// Инициализация теста
function initTest() {
    if (!questionsList || !answersContainer) return;
    questions = shuffle(rawQuestions);
    currentQuestionIndex = 0;
    correctAnswersCount = 0;
    isAnswering = false;
    questionRecords.length = 0;
    questionsList.innerHTML = '';
    endMessage.style.display = 'none';

    showNextQuestion();
}

// Отображение очередного вопроса
function showNextQuestion() {
    const qData = questions[currentQuestionIndex];

    const qWrapper = document.createElement('div');
    qWrapper.className = 'question-wrapper';

    const qItem = document.createElement('div');
    qItem.className = 'question-item';

    const qText = document.createElement('span');
    qText.textContent = `${currentQuestionIndex + 1}. ${qData.text}`;

    const qMarker = document.createElement('span');
    qMarker.className = 'question-marker';

    qItem.appendChild(qText);
    qItem.appendChild(qMarker);
    qWrapper.appendChild(qItem);
    questionsList.appendChild(qWrapper);

    questionRecords.push({
        wrapper: qWrapper,
        item: qItem,
        question: qData,
        explanationBox: null
    });

    answersContainer.innerHTML = '';
    const shuffledAnswers = shuffle(qData.answers);

    shuffledAnswers.forEach((ans) => {
        const block = document.createElement('div');
        block.className = 'answer-block';
        block.textContent = ans.text;

        block.addEventListener('click', () => {
            handleAnswerSelect(ans, block, qData, qMarker);
        });

        answersContainer.appendChild(block);
    });

    isAnswering = false;
}

// Обработка клика по ответу
function handleAnswerSelect(selectedAnswer, selectedBlock, qData, qMarker) {
    if (isAnswering) return;
    isAnswering = true;

    const allBlocks = Array.from(answersContainer.querySelectorAll('.answer-block'));

    if (selectedAnswer.isCorrect) {
        correctAnswersCount++;

        selectedBlock.classList.add('selected-correct');
        const explText = document.createElement('div');
        explText.className = 'answer-explanation';
        explText.textContent = qData.explanation;
        selectedBlock.appendChild(explText);

        qMarker.textContent = '✔';
        qMarker.className = 'question-marker marker-correct';

        setTimeout(() => {
            const otherBlocks = allBlocks.filter(b => b !== selectedBlock);
            otherBlocks.forEach((b, idx) => {
                b.style.transitionDelay = `${idx * 0.15}s`;
                b.classList.add('fly-right');
            });

            setTimeout(() => {
                selectedBlock.style.transitionDelay = '0s';
                selectedBlock.classList.add('fly-right');

                setTimeout(() => {
                    advanceToNext();
                }, 700);
            }, 800);
        }, 2000);

    } else {
        selectedBlock.classList.add('selected-wrong');
        qMarker.textContent = '✖';
        qMarker.className = 'question-marker marker-wrong';

        setTimeout(() => {
            allBlocks.forEach((b, idx) => {
                b.style.transitionDelay = `${idx * 0.15}s`;
                b.classList.add('fly-right');
            });

            setTimeout(() => {
                advanceToNext();
            }, allBlocks.length * 150 + 600);
        }, 1500);
    }
}

// Переход к следующему вопросу
function advanceToNext() {
    answersContainer.innerHTML = '';
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        showNextQuestion();
    } else {
        finishTest();
    }
}

// Завершение теста
function finishTest() {
    answersContainer.innerHTML = '';

    endMessage.style.display = 'block';
    endMessage.innerHTML = `
        <div>Вопросы закончились</div>
        <div class="end-stats">Правильных ответов: ${correctAnswersCount} из ${questions.length}</div>
        <div class="end-hint">Нажмите на любой вопрос выше, чтобы увидеть правильный ответ</div>
    `;

    questionRecords.forEach(record => {
        record.item.classList.add('interactive');

        record.item.addEventListener('click', () => {
            questionRecords.forEach(other => {
                if (other !== record && other.explanationBox) {
                    other.explanationBox.remove();
                    other.explanationBox = null;
                }
            });

            if (record.explanationBox) {
                record.explanationBox.remove();
                record.explanationBox = null;
            } else {
                const correctAns = record.question.answers.find(a => a.isCorrect);
                const box = document.createElement('div');
                box.className = 'question-explanation-box';
                box.innerHTML = `
                    <div><strong>Правильный ответ:</strong> ${correctAns.text}</div>
                    <div style="margin-top: 4px;"><strong>Пояснение:</strong> ${record.question.explanation}</div>
                `;
                record.wrapper.appendChild(box);
                record.explanationBox = box;
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', initTest);
