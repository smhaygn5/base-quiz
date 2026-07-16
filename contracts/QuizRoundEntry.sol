// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title QuizRoundEntry
 * @notice Records that a player started a Base Quiz round without touching
 *         leaderboard scores or streaks.
 */
contract QuizRoundEntry {
    event RoundStarted(address indexed player, uint256 startedAt);

    function startRound() external {
        emit RoundStarted(msg.sender, block.timestamp);
    }
}
