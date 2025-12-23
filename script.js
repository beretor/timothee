document.addEventListener('DOMContentLoaded', () => {
    // State
    const state = {
        scoreAsnieres: 0,
        scoreAdversaire: 0,
        homeName: 'Asnières',
        awayName: 'Adversaire',
        logs: [],
        teamStats: {}, // Format: { "TeamName": { played: 0, won: 0, drawn: 0, lost: 0, points: 0, bp: 0, bc: 0, diff: 0 } }
        stats: {
            scorer: {},
            assist: {}
        }
    };

    // New: Match History
    const historyState = {
        matches: []
    };

    // DOM Elements
    const elements = {
        scoreHome: document.getElementById('score-home'),
        scoreAway: document.getElementById('score-away'),
        logList: document.getElementById('goal-log-list'),
        historyList: document.getElementById('match-history-list'),
        // Dynamic Name Elements
        displayHome: document.getElementById('display-home-name'),
        displayAway: document.getElementById('display-away-name'),
        configHome: document.getElementById('config-home-name'),
        configAway: document.getElementById('config-away-name')
    };

    // Configuration Logic
    elements.configHome.addEventListener('input', (e) => {
        state.homeName = e.target.value.trim() || 'Asnières';
        elements.displayHome.textContent = state.homeName;
    });

    elements.configAway.addEventListener('input', (e) => {
        state.awayName = e.target.value.trim() || 'Adversaire';
        elements.displayAway.textContent = state.awayName;
    });

    // Goal Form Elements
    const formElements = {
        section: document.getElementById('goal-form-section'),
        scorerInput: document.getElementById('form-scorer'),
        assistInput: document.getElementById('form-assist')
    };

    let currentGoalTeam = null;

    window.addGoal = (team) => {
        currentGoalTeam = team;

        // Update Modal Title
        const teamName = currentGoalTeam === 'home' ? state.homeName : state.awayName;
        document.querySelector('.goal-form-header h4').textContent = `Détails du but pour ${teamName}`;

        formElements.section.classList.remove('hidden');
        // Clear previous inputs
        formElements.scorerInput.value = '';
        formElements.assistInput.value = '';
        formElements.scorerInput.focus();
    };

    window.closeGoalForm = () => {
        formElements.section.classList.add('hidden');
        // Clear inputs on close to ensure clean state
        formElements.scorerInput.value = '';
        formElements.assistInput.value = '';
        currentGoalTeam = null;
    };

    window.confirmGoal = () => {
        if (!currentGoalTeam) return;

        const confirmBtn = document.querySelector('.btn-confirm');
        confirmBtn.classList.add('pulse');
        // Remove class after animation to allow reuse
        setTimeout(() => confirmBtn.classList.remove('pulse'), 300);

        // Update Score Triggered on Confirmation (ALWAYS happens)
        if (currentGoalTeam === 'home') {
            state.scoreAsnieres++;
            updateDisplay('home');
        } else if (currentGoalTeam === 'away') {
            state.scoreAdversaire++;
            updateDisplay('away');
        }

        // Handle Logging - ONLY if scorer name is provided
        const scorerName = formElements.scorerInput.value.trim();
        const assistName = formElements.assistInput.value.trim();

        // LOGIC: Only add to stats and logs if a valid name is entered
        if (scorerName) {
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Update Stats - only with valid names
            updateStat('scorer', scorerName);
            if (assistName) {
                updateStat('assist', assistName);
            }

            let logText = scorerName;
            if (assistName) {
                logText += ` (Passe de ${assistName})`;
            }

            // Add Team Name to Log for clarity
            const teamName = currentGoalTeam === 'home' ? state.homeName : state.awayName;
            logText += ` (${teamName})`;

            const logEntry = {
                id: Date.now(),
                team: currentGoalTeam,
                player: logText,
                time: timestamp
            };

            state.logs.unshift(logEntry); // Add to top
            renderLog();
        }

        // Clear the input fields
        formElements.scorerInput.value = '';
        formElements.assistInput.value = '';

        closeGoalForm();
    };


    // Helper function to check if a name is valid
    function isValidPlayerName(name) {
        if (!name || typeof name !== 'string') return false;
        const trimmed = name.trim().toLowerCase();
        return trimmed !== '' &&
            trimmed !== 'joueur inconnu' &&
            trimmed !== 'inconnu';
    }

    function updateStat(type, name) {
        // Only update stats for valid names
        if (!isValidPlayerName(name)) return;

        if (!state.stats[type][name]) {
            state.stats[type][name] = 0;
        }
        state.stats[type][name]++;
        renderIndividualStats();
    }

    function renderIndividualStats() {
        const scorerBody = document.getElementById('stats-scorers-body');
        const assistBody = document.getElementById('stats-assisters-body');

        // CLEANUP: Remove invalid entries from stats before rendering
        cleanupInvalidStats();

        // Render Scorers
        renderStatTable(scorerBody, state.stats.scorer);
        // Render Assists
        renderStatTable(assistBody, state.stats.assist);
    }

    // CLEANUP: Delete all existing records with invalid names
    function cleanupInvalidStats() {
        // Clean scorers
        Object.keys(state.stats.scorer).forEach(name => {
            if (!isValidPlayerName(name)) {
                delete state.stats.scorer[name];
            }
        });

        // Clean assists
        Object.keys(state.stats.assist).forEach(name => {
            if (!isValidPlayerName(name)) {
                delete state.stats.assist[name];
            }
        });
    }

    function renderStatTable(tbody, data) {
        tbody.innerHTML = '';

        // FILTER: Exclude invalid player names
        const validEntries = Object.entries(data).filter(([name]) => isValidPlayerName(name));

        // SORTING: Sort by count (goals/assists) from most to least
        const sorted = validEntries.sort((a, b) => b[1] - a[1]);

        if (sorted.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="empty-stats">Aucune donnée</td></tr>';
            return;
        }

        sorted.forEach(([name, count]) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${name}</td><td>${count}</td>`;
            tbody.appendChild(row);
        });
    }

    // Team Stats Elements & Logic ...
    // No changes needed to updateTeamStats signature (params are local) but call needs variables

    // Action 1, 2, 3 Implementation
    window.saveMatch = () => {
        // DATA SYNC: Get current values
        const currentScoreAsnieres = state.scoreAsnieres;
        const currentScoreAdversaire = state.scoreAdversaire;
        // Use Dynamic Names
        const homeTeamName = state.homeName;
        const awayTeamName = state.awayName;

        // STEP 1: Add record to 'Historique' collection
        const matchRecord = {
            id: Date.now(),
            homeName: homeTeamName,
            awayName: awayTeamName,
            homeScore: currentScoreAsnieres,
            awayScore: currentScoreAdversaire,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        historyState.matches.unshift(matchRecord);

        // REFRESH: Refresh 'Historique' table
        renderHistory();

        // STEP 2: Save to 'Classement des Équipes' collection
        updateTeamStats(currentScoreAsnieres, currentScoreAdversaire, awayTeamName);

        // STEP 3: Reset Scores and Clear Fields
        performFullReset();
    };

    function performFullReset() {
        // RESET SCORES: Explicitly set variables to 0
        state.scoreAsnieres = 0;
        state.scoreAdversaire = 0;

        // Refresh Display
        updateDisplay('home');
        updateDisplay('away');

        // CLEAR: Clear logs and reset scorer stats (optional, but requested "reset clear list")
        // User said "CLEAR the list of scorers for the current match".
        state.logs = [];
        renderLog();

        // Note: We do NOT clear the team names configuration, as users likely want to play another match with same teams.
        // If they want to change teams, they can edit the inputs.
    }

    // Preserve the old name for the button that calls it
    window.resetScore = (team) => {
        if (confirm("Êtes-vous sûr de vouloir remettre le match à zéro ? (Scores, buteurs, adversaire)")) {
            performFullReset();
        }
    };

    function updateDisplay(team) {
        if (team === 'home') {
            elements.scoreHome.textContent = state.scoreAsnieres;
            elements.scoreHome.classList.remove('pulse');
            void elements.scoreHome.offsetWidth; // trigger reflow
            elements.scoreHome.classList.add('pulse');
        } else {
            elements.scoreAway.textContent = state.scoreAdversaire;
            elements.scoreAway.classList.remove('pulse');
            void elements.scoreAway.offsetWidth;
            elements.scoreAway.classList.add('pulse');
        }
    }
    function renderLog() {
        elements.logList.innerHTML = '';
        if (state.logs.length === 0) {
            elements.logList.innerHTML = '<li class="empty-log">Aucun but pour le moment.</li>';
            return;
        }

        state.logs.forEach(log => {
            const li = document.createElement('li');
            li.className = `goal-item ${log.team === 'home' ? 'home-goal' : 'away-goal'}`;
            li.innerHTML = `
                <span class="goal-details">${log.player}</span>
                <span class="goal-time">${log.time}</span>
            `;
            elements.logList.appendChild(li);
        });
    }

    function renderHistory() {
        elements.historyList.innerHTML = '';
        if (historyState.matches.length === 0) {
            elements.historyList.innerHTML = '<li class="empty-log">Aucun match enregistré.</li>';
            return;
        }

        historyState.matches.forEach(match => {
            const li = document.createElement('li');
            li.className = 'history-item';
            // Use saved names if available, else fallback (though new records will have names)
            const hName = match.homeName || 'Asnières';
            const aName = match.awayName || match.opponent || 'Adversaire';

            li.innerHTML = `
                <span>${hName} vs ${aName}</span>
                <span class="history-score">${match.homeScore} - ${match.awayScore}</span>
            `;
            elements.historyList.appendChild(li);
        });
    }

    function updateTeamStats(homeScore, awayScore, awayName) {
        // We need to update stats for BOTH Home and Away teams
        const homeName = state.homeName;
        // Ensure stats exist with NEW FIELDS: BP, BC, Diff
        if (!state.teamStats[homeName]) state.teamStats[homeName] = { played: 0, won: 0, drawn: 0, lost: 0, points: 0, bp: 0, bc: 0, diff: 0 };
        // Use the passed awayName (which is dynamic from saveMatch)
        if (!state.teamStats[awayName]) state.teamStats[awayName] = { played: 0, won: 0, drawn: 0, lost: 0, points: 0, bp: 0, bc: 0, diff: 0 };

        // Home Result
        let homeRes = 'D', awayRes = 'V';
        let homePts = 0, awayPts = 3;

        if (homeScore > awayScore) {
            homeRes = 'V'; awayRes = 'D';
            homePts = 3; awayPts = 0;
        } else if (homeScore === awayScore) {
            homeRes = 'N'; awayRes = 'N';
            homePts = 1; awayPts = 1;
        }

        // Update Home
        state.teamStats[homeName].played++;
        if (homeRes === 'V') state.teamStats[homeName].won++;
        else if (homeRes === 'N') state.teamStats[homeName].drawn++;
        else state.teamStats[homeName].lost++;
        state.teamStats[homeName].points += homePts;
        // NEW: Update BP, BC, Diff for Home Team
        state.teamStats[homeName].bp += homeScore;
        state.teamStats[homeName].bc += awayScore;
        state.teamStats[homeName].diff = state.teamStats[homeName].bp - state.teamStats[homeName].bc;

        // Update Away
        state.teamStats[awayName].played++;
        if (awayRes === 'V') state.teamStats[awayName].won++;
        else if (awayRes === 'N') state.teamStats[awayName].drawn++;
        else state.teamStats[awayName].lost++;
        state.teamStats[awayName].points += awayPts;
        // NEW: Update BP, BC, Diff for Away Team
        state.teamStats[awayName].bp += awayScore;
        state.teamStats[awayName].bc += homeScore;
        state.teamStats[awayName].diff = state.teamStats[awayName].bp - state.teamStats[awayName].bc;

        renderTeamStats();
    }

    function renderTeamStats() {
        const tbody = document.getElementById('team-stats-body');
        tbody.innerHTML = '';

        // SORTING: Sort by Pts (Desc), then Diff (Desc), then BP (Desc)
        const sortedTeams = Object.entries(state.teamStats).sort((a, b) => {
            if (b[1].points !== a[1].points) return b[1].points - a[1].points;
            if (b[1].diff !== a[1].diff) return b[1].diff - a[1].diff;
            if (b[1].bp !== a[1].bp) return b[1].bp - a[1].bp;
            return a[1].played - b[1].played;
        });

        if (sortedTeams.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="empty-stats">Aucun match joué</td></tr>';
            return;
        }

        sortedTeams.forEach(([name, stats], index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${name}</td>
                <td class="text-center">${stats.played}</td>
                <td class="text-center">${stats.won}</td>
                <td class="text-center">${stats.drawn}</td>
                <td class="text-center">${stats.lost}</td>
                <td class="text-right"><strong>${stats.points}</strong></td>
                <td class="text-center">${stats.bp}</td>
                <td class="text-center">${stats.bc}</td>
                <td class="text-center">${stats.diff >= 0 ? '+' : ''}${stats.diff}</td>
            `;
            tbody.appendChild(row);
        });
    }
});
