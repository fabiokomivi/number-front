# Contrat backend (provisoire)
Voir src/lib/config.js pour les endpoints REST et WebSocket (ws://.../rooms/:id/?token=). Messages { type, payload } avec payload.server_time.
Événements : PLAYER_JOINED, PLAYER_LEFT, ROOM_UPDATED, GAME_STARTED, ROUND_STARTED, COUNTDOWN_UPDATED, NUMBER_SUBMITTED, SUBMISSION_CLOSED, ROUND_FINISHED, SCORE_UPDATED, GAME_FINISHED, PLAYER_DISCONNECTED.
