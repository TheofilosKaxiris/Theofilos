// Eurostat Stats — Perception Quiz
// "Rich or Poor?" country guessing game

(function() {
    'use strict';

    var state = {
        currentQuestion: 0,
        answers: [],        // Array of { questionId, selectedAnswer, correct }
        finished: false
    };

    document.addEventListener('DOMContentLoaded', function() {
        renderQuestion();
    });

    function getCountryName(code) {
        return CONFIG.countries[code] || code;
    }

    function getCountryFlag(code) {
        // Convert country code to flag emoji
        var flags = {
            AT: '\u{1F1E6}\u{1F1F9}', BE: '\u{1F1E7}\u{1F1EA}', BG: '\u{1F1E7}\u{1F1EC}',
            HR: '\u{1F1ED}\u{1F1F7}', CY: '\u{1F1E8}\u{1F1FE}', CZ: '\u{1F1E8}\u{1F1FF}',
            DK: '\u{1F1E9}\u{1F1F0}', EE: '\u{1F1EA}\u{1F1EA}', FI: '\u{1F1EB}\u{1F1EE}',
            FR: '\u{1F1EB}\u{1F1F7}', DE: '\u{1F1E9}\u{1F1EA}', EL: '\u{1F1EC}\u{1F1F7}',
            HU: '\u{1F1ED}\u{1F1FA}', IE: '\u{1F1EE}\u{1F1EA}', IT: '\u{1F1EE}\u{1F1F9}',
            LV: '\u{1F1F1}\u{1F1FB}', LT: '\u{1F1F1}\u{1F1F9}', LU: '\u{1F1F1}\u{1F1FA}',
            MT: '\u{1F1F2}\u{1F1F9}', NL: '\u{1F1F3}\u{1F1F1}', PL: '\u{1F1F5}\u{1F1F1}',
            PT: '\u{1F1F5}\u{1F1F9}', RO: '\u{1F1F7}\u{1F1F4}', SK: '\u{1F1F8}\u{1F1F0}',
            SI: '\u{1F1F8}\u{1F1EE}', ES: '\u{1F1EA}\u{1F1F8}', SE: '\u{1F1F8}\u{1F1EA}'
        };
        return flags[code] || '';
    }

    function renderQuestion() {
        var container = document.querySelector('#quizContainer .card-body');
        var questions = CONFIG.perceptionQuiz.questions;
        var q = questions[state.currentQuestion];

        var html = '';

        // Progress bar
        html += '<div class="quiz-progress mb-4">';
        html += '<div class="d-flex justify-content-between mb-2">';
        html += '<span>Question ' + (state.currentQuestion + 1) + ' of ' + questions.length + '</span>';
        html += '<span>Score: ' + getScore() + '/' + state.currentQuestion + '</span>';
        html += '</div>';
        html += '<div class="progress" style="height: 8px;">';
        var pct = ((state.currentQuestion) / questions.length) * 100;
        html += '<div class="progress-bar" style="width:' + pct + '%;"></div>';
        html += '</div></div>';

        // Stats display
        html += '<div class="perception-stats-card mb-4">';
        html += '<h3 class="text-center mb-4">Which country has these stats?</h3>';
        html += '<div class="perception-stats-grid">';
        for (var stat in q.stats) {
            html += '<div class="perception-stat">';
            html += '<div class="perception-stat-label">' + UI._esc(stat) + '</div>';
            html += '<div class="perception-stat-value">' + UI._esc(q.stats[stat]) + '</div>';
            html += '</div>';
        }
        html += '</div></div>';

        // Answer options
        html += '<div class="perception-options">';
        q.options.forEach(function(code) {
            html += '<button class="perception-option" data-code="' + code + '">';
            html += '<span class="perception-option-flag">' + getCountryFlag(code) + '</span>';
            html += '<span class="perception-option-name">' + UI._esc(getCountryName(code)) + '</span>';
            html += '</button>';
        });
        html += '</div>';

        container.innerHTML = html;

        // Attach click handlers
        container.querySelectorAll('.perception-option').forEach(function(btn) {
            btn.addEventListener('click', function() {
                handleAnswer(this.dataset.code);
            });
        });
    }

    function handleAnswer(selectedCode) {
        var q = CONFIG.perceptionQuiz.questions[state.currentQuestion];
        var correct = selectedCode === q.answer;

        state.answers.push({
            questionId: q.id,
            selectedAnswer: selectedCode,
            correct: correct
        });

        // Show feedback
        showFeedback(q, selectedCode, correct);
    }

    function showFeedback(question, selectedCode, correct) {
        var container = document.querySelector('#quizContainer .card-body');

        var html = '';

        // Result header
        html += '<div class="perception-feedback text-center mb-4">';
        if (correct) {
            html += '<div class="perception-result perception-correct">';
            html += '<span class="perception-result-icon">&#10003;</span> Correct!';
            html += '</div>';
        } else {
            html += '<div class="perception-result perception-incorrect">';
            html += '<span class="perception-result-icon">&#10007;</span> Not quite!';
            html += '</div>';
        }
        html += '</div>';

        // Answer reveal
        html += '<div class="perception-reveal text-center mb-4">';
        html += '<div class="perception-reveal-flag">' + getCountryFlag(question.answer) + '</div>';
        html += '<div class="perception-reveal-country">' + UI._esc(getCountryName(question.answer)) + '</div>';
        html += '</div>';

        // Explanation
        html += '<div class="perception-explanation mb-4">';
        html += '<p>' + UI._esc(question.explanation) + '</p>';
        html += '</div>';

        // Next button
        html += '<div class="text-center">';
        if (state.currentQuestion < CONFIG.perceptionQuiz.questions.length - 1) {
            html += '<button id="nextQuestionBtn" class="btn-visualize">Next Question</button>';
        } else {
            html += '<button id="showResultsBtn" class="btn-visualize">See My Results</button>';
        }
        html += '</div>';

        container.innerHTML = html;

        // Attach handlers
        var nextBtn = document.getElementById('nextQuestionBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                state.currentQuestion++;
                renderQuestion();
            });
        }

        var resultsBtn = document.getElementById('showResultsBtn');
        if (resultsBtn) {
            resultsBtn.addEventListener('click', function() {
                state.finished = true;
                renderResults();
            });
        }
    }

    function getScore() {
        return state.answers.filter(function(a) { return a.correct; }).length;
    }

    function getScoreMessage(score) {
        var messages = CONFIG.perceptionQuiz.scoreMessages;
        if (score <= 3) return messages['0-3'];
        if (score <= 6) return messages['4-6'];
        if (score <= 8) return messages['7-8'];
        return messages['9-10'];
    }

    function renderResults() {
        document.getElementById('quizContainer').style.display = 'none';
        var container = document.querySelector('#resultsContainer .card-body');
        document.getElementById('resultsContainer').style.display = 'block';

        var score = getScore();
        var total = CONFIG.perceptionQuiz.questions.length;
        var msg = getScoreMessage(score);

        var html = '';

        // Score display
        html += '<div class="perception-final-score text-center mb-4">';
        html += '<div class="perception-score-number">' + score + '/' + total + '</div>';
        html += '<div class="perception-score-title">' + UI._esc(msg.title) + '</div>';
        html += '<div class="perception-score-message">' + UI._esc(msg.message) + '</div>';
        html += '</div>';

        // Score breakdown
        html += '<div class="perception-breakdown mb-4">';
        html += '<h4>Your Answers</h4>';
        CONFIG.perceptionQuiz.questions.forEach(function(q, i) {
            var answer = state.answers[i];
            var icon = answer.correct ? '&#10003;' : '&#10007;';
            var cls = answer.correct ? 'perception-answer-correct' : 'perception-answer-incorrect';
            html += '<div class="perception-answer-row ' + cls + '">';
            html += '<span class="perception-answer-icon">' + icon + '</span>';
            html += '<span>' + getCountryFlag(q.answer) + ' ' + UI._esc(getCountryName(q.answer)) + '</span>';
            if (!answer.correct) {
                html += '<span class="text-muted">(you said: ' + UI._esc(getCountryName(answer.selectedAnswer)) + ')</span>';
            }
            html += '</div>';
        });
        html += '</div>';

        // Actions
        html += '<div class="d-flex gap-3 justify-content-center">';
        html += '<button id="shareResultsBtn" class="btn-action">Share Results</button>';
        html += '<button id="retryQuizBtn" class="btn-action">Try Again</button>';
        html += '</div>';

        container.innerHTML = html;

        // Scroll to results
        document.getElementById('resultsContainer').scrollIntoView({ behavior: 'smooth' });

        // Attach handlers
        document.getElementById('shareResultsBtn').addEventListener('click', shareResults);
        document.getElementById('retryQuizBtn').addEventListener('click', retryQuiz);
    }

    function shareResults() {
        var score = getScore();
        var total = CONFIG.perceptionQuiz.questions.length;
        var url = window.location.origin + window.location.pathname;
        var text = 'I scored ' + score + '/' + total + ' on the "Rich or Poor?" EU quiz! Can you beat me? ' + url;

        if (navigator.share) {
            navigator.share({
                title: 'Rich or Poor? EU Quiz',
                text: text,
                url: url
            }).catch(function() {});
        } else {
            navigator.clipboard.writeText(text).then(function() {
                UI.toast('Results copied to clipboard!', 'success');
            }).catch(function() {
                UI.toast('Could not copy results', 'error');
            });
        }
    }

    function retryQuiz() {
        state.currentQuestion = 0;
        state.answers = [];
        state.finished = false;

        document.getElementById('resultsContainer').style.display = 'none';
        document.getElementById('quizContainer').style.display = 'block';
        renderQuestion();
    }
})();
