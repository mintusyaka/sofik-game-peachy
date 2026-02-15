export const CONFIG = {
    // Design resolution
    DESIGN_WIDTH: 720,
    DESIGN_HEIGHT: 1280,

    // UI Margins
    UI_TOP_MARGIN: 150,

    // Physics & Gameplay
    PLAYER_SPEED: 8,
    PLAYER_ACCELERATION: 1.5,
    PLAYER_FRICTION: 0.85,
    PLAYER_RADIUS: 30,
    ITEM_RADIUS: 20,
    NPC_RADIUS: 35,
    ITEM_RADIUS: 20,
    NPC_RADIUS: 35,
    NPC_INTERACTION_RADIUS: 60,

    // Scoring
    SCORE_TARGET: 100,
    SCORE_PER_DELIVERY: 20,
    NPC_COOLDOWN: 4000, // 4 seconds

    // Game Rules
    TIME_LIMIT: 10, // Increased time limit for 4 NPCs
    NPC_COUNT: 4, // 4 Corners
    ITEM_COUNT: 4,
    BONUS_ITEM_COUNT: 1,
    BONUS_TIME_VALUE: 3,

    // Colors (for placeholders)
    COLORS: {
        BACKGROUND: 0x222222,
        PLAYER: 0x3498db, // Blue
        PLAYER_CARRYING: 0xf1c40f, // Yellow
        ITEM: 0xe67e22, // Orange
        NPC: 0x9b59b6, // Purple
        NPC_SATISFIED: 0x2ecc71, // Green
        UI_TEXT: 0xffffff,
    }
};
