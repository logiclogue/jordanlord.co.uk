> import qualified Data.Map.Strict as Map
> import Data.Maybe

Elo lookup table:

> type Rating = Int
> type Team = (String, Rating)

Here are all of the 2017/18 Premier League results:

> type Match = (String, String, Int, Int, Bool)

> matches :: [Match]
> matches = [
>     ("ARS", "BOU", 3, 0, True),
>     ("ARS", "BHA", 2, 0, True),
>     ("ARS", "BUR", 5, 0, True),
>     ("ARS", "CHE", 2, 2, True),
>     ("ARS", "CRY", 4, 1, True),
>     ("ARS", "EVE", 5, 1, True),
>     ("ARS", "HUD", 5, 0, True),
>     ("ARS", "LEI", 4, 3, True),
>     ("ARS", "LIV", 3, 3, True),
>     ("ARS", "MCI", 0, 3, True),
>     ("ARS", "MUN", 1, 3, True),
>     ("ARS", "NEW", 1, 0, True),
>     ("ARS", "SOU", 3, 2, True),
>     ("ARS", "STK", 3, 0, True),
>     ("ARS", "SWA", 2, 1, True),
>     ("ARS", "TOT", 2, 0, True),
>     ("ARS", "WAT", 3, 0, True),
>     ("ARS", "WBA", 2, 0, True),
>     ("ARS", "WHU", 4, 1, True),
>     ("BOU", "ARS", 2, 1, True),
>     ("BOU", "BHA", 2, 1, True),
>     ("BOU", "BUR", 1, 2, True),
>     ("BOU", "CHE", 0, 1, True),
>     ("BOU", "CRY", 2, 2, True),
>     ("BOU", "EVE", 2, 1, True),
>     ("BOU", "HUD", 4, 0, True),
>     ("BOU", "LEI", 0, 0, True),
>     ("BOU", "LIV", 0, 4, True),
>     ("BOU", "MCI", 1, 2, True),
>     ("BOU", "MUN", 0, 2, True),
>     ("BOU", "NEW", 2, 2, True),
>     ("BOU", "SOU", 1, 1, True),
>     ("BOU", "STK", 2, 1, True),
>     ("BOU", "SWA", 1, 0, True),
>     ("BOU", "TOT", 1, 4, True),
>     ("BOU", "WAT", 0, 2, True),
>     ("BOU", "WBA", 2, 1, True),
>     ("BOU", "WHU", 3, 3, True),
>     ("BHA", "ARS", 2, 1, True),
>     ("BHA", "BOU", 2, 2, True),
>     ("BHA", "BUR", 0, 0, True),
>     ("BHA", "CHE", 0, 4, True),
>     ("BHA", "CRY", 0, 0, True),
>     ("BHA", "EVE", 1, 1, True),
>     ("BHA", "HUD", 1, 1, True),
>     ("BHA", "LEI", 0, 2, True),
>     ("BHA", "LIV", 1, 5, True),
>     ("BHA", "MCI", 0, 2, True),
>     ("BHA", "MUN", 1, 0, True),
>     ("BHA", "NEW", 1, 0, True),
>     ("BHA", "SOU", 1, 1, True),
>     ("BHA", "STK", 2, 2, True),
>     ("BHA", "SWA", 4, 1, True),
>     ("BHA", "TOT", 1, 1, True),
>     ("BHA", "WAT", 1, 0, True),
>     ("BHA", "WBA", 3, 1, True),
>     ("BHA", "WHU", 3, 1, True),
>     ("BUR", "ARS", 0, 1, True),
>     ("BUR", "BOU", 1, 2, True),
>     ("BUR", "BHA", 0, 0, True),
>     ("BUR", "CHE", 1, 2, True),
>     ("BUR", "CRY", 1, 0, True),
>     ("BUR", "EVE", 2, 1, True),
>     ("BUR", "HUD", 0, 0, True),
>     ("BUR", "LEI", 2, 1, True),
>     ("BUR", "LIV", 1, 2, True),
>     ("BUR", "MCI", 1, 1, True),
>     ("BUR", "MUN", 0, 1, True),
>     ("BUR", "NEW", 1, 0, True),
>     ("BUR", "SOU", 1, 1, True),
>     ("BUR", "STK", 1, 0, True),
>     ("BUR", "SWA", 2, 0, True),
>     ("BUR", "TOT", 0, 3, True),
>     ("BUR", "WAT", 1, 0, True),
>     ("BUR", "WBA", 0, 1, True),
>     ("BUR", "WHU", 1, 1, True),
>     ("CHE", "ARS", 0, 0, True),
>     ("CHE", "BOU", 0, 3, True),
>     ("CHE", "BHA", 2, 0, True),
>     ("CHE", "BUR", 2, 3, True),
>     ("CHE", "CRY", 2, 1, True),
>     ("CHE", "EVE", 2, 0, True),
>     ("CHE", "HUD", 1, 1, True),
>     ("CHE", "LEI", 0, 0, True),
>     ("CHE", "LIV", 1, 0, True),
>     ("CHE", "MCI", 0, 1, True),
>     ("CHE", "MUN", 1, 0, True),
>     ("CHE", "NEW", 3, 1, True),
>     ("CHE", "SOU", 1, 0, True),
>     ("CHE", "STK", 5, 0, True),
>     ("CHE", "SWA", 1, 0, True),
>     ("CHE", "TOT", 1, 3, True),
>     ("CHE", "WAT", 4, 2, True),
>     ("CHE", "WBA", 3, 0, True),
>     ("CHE", "WHU", 1, 1, True),
>     ("CRY", "ARS", 2, 3, True),
>     ("CRY", "BOU", 2, 2, True),
>     ("CRY", "BHA", 3, 2, True),
>     ("CRY", "BUR", 1, 0, True),
>     ("CRY", "CHE", 2, 1, True),
>     ("CRY", "EVE", 2, 2, True),
>     ("CRY", "HUD", 0, 3, True),
>     ("CRY", "LEI", 5, 0, True),
>     ("CRY", "LIV", 1, 2, True),
>     ("CRY", "MCI", 0, 0, True),
>     ("CRY", "MUN", 2, 3, True),
>     ("CRY", "NEW", 1, 1, True),
>     ("CRY", "SOU", 0, 1, True),
>     ("CRY", "STK", 2, 1, True),
>     ("CRY", "SWA", 0, 2, True),
>     ("CRY", "TOT", 0, 1, True),
>     ("CRY", "WAT", 2, 1, True),
>     ("CRY", "WBA", 2, 0, True),
>     ("CRY", "WHU", 2, 2, True),
>     ("EVE", "ARS", 2, 5, True),
>     ("EVE", "BOU", 2, 1, True),
>     ("EVE", "BHA", 2, 0, True),
>     ("EVE", "BUR", 0, 1, True),
>     ("EVE", "CHE", 0, 0, True),
>     ("EVE", "CRY", 3, 1, True),
>     ("EVE", "HUD", 2, 0, True),
>     ("EVE", "LEI", 2, 1, True),
>     ("EVE", "LIV", 0, 0, True),
>     ("EVE", "MCI", 1, 3, True),
>     ("EVE", "MUN", 0, 2, True),
>     ("EVE", "NEW", 1, 0, True),
>     ("EVE", "SOU", 1, 1, True),
>     ("EVE", "STK", 1, 0, True),
>     ("EVE", "SWA", 3, 1, True),
>     ("EVE", "TOT", 0, 3, True),
>     ("EVE", "WAT", 3, 2, True),
>     ("EVE", "WBA", 1, 1, True),
>     ("EVE", "WHU", 4, 0, True),
>     ("HUD", "ARS", 0, 1, True),
>     ("HUD", "BOU", 4, 1, True),
>     ("HUD", "BHA", 2, 0, True),
>     ("HUD", "BUR", 0, 0, True),
>     ("HUD", "CHE", 1, 3, True),
>     ("HUD", "CRY", 0, 2, True),
>     ("HUD", "EVE", 0, 2, True),
>     ("HUD", "LEI", 1, 1, True),
>     ("HUD", "LIV", 0, 3, True),
>     ("HUD", "MCI", 1, 2, True),
>     ("HUD", "MUN", 2, 1, True),
>     ("HUD", "NEW", 1, 0, True),
>     ("HUD", "SOU", 0, 0, True),
>     ("HUD", "STK", 1, 1, True),
>     ("HUD", "SWA", 0, 0, True),
>     ("HUD", "TOT", 0, 4, True),
>     ("HUD", "WAT", 1, 0, True),
>     ("HUD", "WBA", 1, 0, True),
>     ("HUD", "WHU", 1, 4, True),
>     ("LEI", "ARS", 3, 1, True),
>     ("LEI", "BOU", 1, 1, True),
>     ("LEI", "BHA", 2, 0, True),
>     ("LEI", "BUR", 1, 0, True),
>     ("LEI", "CHE", 1, 2, True),
>     ("LEI", "CRY", 0, 3, True),
>     ("LEI", "EVE", 2, 0, True),
>     ("LEI", "HUD", 3, 0, True),
>     ("LEI", "LIV", 2, 3, True),
>     ("LEI", "MCI", 0, 2, True),
>     ("LEI", "MUN", 2, 2, True),
>     ("LEI", "NEW", 1, 2, True),
>     ("LEI", "SOU", 0, 0, True),
>     ("LEI", "STK", 1, 1, True),
>     ("LEI", "SWA", 1, 1, True),
>     ("LEI", "TOT", 2, 1, True),
>     ("LEI", "WAT", 2, 0, True),
>     ("LEI", "WBA", 1, 1, True),
>     ("LEI", "WHU", 0, 2, True),
>     ("LIV", "ARS", 4, 0, True),
>     ("LIV", "BOU", 3, 0, True),
>     ("LIV", "BHA", 4, 0, True),
>     ("LIV", "BUR", 1, 1, True),
>     ("LIV", "CHE", 1, 1, True),
>     ("LIV", "CRY", 1, 0, True),
>     ("LIV", "EVE", 1, 1, True),
>     ("LIV", "HUD", 3, 0, True),
>     ("LIV", "LEI", 2, 1, True),
>     ("LIV", "MCI", 4, 3, True),
>     ("LIV", "MUN", 0, 0, True),
>     ("LIV", "NEW", 2, 0, True),
>     ("LIV", "SOU", 3, 0, True),
>     ("LIV", "STK", 0, 0, True),
>     ("LIV", "SWA", 5, 0, True),
>     ("LIV", "TOT", 2, 2, True),
>     ("LIV", "WAT", 5, 0, True),
>     ("LIV", "WBA", 0, 0, True),
>     ("LIV", "WHU", 4, 1, True),
>     ("MCI", "ARS", 3, 1, True),
>     ("MCI", "BOU", 4, 0, True),
>     ("MCI", "BHA", 3, 1, True),
>     ("MCI", "BUR", 3, 0, True),
>     ("MCI", "CHE", 1, 0, True),
>     ("MCI", "CRY", 5, 0, True),
>     ("MCI", "EVE", 1, 1, True),
>     ("MCI", "HUD", 0, 0, True),
>     ("MCI", "LEI", 5, 1, True),
>     ("MCI", "LIV", 5, 0, True),
>     ("MCI", "MUN", 2, 3, True),
>     ("MCI", "NEW", 3, 1, True),
>     ("MCI", "SOU", 2, 1, True),
>     ("MCI", "STK", 7, 2, True),
>     ("MCI", "SWA", 5, 0, True),
>     ("MCI", "TOT", 4, 1, True),
>     ("MCI", "WAT", 3, 1, True),
>     ("MCI", "WBA", 3, 0, True),
>     ("MCI", "WHU", 2, 1, True),
>     ("MUN", "ARS", 2, 1, True),
>     ("MUN", "BOU", 1, 0, True),
>     ("MUN", "BHA", 1, 0, True),
>     ("MUN", "BUR", 2, 2, True),
>     ("MUN", "CHE", 2, 1, True),
>     ("MUN", "CRY", 4, 0, True),
>     ("MUN", "EVE", 4, 0, True),
>     ("MUN", "HUD", 2, 0, True),
>     ("MUN", "LEI", 2, 0, True),
>     ("MUN", "LIV", 2, 1, True),
>     ("MUN", "MCI", 1, 2, True),
>     ("MUN", "NEW", 4, 1, True),
>     ("MUN", "SOU", 0, 0, True),
>     ("MUN", "STK", 3, 0, True),
>     ("MUN", "SWA", 2, 0, True),
>     ("MUN", "TOT", 1, 0, True),
>     ("MUN", "WAT", 1, 0, True),
>     ("MUN", "WBA", 0, 1, True),
>     ("MUN", "WHU", 4, 0, True),
>     ("NEW", "ARS", 2, 1, True),
>     ("NEW", "BOU", 0, 1, True),
>     ("NEW", "BHA", 0, 0, True),
>     ("NEW", "BUR", 1, 1, True),
>     ("NEW", "CHE", 3, 0, True),
>     ("NEW", "CRY", 1, 0, True),
>     ("NEW", "EVE", 0, 1, True),
>     ("NEW", "HUD", 1, 0, True),
>     ("NEW", "LEI", 2, 3, True),
>     ("NEW", "LIV", 1, 1, True),
>     ("NEW", "MCI", 0, 1, True),
>     ("NEW", "MUN", 1, 0, True),
>     ("NEW", "SOU", 3, 0, True),
>     ("NEW", "STK", 2, 1, True),
>     ("NEW", "SWA", 1, 1, True),
>     ("NEW", "TOT", 0, 2, True),
>     ("NEW", "WAT", 0, 3, True),
>     ("NEW", "WBA", 0, 1, True),
>     ("NEW", "WHU", 3, 0, True),
>     ("SOU", "ARS", 1, 1, True),
>     ("SOU", "BOU", 2, 1, True),
>     ("SOU", "BHA", 1, 1, True),
>     ("SOU", "BUR", 0, 1, True),
>     ("SOU", "CHE", 2, 3, True),
>     ("SOU", "CRY", 1, 2, True),
>     ("SOU", "EVE", 4, 1, True),
>     ("SOU", "HUD", 1, 1, True),
>     ("SOU", "LEI", 1, 4, True),
>     ("SOU", "LIV", 0, 2, True),
>     ("SOU", "MCI", 0, 1, True),
>     ("SOU", "MUN", 0, 1, True),
>     ("SOU", "NEW", 2, 2, True),
>     ("SOU", "STK", 0, 0, True),
>     ("SOU", "SWA", 0, 0, True),
>     ("SOU", "TOT", 1, 1, True),
>     ("SOU", "WAT", 0, 2, True),
>     ("SOU", "WBA", 1, 0, True),
>     ("SOU", "WHU", 3, 2, True),
>     ("STK", "ARS", 1, 0, True),
>     ("STK", "BOU", 1, 2, True),
>     ("STK", "BHA", 1, 1, True),
>     ("STK", "BUR", 1, 1, True),
>     ("STK", "CHE", 0, 4, True),
>     ("STK", "CRY", 1, 2, True),
>     ("STK", "EVE", 1, 2, True),
>     ("STK", "HUD", 2, 0, True),
>     ("STK", "LEI", 2, 2, True),
>     ("STK", "LIV", 0, 3, True),
>     ("STK", "MCI", 0, 2, True),
>     ("STK", "MUN", 2, 2, True),
>     ("STK", "NEW", 0, 1, True),
>     ("STK", "SOU", 2, 1, True),
>     ("STK", "SWA", 2, 1, True),
>     ("STK", "TOT", 1, 2, True),
>     ("STK", "WAT", 0, 0, True),
>     ("STK", "WBA", 3, 1, True),
>     ("STK", "WHU", 0, 3, True),
>     ("SWA", "ARS", 3, 1, True),
>     ("SWA", "BOU", 0, 0, True),
>     ("SWA", "BHA", 0, 1, True),
>     ("SWA", "BUR", 1, 0, True),
>     ("SWA", "CHE", 0, 1, True),
>     ("SWA", "CRY", 1, 1, True),
>     ("SWA", "EVE", 1, 1, True),
>     ("SWA", "HUD", 2, 0, True),
>     ("SWA", "LEI", 1, 2, True),
>     ("SWA", "LIV", 1, 0, True),
>     ("SWA", "MCI", 0, 4, True),
>     ("SWA", "MUN", 0, 4, True),
>     ("SWA", "NEW", 0, 1, True),
>     ("SWA", "SOU", 0, 1, True),
>     ("SWA", "STK", 1, 2, True),
>     ("SWA", "TOT", 0, 2, True),
>     ("SWA", "WAT", 1, 2, True),
>     ("SWA", "WBA", 1, 0, True),
>     ("SWA", "WHU", 4, 1, True),
>     ("TOT", "ARS", 1, 0, True),
>     ("TOT", "BOU", 1, 0, True),
>     ("TOT", "BHA", 2, 0, True),
>     ("TOT", "BUR", 1, 1, True),
>     ("TOT", "CHE", 1, 2, True),
>     ("TOT", "CRY", 1, 0, True),
>     ("TOT", "EVE", 4, 0, True),
>     ("TOT", "HUD", 2, 0, True),
>     ("TOT", "LEI", 5, 4, True),
>     ("TOT", "LIV", 4, 1, True),
>     ("TOT", "MCI", 1, 3, True),
>     ("TOT", "MUN", 2, 0, True),
>     ("TOT", "NEW", 1, 0, True),
>     ("TOT", "SOU", 5, 2, True),
>     ("TOT", "STK", 5, 1, True),
>     ("TOT", "SWA", 0, 0, True),
>     ("TOT", "WAT", 2, 0, True),
>     ("TOT", "WBA", 1, 1, True),
>     ("TOT", "WHU", 1, 1, True),
>     ("WAT", "ARS", 2, 1, True),
>     ("WAT", "BOU", 2, 2, True),
>     ("WAT", "BHA", 0, 0, True),
>     ("WAT", "BUR", 1, 2, True),
>     ("WAT", "CHE", 4, 1, True),
>     ("WAT", "CRY", 0, 0, True),
>     ("WAT", "EVE", 1, 0, True),
>     ("WAT", "HUD", 1, 4, True),
>     ("WAT", "LEI", 2, 1, True),
>     ("WAT", "LIV", 3, 3, True),
>     ("WAT", "MCI", 0, 6, True),
>     ("WAT", "MUN", 2, 4, True),
>     ("WAT", "NEW", 2, 1, True),
>     ("WAT", "SOU", 2, 2, True),
>     ("WAT", "STK", 0, 1, True),
>     ("WAT", "SWA", 1, 2, True),
>     ("WAT", "TOT", 1, 1, True),
>     ("WAT", "WBA", 1, 0, True),
>     ("WAT", "WHU", 2, 0, True),
>     ("WBA", "ARS", 1, 1, True),
>     ("WBA", "BOU", 1, 0, True),
>     ("WBA", "BHA", 2, 0, True),
>     ("WBA", "BUR", 1, 2, True),
>     ("WBA", "CHE", 0, 4, True),
>     ("WBA", "CRY", 0, 0, True),
>     ("WBA", "EVE", 0, 0, True),
>     ("WBA", "HUD", 1, 2, True),
>     ("WBA", "LEI", 1, 4, True),
>     ("WBA", "LIV", 2, 2, True),
>     ("WBA", "MCI", 2, 3, True),
>     ("WBA", "MUN", 1, 2, True),
>     ("WBA", "NEW", 2, 2, True),
>     ("WBA", "SOU", 2, 3, True),
>     ("WBA", "STK", 1, 1, True),
>     ("WBA", "SWA", 1, 1, True),
>     ("WBA", "TOT", 1, 0, True),
>     ("WBA", "WAT", 2, 2, True),
>     ("WBA", "WHU", 0, 0, True),
>     ("WHU", "ARS", 0, 0, True),
>     ("WHU", "BOU", 1, 1, True),
>     ("WHU", "BHA", 0, 3, True),
>     ("WHU", "BUR", 0, 3, True),
>     ("WHU", "CHE", 1, 0, True),
>     ("WHU", "CRY", 1, 1, True),
>     ("WHU", "EVE", 3, 1, True),
>     ("WHU", "HUD", 2, 0, True),
>     ("WHU", "LEI", 1, 1, True),
>     ("WHU", "LIV", 1, 4, True),
>     ("WHU", "MCI", 1, 4, True),
>     ("WHU", "MUN", 0, 0, True),
>     ("WHU", "NEW", 2, 3, True),
>     ("WHU", "SOU", 3, 0, True),
>     ("WHU", "STK", 1, 1, True),
>     ("WHU", "SWA", 1, 0, True),
>     ("WHU", "TOT", 2, 3, True),
>     ("WHU", "WAT", 2, 0, True),
>     ("WHU", "WBA", 2, 1, True)]

Function for whether a match is a win or not:

> isWin :: Match -> Bool
> isWin (_, _, homeGoals, awayGoals, _) = homeGoals > awayGoals

> isDraw :: Match -> Bool
> isDraw (_, _, homeGoals, awayGoals, _) = homeGoals == awayGoals

> isLoss :: Match -> Bool
> isLoss (_, _, homeGoals, awayGoals, _) = homeGoals < awayGoals

> getTeam :: Match -> String
> getTeam (homeTeam, _, _, _, _) = homeTeam

> newtype Record = Record (Int, Int, Int) -- (Wins, Draws, Losses)

> instance Show Record where
>
>     show (Record triple) = show triple 

> matchToRecord :: Match -> (String, Record)
> matchToRecord match
>     | isWin  match = (getTeam match, Record (1, 0, 0))
>     | isDraw match = (getTeam match, Record (0, 1, 0))
>     | isLoss match = (getTeam match, Record (0, 0, 1))

> instance Monoid Record where
>
>     mempty = Record (0, 0, 0)

> instance Semigroup Record where
>
>     (<>)
>         (Record (winsA, drawsA, lossesA))
>         (Record (winsB, drawsB, lossesB)) =
>             Record (winsA + winsB, drawsA + drawsB, lossesA + lossesB)

> homeTable :: Map.Map String Record
> homeTable = Map.fromListWith (<>) (map matchToRecord matches)

> createTable :: [Match] -> Map.Map String Record
> createTable = Map.fromListWith (<>) . map matchToRecord

> awayMatch :: Match -> Match
> awayMatch (homeTeam, awayTeam, homeGoals, awayGoals, isHome) =
>     (awayTeam, homeTeam, awayGoals, homeGoals, not isHome)

> awayTable :: Map.Map String Record
> awayTable = (createTable . map awayMatch) matches

> homeAndAway :: Match -> [Match]
> homeAndAway match = [match, awayMatch match]

> fullTable :: Map.Map String Record
> fullTable = (createTable . concatMap homeAndAway) matches

> recordToRating :: Record -> Rating
> recordToRating (Record (wins, draws, losses)) = rating where
>     
>     rating :: Rating
>     rating = 1000 + round ((400 / fromIntegral totalGames) * diff)
> 
>     totalGames :: Int
>     totalGames = wins + draws + losses
> 
>     diff :: Float
>     diff = fromIntegral (wins - losses)

Records to Ratings:

> recordToRatingTable :: Map.Map String Record -> Map.Map String Rating
> recordToRatingTable = Map.map recordToRating

> homeRatings :: Map.Map String Rating
> homeRatings = recordToRatingTable homeTable

> awayRatings :: Map.Map String Rating
> awayRatings = recordToRatingTable awayTable

Match Preparation:

> getHomeTeam :: Match -> String
> getHomeTeam (homeTeam, _, _, _, True)  = homeTeam
> getHomeTeam (_, homeTeam, _, _, False) = homeTeam

> getAwayTeam :: Match -> String
> getAwayTeam (_, awayTeam, _, _, True)  = awayTeam
> getAwayTeam (awayTeam, _, _, _, False) = awayTeam

Get the match rating difference:

> getRating :: String -> [Team] -> Rating
> getRating team teams = case lookup team teams of
>     Just rating -> rating
>     Nothing     -> 1000

> matchRatingDiff ::
>     Map.Map String Rating -> Map.Map String Rating -> Match -> Rating
> matchRatingDiff homeRatings awayRatings match = ratingDiff match where
> 
>     ratingDiff :: Match -> Rating
>     ratingDiff (_, _, _, _, True)  = homeRating - awayRating
>     ratingDiff (_, _, _, _, False) = awayRating - homeRating
> 
>     lookup :: String -> Map.Map String Rating -> Rating
>     lookup team = Data.Maybe.fromMaybe 1000 . Map.lookup team
> 
>     homeRating :: Rating
>     homeRating = lookup (getHomeTeam match) homeRatings
> 
>     awayRating :: Rating
>     awayRating = lookup (getAwayTeam match) awayRatings

> matchRatingDiffWithWin ::
>     Map.Map String Rating -> Map.Map String Rating -> Match -> (Rating, Int)
> matchRatingDiffWithWin homeRatings awayRatings match = (ratingDiff, win) where
> 
>     ratingDiff :: Rating
>     ratingDiff = matchRatingDiff homeRatings awayRatings match
> 
>     win :: Int
>     win = if isWin match then 1 else 0

> allMatches :: [Match]
> allMatches = concatMap homeAndAway matches

> allMatchesDiffWithWin :: [(Rating, Int)]
> allMatchesDiffWithWin = map ratingDiffWithWin allMatches where
> 
>     ratingDiffWithWin :: Match -> (Rating, Int)
>     ratingDiffWithWin = matchRatingDiffWithWin homeRatings awayRatings

> toCSV :: [(Rating, Int)] -> String
> toCSV = foldl (++) "Rating,Win\n"
>     . map (\(rating, win) -> show rating ++ "," ++ show win ++ "\n")