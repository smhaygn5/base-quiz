// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ILeaderboard {
    function players(address)
        external
        view
        returns (
            uint256 bestScore,
            uint256 totalScore,
            uint256 streak,
            uint256 lastPlayedDay,
            bool exists
        );
}

/**
 * Base Quiz — Streak Badges (v2), ERC-1155.
 *
 * Bound to the v2 leaderboard. `claim` reads the caller's current streak from
 * the leaderboard and mints the badge if the required streak is met and it is
 * not already owned. Owner-only `seedMint` migrates badges already owned on v1
 * so no earned badge is lost.
 *
 * Token ids: 1=Bronze (3d), 2=Silver (7d), 3=Gold (30d), 4=Diamond (100d).
 */
contract QuizBadges is ERC1155, Ownable {
    uint256 public constant BRONZE = 1;
    uint256 public constant SILVER = 2;
    uint256 public constant GOLD = 3;
    uint256 public constant DIAMOND = 4;

    ILeaderboard public leaderboard;
    mapping(uint256 => uint256) public requiredStreak;

    event BadgeClaimed(address indexed player, uint256 indexed badgeId, uint256 streak);

    constructor(address _leaderboard)
        ERC1155("https://basequiz.xyz/api/badge/{id}.json")
        Ownable(msg.sender)
    {
        leaderboard = ILeaderboard(_leaderboard);
        requiredStreak[BRONZE] = 3;
        requiredStreak[SILVER] = 7;
        requiredStreak[GOLD] = 30;
        requiredStreak[DIAMOND] = 100;
    }

    function claim(uint256 badgeId) external {
        require(badgeId >= 1 && badgeId <= 4, "bad id");
        require(balanceOf(msg.sender, badgeId) == 0, "already owned");
        (, , uint256 streak, , ) = leaderboard.players(msg.sender);
        require(streak >= requiredStreak[badgeId], "streak too low");
        _mint(msg.sender, badgeId, 1, "");
        emit BadgeClaimed(msg.sender, badgeId, streak);
    }

    /**
     * One-time migration of badges already owned on the v1 contract.
     * `to[i]` receives one unit of badge `ids[i]` (skips if already owned).
     */
    function seedMint(address[] calldata to, uint256[] calldata ids) external onlyOwner {
        require(to.length == ids.length, "length mismatch");
        for (uint256 i = 0; i < to.length; i++) {
            if (balanceOf(to[i], ids[i]) == 0) {
                _mint(to[i], ids[i], 1, "");
            }
        }
    }
}
