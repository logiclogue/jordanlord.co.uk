Elo lookup table:

> type Rating = Int
> type Team = (String, Rating)

> teams :: [Team]
> teams = [
>     ("MCI", 1316),
>     ("MUN", 1189),
>     ("TOT", 1168),
>     ("LIV", 1168),
>     ("CHE", 1116),
>     ("ARS", 1063),
>     ("BUR", 1021),
>     ("EVE", 979),
>     ("LEI", 968),
>     ("NEW", 937),
>     ("CRY", 947),
>     ("BOU", 947),
>     ("WHU", 937),
>     ("WAT", 916),
>     ("BHA", 926),
>     ("HUD", 895),
>     ("SOU", 905),
>     ("SWA", 863),
>     ("STK", 874),
>     ("WBA", 863)]

Here are all of the 2017/18 Premier League results:

> type Match = (String, String, Int, Int)

> matches :: [(String, String, Int, Int)]
> matches = [
>     ("ARS", "BOU", 3, 0),
>     ("ARS", "BHA", 2, 0),
>     ("ARS", "BUR", 5, 0),
>     ("ARS", "CHE", 2, 2),
>     ("ARS", "CRY", 4, 1),
>     ("ARS", "EVE", 5, 1),
>     ("ARS", "HUD", 5, 0),
>     ("ARS", "LEI", 4, 3),
>     ("ARS", "LIV", 3, 3),
>     ("ARS", "MCI", 0, 3),
>     ("ARS", "MUN", 1, 3),
>     ("ARS", "NEW", 1, 0),
>     ("ARS", "SOU", 3, 2),
>     ("ARS", "STK", 3, 0),
>     ("ARS", "SWA", 2, 1),
>     ("ARS", "TOT", 2, 0),
>     ("ARS", "WAT", 3, 0),
>     ("ARS", "WBA", 2, 0),
>     ("ARS", "WHU", 4, 1),
>     ("BOU", "ARS", 2, 1),
>     ("BOU", "BHA", 2, 1),
>     ("BOU", "BUR", 1, 2),
>     ("BOU", "CHE", 0, 1),
>     ("BOU", "CRY", 2, 2),
>     ("BOU", "EVE", 2, 1),
>     ("BOU", "HUD", 4, 0),
>     ("BOU", "LEI", 0, 0),
>     ("BOU", "LIV", 0, 4),
>     ("BOU", "MCI", 1, 2),
>     ("BOU", "MUN", 0, 2),
>     ("BOU", "NEW", 2, 2),
>     ("BOU", "SOU", 1, 1),
>     ("BOU", "STK", 2, 1),
>     ("BOU", "SWA", 1, 0),
>     ("BOU", "TOT", 1, 4),
>     ("BOU", "WAT", 0, 2),
>     ("BOU", "WBA", 2, 1),
>     ("BOU", "WHU", 3, 3),
>     ("BHA", "ARS", 2, 1),
>     ("BHA", "BOU", 2, 2),
>     ("BHA", "BUR", 0, 0),
>     ("BHA", "CHE", 0, 4),
>     ("BHA", "CRY", 0, 0),
>     ("BHA", "EVE", 1, 1),
>     ("BHA", "HUD", 1, 1),
>     ("BHA", "LEI", 0, 2),
>     ("BHA", "LIV", 1, 5),
>     ("BHA", "MCI", 0, 2),
>     ("BHA", "MUN", 1, 0),
>     ("BHA", "NEW", 1, 0),
>     ("BHA", "SOU", 1, 1),
>     ("BHA", "STK", 2, 2),
>     ("BHA", "SWA", 4, 1),
>     ("BHA", "TOT", 1, 1),
>     ("BHA", "WAT", 1, 0),
>     ("BHA", "WBA", 3, 1),
>     ("BHA", "WHU", 3, 1),
>     ("BUR", "ARS", 0, 1),
>     ("BUR", "BOU", 1, 2),
>     ("BUR", "BHA", 0, 0),
>     ("BUR", "CHE", 1, 2),
>     ("BUR", "CRY", 1, 0),
>     ("BUR", "EVE", 2, 1),
>     ("BUR", "HUD", 0, 0),
>     ("BUR", "LEI", 2, 1),
>     ("BUR", "LIV", 1, 2),
>     ("BUR", "MCI", 1, 1),
>     ("BUR", "MUN", 0, 1),
>     ("BUR", "NEW", 1, 0),
>     ("BUR", "SOU", 1, 1),
>     ("BUR", "STK", 1, 0),
>     ("BUR", "SWA", 2, 0),
>     ("BUR", "TOT", 0, 3),
>     ("BUR", "WAT", 1, 0),
>     ("BUR", "WBA", 0, 1),
>     ("BUR", "WHU", 1, 1),
>     ("CHE", "ARS", 0, 0),
>     ("CHE", "BOU", 0, 3),
>     ("CHE", "BHA", 2, 0),
>     ("CHE", "BUR", 2, 3),
>     ("CHE", "CRY", 2, 1),
>     ("CHE", "EVE", 2, 0),
>     ("CHE", "HUD", 1, 1),
>     ("CHE", "LEI", 0, 0),
>     ("CHE", "LIV", 1, 0),
>     ("CHE", "MCI", 0, 1),
>     ("CHE", "MUN", 1, 0),
>     ("CHE", "NEW", 3, 1),
>     ("CHE", "SOU", 1, 0),
>     ("CHE", "STK", 5, 0),
>     ("CHE", "SWA", 1, 0),
>     ("CHE", "TOT", 1, 3),
>     ("CHE", "WAT", 4, 2),
>     ("CHE", "WBA", 3, 0),
>     ("CHE", "WHU", 1, 1),
>     ("CRY", "ARS", 2, 3),
>     ("CRY", "BOU", 2, 2),
>     ("CRY", "BHA", 3, 2),
>     ("CRY", "BUR", 1, 0),
>     ("CRY", "CHE", 2, 1),
>     ("CRY", "EVE", 2, 2),
>     ("CRY", "HUD", 0, 3),
>     ("CRY", "LEI", 5, 0),
>     ("CRY", "LIV", 1, 2),
>     ("CRY", "MCI", 0, 0),
>     ("CRY", "MUN", 2, 3),
>     ("CRY", "NEW", 1, 1),
>     ("CRY", "SOU", 0, 1),
>     ("CRY", "STK", 2, 1),
>     ("CRY", "SWA", 0, 2),
>     ("CRY", "TOT", 0, 1),
>     ("CRY", "WAT", 2, 1),
>     ("CRY", "WBA", 2, 0),
>     ("CRY", "WHU", 2, 2),
>     ("EVE", "ARS", 2, 5),
>     ("EVE", "BOU", 2, 1),
>     ("EVE", "BHA", 2, 0),
>     ("EVE", "BUR", 0, 1),
>     ("EVE", "CHE", 0, 0),
>     ("EVE", "CRY", 3, 1),
>     ("EVE", "HUD", 2, 0),
>     ("EVE", "LEI", 2, 1),
>     ("EVE", "LIV", 0, 0),
>     ("EVE", "MCI", 1, 3),
>     ("EVE", "MUN", 0, 2),
>     ("EVE", "NEW", 1, 0),
>     ("EVE", "SOU", 1, 1),
>     ("EVE", "STK", 1, 0),
>     ("EVE", "SWA", 3, 1),
>     ("EVE", "TOT", 0, 3),
>     ("EVE", "WAT", 3, 2),
>     ("EVE", "WBA", 1, 1),
>     ("EVE", "WHU", 4, 0),
>     ("HUD", "ARS", 0, 1),
>     ("HUD", "BOU", 4, 1),
>     ("HUD", "BHA", 2, 0),
>     ("HUD", "BUR", 0, 0),
>     ("HUD", "CHE", 1, 3),
>     ("HUD", "CRY", 0, 2),
>     ("HUD", "EVE", 0, 2),
>     ("HUD", "LEI", 1, 1),
>     ("HUD", "LIV", 0, 3),
>     ("HUD", "MCI", 1, 2),
>     ("HUD", "MUN", 2, 1),
>     ("HUD", "NEW", 1, 0),
>     ("HUD", "SOU", 0, 0),
>     ("HUD", "STK", 1, 1),
>     ("HUD", "SWA", 0, 0),
>     ("HUD", "TOT", 0, 4),
>     ("HUD", "WAT", 1, 0),
>     ("HUD", "WBA", 1, 0),
>     ("HUD", "WHU", 1, 4),
>     ("LEI", "ARS", 3, 1),
>     ("LEI", "BOU", 1, 1),
>     ("LEI", "BHA", 2, 0),
>     ("LEI", "BUR", 1, 0),
>     ("LEI", "CHE", 1, 2),
>     ("LEI", "CRY", 0, 3),
>     ("LEI", "EVE", 2, 0),
>     ("LEI", "HUD", 3, 0),
>     ("LEI", "LIV", 2, 3),
>     ("LEI", "MCI", 0, 2),
>     ("LEI", "MUN", 2, 2),
>     ("LEI", "NEW", 1, 2),
>     ("LEI", "SOU", 0, 0),
>     ("LEI", "STK", 1, 1),
>     ("LEI", "SWA", 1, 1),
>     ("LEI", "TOT", 2, 1),
>     ("LEI", "WAT", 2, 0),
>     ("LEI", "WBA", 1, 1),
>     ("LEI", "WHU", 0, 2),
>     ("LIV", "ARS", 4, 0),
>     ("LIV", "BOU", 3, 0),
>     ("LIV", "BHA", 4, 0),
>     ("LIV", "BUR", 1, 1),
>     ("LIV", "CHE", 1, 1),
>     ("LIV", "CRY", 1, 0),
>     ("LIV", "EVE", 1, 1),
>     ("LIV", "HUD", 3, 0),
>     ("LIV", "LEI", 2, 1),
>     ("LIV", "MCI", 4, 3),
>     ("LIV", "MUN", 0, 0),
>     ("LIV", "NEW", 2, 0),
>     ("LIV", "SOU", 3, 0),
>     ("LIV", "STK", 0, 0),
>     ("LIV", "SWA", 5, 0),
>     ("LIV", "TOT", 2, 2),
>     ("LIV", "WAT", 5, 0),
>     ("LIV", "WBA", 0, 0),
>     ("LIV", "WHU", 4, 1),
>     ("MCI", "ARS", 3, 1),
>     ("MCI", "BOU", 4, 0),
>     ("MCI", "BHA", 3, 1),
>     ("MCI", "BUR", 3, 0),
>     ("MCI", "CHE", 1, 0),
>     ("MCI", "CRY", 5, 0),
>     ("MCI", "EVE", 1, 1),
>     ("MCI", "HUD", 0, 0),
>     ("MCI", "LEI", 5, 1),
>     ("MCI", "LIV", 5, 0),
>     ("MCI", "MUN", 2, 3),
>     ("MCI", "NEW", 3, 1),
>     ("MCI", "SOU", 2, 1),
>     ("MCI", "STK", 7, 2),
>     ("MCI", "SWA", 5, 0),
>     ("MCI", "TOT", 4, 1),
>     ("MCI", "WAT", 3, 1),
>     ("MCI", "WBA", 3, 0),
>     ("MCI", "WHU", 2, 1),
>     ("MUN", "ARS", 2, 1),
>     ("MUN", "BOU", 1, 0),
>     ("MUN", "BHA", 1, 0),
>     ("MUN", "BUR", 2, 2),
>     ("MUN", "CHE", 2, 1),
>     ("MUN", "CRY", 4, 0),
>     ("MUN", "EVE", 4, 0),
>     ("MUN", "HUD", 2, 0),
>     ("MUN", "LEI", 2, 0),
>     ("MUN", "LIV", 2, 1),
>     ("MUN", "MCI", 1, 2),
>     ("MUN", "NEW", 4, 1),
>     ("MUN", "SOU", 0, 0),
>     ("MUN", "STK", 3, 0),
>     ("MUN", "SWA", 2, 0),
>     ("MUN", "TOT", 1, 0),
>     ("MUN", "WAT", 1, 0),
>     ("MUN", "WBA", 0, 1),
>     ("MUN", "WHU", 4, 0),
>     ("NEW", "ARS", 2, 1),
>     ("NEW", "BOU", 0, 1),
>     ("NEW", "BHA", 0, 0),
>     ("NEW", "BUR", 1, 1),
>     ("NEW", "CHE", 3, 0),
>     ("NEW", "CRY", 1, 0),
>     ("NEW", "EVE", 0, 1),
>     ("NEW", "HUD", 1, 0),
>     ("NEW", "LEI", 2, 3),
>     ("NEW", "LIV", 1, 1),
>     ("NEW", "MCI", 0, 1),
>     ("NEW", "MUN", 1, 0),
>     ("NEW", "SOU", 3, 0),
>     ("NEW", "STK", 2, 1),
>     ("NEW", "SWA", 1, 1),
>     ("NEW", "TOT", 0, 2),
>     ("NEW", "WAT", 0, 3),
>     ("NEW", "WBA", 0, 1),
>     ("NEW", "WHU", 3, 0),
>     ("SOU", "ARS", 1, 1),
>     ("SOU", "BOU", 2, 1),
>     ("SOU", "BHA", 1, 1),
>     ("SOU", "BUR", 0, 1),
>     ("SOU", "CHE", 2, 3),
>     ("SOU", "CRY", 1, 2),
>     ("SOU", "EVE", 4, 1),
>     ("SOU", "HUD", 1, 1),
>     ("SOU", "LEI", 1, 4),
>     ("SOU", "LIV", 0, 2),
>     ("SOU", "MCI", 0, 1),
>     ("SOU", "MUN", 0, 1),
>     ("SOU", "NEW", 2, 2),
>     ("SOU", "STK", 0, 0),
>     ("SOU", "SWA", 0, 0),
>     ("SOU", "TOT", 1, 1),
>     ("SOU", "WAT", 0, 2),
>     ("SOU", "WBA", 1, 0),
>     ("SOU", "WHU", 3, 2),
>     ("STK", "ARS", 1, 0),
>     ("STK", "BOU", 1, 2),
>     ("STK", "BHA", 1, 1),
>     ("STK", "BUR", 1, 1),
>     ("STK", "CHE", 0, 4),
>     ("STK", "CRY", 1, 2),
>     ("STK", "EVE", 1, 2),
>     ("STK", "HUD", 2, 0),
>     ("STK", "LEI", 2, 2),
>     ("STK", "LIV", 0, 3),
>     ("STK", "MCI", 0, 2),
>     ("STK", "MUN", 2, 2),
>     ("STK", "NEW", 0, 1),
>     ("STK", "SOU", 2, 1),
>     ("STK", "SWA", 2, 1),
>     ("STK", "TOT", 1, 2),
>     ("STK", "WAT", 0, 0),
>     ("STK", "WBA", 3, 1),
>     ("STK", "WHU", 0, 3),
>     ("SWA", "ARS", 3, 1),
>     ("SWA", "BOU", 0, 0),
>     ("SWA", "BHA", 0, 1),
>     ("SWA", "BUR", 1, 0),
>     ("SWA", "CHE", 0, 1),
>     ("SWA", "CRY", 1, 1),
>     ("SWA", "EVE", 1, 1),
>     ("SWA", "HUD", 2, 0),
>     ("SWA", "LEI", 1, 2),
>     ("SWA", "LIV", 1, 0),
>     ("SWA", "MCI", 0, 4),
>     ("SWA", "MUN", 0, 4),
>     ("SWA", "NEW", 0, 1),
>     ("SWA", "SOU", 0, 1),
>     ("SWA", "STK", 1, 2),
>     ("SWA", "TOT", 0, 2),
>     ("SWA", "WAT", 1, 2),
>     ("SWA", "WBA", 1, 0),
>     ("SWA", "WHU", 4, 1),
>     ("TOT", "ARS", 1, 0),
>     ("TOT", "BOU", 1, 0),
>     ("TOT", "BHA", 2, 0),
>     ("TOT", "BUR", 1, 1),
>     ("TOT", "CHE", 1, 2),
>     ("TOT", "CRY", 1, 0),
>     ("TOT", "EVE", 4, 0),
>     ("TOT", "HUD", 2, 0),
>     ("TOT", "LEI", 5, 4),
>     ("TOT", "LIV", 4, 1),
>     ("TOT", "MCI", 1, 3),
>     ("TOT", "MUN", 2, 0),
>     ("TOT", "NEW", 1, 0),
>     ("TOT", "SOU", 5, 2),
>     ("TOT", "STK", 5, 1),
>     ("TOT", "SWA", 0, 0),
>     ("TOT", "WAT", 2, 0),
>     ("TOT", "WBA", 1, 1),
>     ("TOT", "WHU", 1, 1),
>     ("WAT", "ARS", 2, 1),
>     ("WAT", "BOU", 2, 2),
>     ("WAT", "BHA", 0, 0),
>     ("WAT", "BUR", 1, 2),
>     ("WAT", "CHE", 4, 1),
>     ("WAT", "CRY", 0, 0),
>     ("WAT", "EVE", 1, 0),
>     ("WAT", "HUD", 1, 4),
>     ("WAT", "LEI", 2, 1),
>     ("WAT", "LIV", 3, 3),
>     ("WAT", "MCI", 0, 6),
>     ("WAT", "MUN", 2, 4),
>     ("WAT", "NEW", 2, 1),
>     ("WAT", "SOU", 2, 2),
>     ("WAT", "STK", 0, 1),
>     ("WAT", "SWA", 1, 2),
>     ("WAT", "TOT", 1, 1),
>     ("WAT", "WBA", 1, 0),
>     ("WAT", "WHU", 2, 0),
>     ("WBA", "ARS", 1, 1),
>     ("WBA", "BOU", 1, 0),
>     ("WBA", "BHA", 2, 0),
>     ("WBA", "BUR", 1, 2),
>     ("WBA", "CHE", 0, 4),
>     ("WBA", "CRY", 0, 0),
>     ("WBA", "EVE", 0, 0),
>     ("WBA", "HUD", 1, 2),
>     ("WBA", "LEI", 1, 4),
>     ("WBA", "LIV", 2, 2),
>     ("WBA", "MCI", 2, 3),
>     ("WBA", "MUN", 1, 2),
>     ("WBA", "NEW", 2, 2),
>     ("WBA", "SOU", 2, 3),
>     ("WBA", "STK", 1, 1),
>     ("WBA", "SWA", 1, 1),
>     ("WBA", "TOT", 1, 0),
>     ("WBA", "WAT", 2, 2),
>     ("WBA", "WHU", 0, 0),
>     ("WHU", "ARS", 0, 0),
>     ("WHU", "BOU", 1, 1),
>     ("WHU", "BHA", 0, 3),
>     ("WHU", "BUR", 0, 3),
>     ("WHU", "CHE", 1, 0),
>     ("WHU", "CRY", 1, 1),
>     ("WHU", "EVE", 3, 1),
>     ("WHU", "HUD", 2, 0),
>     ("WHU", "LEI", 1, 1),
>     ("WHU", "LIV", 1, 4),
>     ("WHU", "MCI", 1, 4),
>     ("WHU", "MUN", 0, 0),
>     ("WHU", "NEW", 2, 3),
>     ("WHU", "SOU", 3, 0),
>     ("WHU", "STK", 1, 1),
>     ("WHU", "SWA", 1, 0),
>     ("WHU", "TOT", 2, 3),
>     ("WHU", "WAT", 2, 0),
>     ("WHU", "WBA", 2, 1)]

Function for whether a match is a win or not:

> isMatchWin :: Match -> Bool
> isMatchWin (_, _, homeGoals, awayGoals) = homeGoals > awayGoals

Get the match rating difference:

> getRating :: String -> [Team] -> Rating
> getRating team teams = case lookup team teams of
>     Just rating -> rating
>     Nothing     -> 1000

> matchRatingDiff :: [Team] -> Match -> Rating
> matchRatingDiff teams (homeTeam, awayTeam, _, _) = ratingDifference where
>
>     ratingDifference :: Rating
>     ratingDifference = homeRating - awayRating
>
>     homeRating :: Rating
>     homeRating = getRating homeTeam teams
>
>     awayRating :: Rating
>     awayRating = getRating awayTeam teams

> matchWinWithRating :: [Team] -> Match -> (Rating, Bool)
> matchWinWithRating teams match = (ratingDiff, isWin) where
> 
>     ratingDiff :: Rating
>     ratingDiff = matchRatingDiff teams match
> 
>     isWin :: Bool
>     isWin = isMatchWin match

> homeAndAway :: Match -> [Match]
> homeAndAway (homeTeam, awayTeam, homeGoals, awayGoals) = [
>     (homeTeam, awayTeam, homeGoals, awayGoals),
>     (awayTeam, homeTeam, awayGoals, homeGoals)]
