document.getElementById('signup-btn').addEventListener('click', signup);
document.getElementById('login-btn').addEventListener('click', login);
document.getElementById('add-subject-btn').addEventListener('click', addSubject);
document.getElementById('add-category-btn').addEventListener('click', addCategory);
document.getElementById('add-question-btn').addEventListener('click', addQuestion);
document.getElementById('show-login-btn').addEventListener('click', showLogin);
document.getElementById('show-signup-btn').addEventListener('click', showSignup);

let authHeader;
let currentSubjectId = null;
let currentCategoryId = null;

function showLogin() {
    document.getElementById('signup-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
}

function showSignup() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('signup-section').style.display = 'block';
}

async function signup() {
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;

    const response = await fetch('http://localhost:5000/admin/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, password })
    });

    if (response.ok) {
        alert('Admin created successfully. Please log in.');
        showLogin();
    } else {
        alert('Sign-up failed. Phone number might already exist.');
    }
}

async function login() {
    const phone = document.getElementById('login-phone').value;
    const password = document.getElementById('login-password').value;
    authHeader = 'Basic ' + btoa(`${phone}:${password}`);

    const response = await fetch('http://localhost:5000/admin/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, password })
    });

    if (response.ok) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-section').style.display = 'block';
        loadSubjects();
    } else {
        alert('Invalid credentials');
    }
}

async function addSubject() {
    const subjectName = document.getElementById('subject-name').value;

    const response = await fetch('http://localhost:5000/admin/subjects', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
        },
        body: JSON.stringify({ subject_name: subjectName })
    });

    if (response.ok) {
        alert('Subject added successfully');
        loadSubjects();
    } else {
        alert('Failed to add subject');
    }
}

async function loadSubjects() {
    const response = await fetch('http://localhost:5000/admin/get_subjects', {
        method: 'GET',
        headers: {
            'Authorization': authHeader
        }
    });
    const subjects = await response.json();
    const subjectsList = document.getElementById('subjects-list');
    subjectsList.innerHTML = '';
    subjects.forEach(subject => {
        const li = document.createElement('li');
        li.textContent = subject.subject_name;
        li.addEventListener('click', () => {
            currentSubjectId = subject._id;
            loadCategories(subject._id);
        });
        subjectsList.appendChild(li);
    });
}

async function loadCategories(subjectId) {
    document.getElementById('categories-section').style.display = 'block';
    const response = await fetch(`http://localhost:5000/admin/subjects/${subjectId}/categories`, {
        method: 'GET',
        headers: {
            'Authorization': authHeader
        }
    });
    const categories = await response.json();
    const categoriesList = document.getElementById('categories-list');
    categoriesList.innerHTML = '';
    categories.forEach(category => {
        const li = document.createElement('li');
        li.textContent = category.category_name;
        li.addEventListener('click', () => {
            currentCategoryId = category._id;
            loadQuestions(category._id);
        });
        categoriesList.appendChild(li);
    });
}

async function addCategory() {
    const categoryName = document.getElementById('category-name').value;
    await fetch(`http://localhost:5000/admin/subjects/categories`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
        },
        body: JSON.stringify({ category_name: categoryName })
    });
    loadCategories(currentSubjectId);
}

async function loadQuestions(categoryId) {
    document.getElementById('questions-section').style.display = 'block';
    const response = await fetch(`http://localhost:5000/admin/categories/questions`, {
        method: 'GET',
        headers: {
            'Authorization': authHeader
        }
    });
    const questions = await response.json();
    const questionsList = document.getElementById('questions-list');
    questionsList.innerHTML = '';
    questions.forEach(question => {
        const li = document.createElement('li');
        li.textContent = question.question_text;
        questionsList.appendChild(li);
    });
}

async function addQuestion() {
    const questionText = document.getElementById('question-text').value;
    const answerChoices = document.getElementById('answer-choices').value.split(',');
    const correctAnswer = document.getElementById('correct-answer').value;
    const difficulty = document.getElementById('difficulty').value;
    const isOnline = document.getElementById('is-online').checked;

    const response = await fetch(`http://localhost:5000/admin/questions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
        },
        body: JSON.stringify({
            question_text: questionText,
            answer_choices: answerChoices,
            correct_answer: correctAnswer,
            difficulty: difficulty,
            category_id: currentCategoryId,
            is_online: isOnline
        })
    });

    if (response.ok) {
        alert('Question added successfully');
        loadQuestions(currentCategoryId);
    } else {
        alert('Failed to add question');
    }
}