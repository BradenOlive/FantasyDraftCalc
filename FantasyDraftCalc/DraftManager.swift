import Foundation
import Combine

class DraftManager: ObservableObject {
    @Published var availablePlayers: [Player] = []
    @Published var draftedPlayers: [Player] = []
    @Published var draftPicks: [DraftPick] = []
    @Published var currentPick: Int = 1
    @Published var currentRound: Int = 1
    @Published var leagueSettings: LeagueSettings
    @Published var userTeam: [Player] = []
    @Published var isDraftComplete: Bool = false
    
    private var playerRankingService = PlayerRankingService()
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        self.leagueSettings = LeagueSettings()
        loadPlayerData()
        setupDraftBoard()
    }
    
    // MARK: - Draft Management
    
    func setupDraftBoard() {
        draftPicks = []
        let totalPicks = leagueSettings.numberOfTeams * 15 // Assuming 15 rounds
        
        for round in 1...15 {
            for team in 1...leagueSettings.numberOfTeams {
                let pickNumber = (round - 1) * leagueSettings.numberOfTeams + team
                let teamName = "Team \(team)"
                let pick = DraftPick(round: round, pickNumber: pickNumber, teamName: teamName)
                draftPicks.append(pick)
            }
        }
    }
    
    func makePick(player: Player) {
        guard let pickIndex = draftPicks.firstIndex(where: { $0.pickNumber == currentPick }) else { return }
        
        // Update the pick with the selected player
        draftPicks[pickIndex] = DraftPick(
            round: currentRound,
            pickNumber: currentPick,
            player: player,
            teamName: draftPicks[pickIndex].teamName
        )
        
        // Add to drafted players
        draftedPlayers.append(player)
        
        // Remove from available players
        availablePlayers.removeAll { $0.id == player.id }
        
        // Add to user team if it's their pick
        if isUserPick() {
            userTeam.append(player)
        }
        
        // Move to next pick
        moveToNextPick()
        
        // Check if draft is complete
        if currentPick > leagueSettings.numberOfTeams * 15 {
            isDraftComplete = true
        }
    }
    
    func moveToNextPick() {
        currentPick += 1
        currentRound = ((currentPick - 1) / leagueSettings.numberOfTeams) + 1
    }
    
    func isUserPick() -> Bool {
        let userPickInRound = leagueSettings.draftPosition
        let isSnakeRound = currentRound % 2 == 0
        
        if leagueSettings.snakeDraft && isSnakeRound {
            return currentPick % leagueSettings.numberOfTeams == (leagueSettings.numberOfTeams - userPickInRound + 1) % leagueSettings.numberOfTeams
        } else {
            return currentPick % leagueSettings.numberOfTeams == userPickInRound
        }
    }
    
    // MARK: - Optimization Algorithm
    
    func getOptimalPick() -> Player? {
        guard !availablePlayers.isEmpty else { return nil }
        
        let teamNeeds = calculateTeamNeeds()
        let valueBasedRanking = getValueBasedRanking()
        
        // Combine team needs with value-based ranking
        let optimalPlayers = availablePlayers.sorted { player1, player2 in
            let score1 = calculatePlayerScore(player: player1, teamNeeds: teamNeeds, valueRanking: valueBasedRanking)
            let score2 = calculatePlayerScore(player: player2, teamNeeds: teamNeeds, valueRanking: valueBasedRanking)
            return score1 > score2
        }
        
        return optimalPlayers.first
    }
    
    private func calculateTeamNeeds() -> [Position: Double] {
        var needs: [Position: Double] = [:]
        
        // Count current players by position
        var currentCounts: [Position: Int] = [:]
        for position in Position.allCases {
            currentCounts[position] = userTeam.filter { $0.position == position }.count
        }
        
        // Calculate needs based on roster requirements
        for (position, required) in leagueSettings.rosterSpots {
            let current = currentCounts[position] ?? 0
            let need = Double(required - current)
            needs[position] = max(0, need)
        }
        
        // Add positional scarcity bonus
        let availableByPosition = Dictionary(grouping: availablePlayers, by: { $0.position })
        for position in Position.allCases {
            let available = availableByPosition[position]?.count ?? 0
            let scarcity = 1.0 / Double(max(1, available))
            needs[position] = (needs[position] ?? 0) * (1.0 + scarcity)
        }
        
        return needs
    }
    
    private func getValueBasedRanking() -> [Player: Double] {
        var rankings: [Player: Double] = [:]
        
        for player in availablePlayers {
            var score = player.projectedPoints
            
            // ADP adjustment (players going later than ADP are better value)
            let adpValue = max(0, player.adp - Double(currentPick))
            score += adpValue * 0.5
            
            // Tier bonus
            score += Double(player.tier) * 10
            
            // Position scarcity
            let positionScarcity = getPositionScarcity(position: player.position)
            score *= positionScarcity
            
            rankings[player] = score
        }
        
        return rankings
    }
    
    private func calculatePlayerScore(player: Player, teamNeeds: [Position: Double], valueRanking: [Player: Double]) -> Double {
        let needScore = teamNeeds[player.position] ?? 0
        let valueScore = valueRanking[player] ?? 0
        
        // Weight team needs more heavily in early rounds, value more in later rounds
        let needWeight = max(0.3, 1.0 - Double(currentRound) * 0.05)
        let valueWeight = 1.0 - needWeight
        
        return (needScore * needWeight) + (valueScore * valueWeight)
    }
    
    private func getPositionScarcity(position: Position) -> Double {
        let availableByPosition = Dictionary(grouping: availablePlayers, by: { $0.position })
        let totalAvailable = availablePlayers.count
        let positionAvailable = availableByPosition[position]?.count ?? 0
        
        if totalAvailable == 0 { return 1.0 }
        
        let scarcity = Double(totalAvailable) / Double(max(1, positionAvailable))
        return min(2.0, scarcity) // Cap at 2x
    }
    
    // MARK: - Data Loading
    
    private func loadPlayerData() {
        playerRankingService.loadPlayers()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    if case .failure(let error) = completion {
                        print("Error loading players: \(error)")
                    }
                },
                receiveValue: { [weak self] players in
                    self?.availablePlayers = players
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Utility Methods
    
    func getAvailablePlayersByPosition(_ position: Position) -> [Player] {
        return availablePlayers.filter { $0.position == position }
    }
    
    func getDraftBoard() -> [[DraftPick]] {
        let picksPerRound = leagueSettings.numberOfTeams
        var board: [[DraftPick]] = []
        
        for round in 1...15 {
            let roundPicks = draftPicks.filter { $0.round == round }
            board.append(roundPicks)
        }
        
        return board
    }
    
    func resetDraft() {
        availablePlayers = []
        draftedPlayers = []
        draftPicks = []
        userTeam = []
        currentPick = 1
        currentRound = 1
        isDraftComplete = false
        setupDraftBoard()
        loadPlayerData()
    }
}
