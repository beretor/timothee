document.addEventListener('DOMContentLoaded', () => {
    // State
    const state = {
        scoreAsnieres: 0,
        scoreAdversaire: 0,
        logs: []
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
        historyList: document.getElementById('match-history-list')
    };

    // ... (Goal Form Logic skipped for brevity as it doesn't need changes)

    window.confirmGoal = () => {
        if (!currentGoalTeam) return;

        // Update Score
        if (currentGoalTeam === 'home') {
            state.scoreAsnieres++;
            updateDisplay('home');
        } else if (currentGoalTeam === 'away') {
            state.scoreAdversaire++;
            updateDisplay('away');
        }

        // Handle Logging
        const scorerName = formElements.scorerInput.value.trim() || 'Joueur inconnu';
        const assistName = formElements.assistInput.value.trim();
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Update Stats
        updateStat('scorer', scorerName);
        if (assistName) {
            updateStat('assist', assistName);
        }

        let logText = scorerName;
        if (assistName) {
            logText += ` (Passe de ${assistName})`;
        }

        // Add Team Name to Log for clarity
        const teamName = currentGoalTeam === 'home' ? 'Asnières' : (document.getElementById('opponent-name').value || 'Adversaire');
        logText += ` (${teamName})`;

        const logEntry = {
            id: Date.now(),
            team: currentGoalTeam,
            player: logText,
            time: timestamp
        };

        state.logs.unshift(logEntry); // Add to top
        renderLog();
        closeGoalForm();
    };


    // Team Stats Elements & Logic ...
    // No changes needed to updateTeamStats signature (params are local) but call needs variables

    // Action 1, 2, 3 Implementation
    window.saveMatch = () => {
        // REMOVED Confirmation Dialogs as requested - Instant Action

        // DATA SYNC: Get current values
        const currentScoreAsnieres = state.scoreAsnieres;
        const currentScoreAdversaire = state.scoreAdversaire;
        const opponentName = document.getElementById('opponent-name').value.trim() || 'Adversaire';

        // STEP 1: Add record to 'Historique' collection
        const matchRecord = {
            id: Date.now(),
            homeScore: currentScoreAsnieres,
            awayScore: currentScoreAdversaire,
            opponent: opponentName,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        historyState.matches.unshift(matchRecord);

        // REFRESH: Refresh 'Historique' table
        renderHistory();

        // STEP 2: Save to 'Classement des Équipes' collection
        updateTeamStats(currentScoreAsnieres, currentScoreAdversaire, opponentName);
        // REFRESH: Refresh 'Classement' table (ensured by updateTeamStats calling renderTeamStats)

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

        // CLEAR: Clear opponent field and logs
        document.getElementById('opponent-name').value = '';
        state.logs = [];
        renderLog();
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
});
