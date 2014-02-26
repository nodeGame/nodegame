/**
 * # Game settings for Face Categorization  game.
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */
module.exports = {

    // Waiting Room Settings. *
    ////////////////////////////
    
    // How many sessions should be dispatched.
    TARGET_SESSIONS: 1,

    // Stop creating new sessions after N sessions has been dispatched.
    ACCEPT_EXTRA_SESSIONS: false,

    // When the MIN_POOL_SIZE level is reached a countdown is started.
    COUNTDOWN_MILLISECONDS: 20000,

    // When enough players are connected starts  countdown to launch the game.
    // Countdown is canceled if POOL_SIZE goes again under the threshold.
    // Set to undefined to disable.
    COUNTDOWN_AT_POOL_SIZE: undefined,

    // How many players have to connect before a random subset is drawn.
    POOL_SIZE: 2,
    // How many players in each group ( must be <= POOL_SIZE).
    GROUP_SIZE: 2,
    // Minimum number of players that must be always connected (NOT USED).
    MIN_PLAYERS: 4,

    // Session Counter start from.
    SESSION_ID: 100,

    // Game settings.
    TREATMENTS: ['blackbox', 'endo', 'random',
                 'exo_low', 'exo_high', 'exo_perfect',
                 'exo_lowlow', 'exo_extralow', 'exo_minor'
    ],

    // Which treatment to play.
    // Leave undefined for a randomly chosen treatment.
    CHOSEN_TREATMENT: 'rotate_exo_low',

    // How many times the meritocracy stage is repeated. *
    REPEAT: 20,
    // Names of the groups.
    GROUP_NAMES: ['1', '2', '3', '4'],
    // How many player in each group. *
    SUBGROUP_SIZE: 4,

    // Noise standard deviation. High and low "meritocracy".
    NOISE_STD: {
        exo_high: 1.4142,
        exo_low: 2,
        exo_lowlow: 4.472136,
        exo_extralow: 10,
        exo_minor: 31.62278
    },

    // Payment settings. *
    GROUP_ACCOUNT_DIVIDER: 2,
    INITIAL_COINS: 20,

    // Divider ECU / DOLLARS *
    EXCHANGE_RATE: 266,

    // DEBUG.
    DEBUG: false,

    // AUTO-PLAY.
    AUTO: true,

    // DATABASE.
    DB: 'FILE', // FILE, MONGODB

    // AUTHORIZATION.
    AUTH: 'LOCAL' // MTURK, LOCAL, NO.

    // * = if you change this you need to update instructions and quiz
};
