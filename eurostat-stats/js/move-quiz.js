// Eurostat Stats — Move Quiz
// "Where Should I Move?" decision engine

(function() {
    'use strict';

    var quizState = {
        responses: {},      // { questionId: value 0-100 }
        results: null       // calculated after submission
    };

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
        renderQuiz();
        checkUrlForResults();
    });

    function renderQuiz() {
        var container = document.querySelector('#quizContainer .card-body');
        var questions = CONFIG.moveQuiz.questions;

        var html = '<form id="quizForm">';
        html += '<p class="text-muted mb-4">Adjust each slider based on your preferences, then click <strong>Find My Match</strong>.</p>';

        questions.forEach(function(q, i) {
            var stepNum = i + 1;
            html += '<div class="quiz-question mb-4">';
            html += '<h5 class="mb-2">' + stepNum + '. ' + UI._esc(q.label) + '</h5>';
            html += '<p class="text-muted small mb-3">' + UI._esc(q.description) + '</p>';
            html += '<div class="d-flex align-items-center gap-3">';
            html += '<span class="text-muted small quiz-slider-label">' + UI._esc(q.minLabel) + '</span>';
            html += '<input type="range" class="form-range flex-grow-1" id="q_' + q.id + '" ';
            html += 'min="0" max="100" value="50" data-qid="' + q.id + '">';
            html += '<span class="text-muted small quiz-slider-label text-end">' + UI._esc(q.maxLabel) + '</span>';
            html += '</div>';
            html += '</div>';
        });

        html += '<button type="submit" class="btn-visualize w-100 mt-3">Find My Match</button>';
        html += '</form>';

        container.innerHTML = html;

        // Attach submit handler
        document.getElementById('quizForm').addEventListener('submit', handleSubmit);
    }

    function handleSubmit(e) {
        e.preventDefault();

        // Collect responses
        CONFIG.moveQuiz.questions.forEach(function(q) {
            var input = document.getElementById('q_' + q.id);
            quizState.responses[q.id] = parseInt(input.value, 10);
        });

        // Calculate matches
        quizState.results = calculateMatches(quizState.responses);

        // Show results
        renderResults(quizState.results);

        // Update URL for sharing
        updateShareUrl();
    }

    function calculateMatches(responses) {
        var questions = CONFIG.moveQuiz.questions;
        var countries = CONFIG.moveQuiz.countryScores;
        var results = [];

        Object.keys(countries).forEach(function(code) {
            var country = countries[code];
            var score = 0;
            var maxScore = 0;

            questions.forEach(function(q) {
                var userPref = responses[q.id];        // 0-100
                var countryVal = country[q.id];        // 0-100
                var weight = q.weight;

                // Calculate how well country matches preference
                // 100 = perfect match, 0 = complete mismatch
                var diff = Math.abs(userPref - countryVal);
                var match = 100 - diff;

                score += match * weight;
                maxScore += 100 * weight;
            });

            var percentage = Math.round((score / maxScore) * 100);

            results.push({
                code: code,
                name: country.name,
                flag: country.flag,
                score: percentage,
                traits: country
            });
        });

        // Sort by score descending
        results.sort(function(a, b) { return b.score - a.score; });

        return results;
    }

    function renderResults(results) {
        var container = document.querySelector('#resultsContainer .card-body');
        var top3 = results.slice(0, 3);

        var html = '<h2 class="text-center mb-4">Your Top Matches</h2>';

        top3.forEach(function(match, i) {
            var rank = i + 1;
            var bgClass = i === 0 ? 'bg-success bg-opacity-10' : '';

            html += '<div class="match-card d-flex align-items-center p-3 mb-3 rounded ' + bgClass + '">';
            html += '<span class="fs-2 me-3">' + match.flag + '</span>';
            html += '<div class="flex-grow-1">';
            html += '<h4 class="mb-1">#' + rank + ' ' + UI._esc(match.name) + '</h4>';
            html += '<div class="progress" style="height:24px;">';
            html += '<div class="progress-bar bg-primary" role="progressbar" style="width:' + match.score + '%;" ';
            html += 'aria-valuenow="' + match.score + '" aria-valuemin="0" aria-valuemax="100">';
            html += match.score + '% match</div></div>';
            html += '</div>';
            html += '</div>';
        });

        // Share button
        html += '<div class="text-center mt-4">';
        html += '<button id="shareResultsBtn" class="btn-action">';
        html += 'Share My Results</button>';
        html += '</div>';

        // Show all countries toggle
        html += '<details class="mt-4">';
        html += '<summary class="btn btn-link p-0">See all countries ranked</summary>';
        html += '<div class="mt-3">';
        results.forEach(function(match) {
            html += '<div class="d-flex justify-content-between py-1 border-bottom">';
            html += '<span>' + match.flag + ' ' + UI._esc(match.name) + '</span>';
            html += '<span class="text-muted">' + match.score + '%</span>';
            html += '</div>';
        });
        html += '</div></details>';

        container.innerHTML = html;
        document.getElementById('resultsContainer').style.display = 'block';

        // Scroll to results
        document.getElementById('resultsContainer').scrollIntoView({ behavior: 'smooth' });

        // Attach share handler
        document.getElementById('shareResultsBtn').addEventListener('click', copyShareUrl);
    }

    function updateShareUrl() {
        var params = new URLSearchParams();
        CONFIG.moveQuiz.questions.forEach(function(q) {
            params.set(q.id, quizState.responses[q.id]);
        });
        var newUrl = window.location.pathname + '?' + params.toString();
        history.replaceState(null, '', newUrl);
    }

    function copyShareUrl() {
        var url = window.location.href;
        navigator.clipboard.writeText(url).then(function() {
            UI.toast('Link copied to clipboard!', 'success');
        }).catch(function() {
            UI.toast('Could not copy link', 'error');
        });
    }

    function checkUrlForResults() {
        var params = new URLSearchParams(window.location.search);
        var hasParams = false;

        CONFIG.moveQuiz.questions.forEach(function(q) {
            var val = params.get(q.id);
            if (val !== null) {
                var numVal = parseInt(val, 10);
                if (!isNaN(numVal) && numVal >= 0 && numVal <= 100) {
                    hasParams = true;
                    quizState.responses[q.id] = numVal;
                    // Update slider to match
                    var input = document.getElementById('q_' + q.id);
                    if (input) input.value = numVal;
                }
            }
        });

        if (hasParams) {
            quizState.results = calculateMatches(quizState.responses);
            renderResults(quizState.results);
        }
    }
})();
