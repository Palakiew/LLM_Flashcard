let flashcardsData = [];
let currentSubject = '';

// File upload handling
const fileInput = document.getElementById('fileInput');
const fileUploadArea = document.querySelector('.file-upload-area');
const fileInfo = document.getElementById('fileInfo');

fileInput.addEventListener('change', handleFileUpload);

// Drag and drop functionality
fileUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUploadArea.classList.add('dragover');
});

fileUploadArea.addEventListener('dragleave', () => {
    fileUploadArea.classList.remove('dragover');
});

fileUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        handleFileUpload();
    }
});

function handleFileUpload() {
    const file = fileInput.files[0];
    if (file) {
        fileInfo.style.display = 'block';
        fileInfo.innerHTML = `
            <strong>File uploaded:</strong> ${file.name} (${(file.size / 1024).toFixed(1)} KB)<br>
            <strong>Type:</strong> ${file.type || 'Unknown'}
        `;

        // Read file content
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('textInput').value = e.target.result;
        };
        reader.readAsText(file);
    }
}

function generateFlashcards() {
    const textContent = document.getElementById('textInput').value.trim();
    const subject = document.getElementById('subjectSelect').value;
    
    if (!textContent) {
        alert('Please provide some educational content first!');
        return;
    }

    currentSubject = subject;
    
    // Show loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('generateBtn').disabled = true;
    document.getElementById('flashcardsContainer').style.display = 'none';

    // Simulate AI processing (in real implementation, this would call an LLM API)
    setTimeout(() => {
        const generatedCards = simulateAIGeneration(textContent, subject);
        displayFlashcards(generatedCards);
        
        // Hide loading
        document.getElementById('loading').style.display = 'none';
        document.getElementById('generateBtn').disabled = false;
    }, 3000);
}

function simulateAIGeneration(content, subject) {
    // This simulates what an LLM would generate
    // In real implementation, this would send content to OpenAI/Hugging Face/etc.
    
    const words = content.split(' ');
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const cards = [];
    const cardCount = Math.min(Math.max(10, Math.floor(words.length / 50)), 20);
    
    // Generate different types of questions based on subject
    const questionTypes = getQuestionTypes(subject);
    
    for (let i = 0; i < cardCount; i++) {
        const sentence = sentences[Math.floor(Math.random() * sentences.length)].trim();
        if (sentence.length > 20) {
            const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
            const card = generateQuestionAnswer(sentence, questionType, subject);
            if (card) cards.push(card);
        }
    }
    
    return cards.slice(0, Math.min(cardCount, 15));
}

function getQuestionTypes(subject) {
    const baseTypes = ['definition', 'explanation', 'example', 'comparison'];
    
    const subjectSpecific = {
        'biology': ['process', 'function', 'classification', 'structure'],
        'chemistry': ['reaction', 'properties', 'formula', 'bonding'],
        'physics': ['law', 'principle', 'formula', 'application'],
        'mathematics': ['theorem', 'proof', 'calculation', 'property'],
        'history': ['cause', 'effect', 'timeline', 'significance'],
        'computer_science': ['algorithm', 'implementation', 'complexity', 'application']
    };
    
    return [...baseTypes, ...(subjectSpecific[subject] || [])];
}

function generateQuestionAnswer(sentence, questionType, subject) {
    // Extract key terms from the sentence
    const words = sentence.split(' ').filter(word => word.length > 4);
    const keyWord = words[Math.floor(Math.random() * words.length)];
    
    const templates = {
        'definition': {
            q: `What is ${keyWord}?`,
            a: sentence
        },
        'explanation': {
            q: `Explain the concept mentioned in: "${sentence.substring(0, 50)}..."`,
            a: sentence
        },
        'example': {
            q: `Provide an example related to: ${keyWord}`,
            a: sentence
        },
        'process': {
            q: `What process is described here?`,
            a: sentence
        },
        'function': {
            q: `What is the function of ${keyWord}?`,
            a: sentence
        }
    };
    
    const template = templates[questionType] || templates['definition'];
    
    return {
        question: template.q,
        answer: template.a,
        type: questionType,
        difficulty: Math.random() > 0.7 ? 'Hard' : Math.random() > 0.4 ? 'Medium' : 'Easy'
    };
}

function displayFlashcards(cards) {
    flashcardsData = cards;
    
    // Update stats
    const statsHtml = `
        <div class="stat-item">
            <span class="stat-number">${cards.length}</span>
            <div class="stat-label">Flashcards</div>
        </div>
        <div class="stat-item">
            <span class="stat-number">${cards.filter(c => c.difficulty === 'Easy').length}</span>
            <div class="stat-label">Easy</div>
        </div>
        <div class="stat-item">
            <span class="stat-number">${cards.filter(c => c.difficulty === 'Medium').length}</span>
            <div class="stat-label">Medium</div>
        </div>
        <div class="stat-item">
            <span class="stat-number">${cards.filter(c => c.difficulty === 'Hard').length}</span>
            <div class="stat-label">Hard</div>
        </div>
    `;
    document.getElementById('stats').innerHTML = statsHtml;
    
    // Display flashcards
    const grid = document.getElementById('flashcardsGrid');
    grid.innerHTML = '';
    
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'flashcard';
        cardElement.onclick = () => flipCard(cardElement);
        
        cardElement.innerHTML = `
            <div class="card-face card-front">
                <div class="card-label">Question ${index + 1} • ${card.difficulty}</div>
                <div class="card-content">${card.question}</div>
                <div class="flip-hint">Click to reveal answer</div>
            </div>
            <div class="card-face card-back">
                <div class="card-label">Answer ${index + 1} • ${card.type}</div>
                <div class="card-content">${card.answer}</div>
                <div class="flip-hint">Click to see question</div>
            </div>
        `;
        
        grid.appendChild(cardElement);
    });
    
    document.getElementById('flashcardsContainer').style.display = 'block';
}

function flipCard(cardElement) {
    cardElement.classList.toggle('flipped');
}

function exportFlashcards(format) {
    if (flashcardsData.length === 0) {
        alert('No flashcards to export!');
        return;
    }

    let content, filename, mimeType;
    
    switch (format) {
        case 'csv':
            content = 'Question,Answer,Type,Difficulty\n';
            flashcardsData.forEach(card => {
                content += `"${card.question}","${card.answer}","${card.type}","${card.difficulty}"\n`;
            });
            filename = 'flashcards.csv';
            mimeType = 'text/csv';
            break;
            
        case 'json':
            content = JSON.stringify(flashcardsData, null, 2);
            filename = 'flashcards.json';
            mimeType = 'application/json';
            break;
            
        case 'anki':
            content = flashcardsData.map(card => 
                `${card.question}\t${card.answer}\t${card.type}`
            ).join('\n');
            filename = 'flashcards_anki.txt';
            mimeType = 'text/plain';
            break;
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}