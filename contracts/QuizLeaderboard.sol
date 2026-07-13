// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * Base Quiz — Leaderboard (v2)
 *
 * Differences from v1:
 *  - NO daily transaction limit: a player may submitScore as many times as they
 *    want. totalScore accumulates, bestScore keeps the highest single round.
 *  - Streak is DAY-BASED: it only advances the first time a player submits on a
 *    new UTC day. Extra submissions on the same day never change the streak, and
 *    never revert. A gap of more than one day resets the streak to 1.
 *  - Owner-only `seed(...)` to migrate the v1 leaderboard in one transaction so
 *    no scores, streaks or ranks are lost.
 *
 * Public interface (players / playerList / getPlayer / getPlayerCount /
 * submitScore) is kept identical to v1 so the frontend ABI stays compatible.
 */
contract QuizLeaderboard {
    struct Player {
        uint256 bestScore;
        uint256 totalScore;
        uint256 streak;
        uint256 lastPlayedDay;
        bool exists;
    }

    address public owner;
    mapping(address => Player) public players;
    address[] public playerList;

    event ScoreSubmitted(address indexed player, uint256 score, uint256 streak);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function submitScore(uint256 score) external {
        uint256 today = block.timestamp / 86400;
        Player storage p = players[msg.sender];

        if (!p.exists) {
            p.exists = true;
            playerList.push(msg.sender);
            p.streak = 1;
            p.lastPlayedDay = today;
        } else if (p.lastPlayedDay != today) {
            // First submission of a new day: advance or reset the streak.
            p.streak = (p.lastPlayedDay == today - 1) ? p.streak + 1 : 1;
            p.lastPlayedDay = today;
        }
        // Same-day resubmissions: no streak change, no revert (unlimited plays).

        if (score > p.bestScore) p.bestScore = score;
        p.totalScore += score;

        emit ScoreSubmitted(msg.sender, score, p.streak);
    }

    function getPlayerCount() external view returns (uint256) {
        return playerList.length;
    }

    function getPlayer(uint256 index)
        external
        view
        returns (address addr, uint256 bestScore, uint256 totalScore, uint256 streak)
    {
        addr = playerList[index];
        Player storage p = players[addr];
        return (addr, p.bestScore, p.totalScore, p.streak);
    }

    /**
     * One-time migration from the v1 leaderboard. Callable only by the owner.
     * Existing scores are overwritten with the provided snapshot values, so it is
     * safe to run once right after deployment (before players start submitting).
     */
    function seed(
        address[] calldata addrs,
        uint256[] calldata best,
        uint256[] calldata total,
        uint256[] calldata streak,
        uint256[] calldata lastDay
    ) external onlyOwner {
        require(
            addrs.length == best.length &&
                addrs.length == total.length &&
                addrs.length == streak.length &&
                addrs.length == lastDay.length,
            "length mismatch"
        );
        for (uint256 i = 0; i < addrs.length; i++) {
            address a = addrs[i];
            Player storage p = players[a];
            if (!p.exists) {
                p.exists = true;
                playerList.push(a);
            }
            p.bestScore = best[i];
            p.totalScore = total[i];
            p.streak = streak[i];
            p.lastPlayedDay = lastDay[i];
        }
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero addr");
        owner = newOwner;
    }
}
