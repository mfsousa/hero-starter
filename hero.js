/*

 Strategies for the hero are contained within the "moves" object as
 name-value pairs, like so:

 //...
 ambusher : function(gamedData, helpers){
 // implementation of strategy.
 },
 heWhoLivesToFightAnotherDay: function(gamedData, helpers){
 // implementation of strategy.
 },
 //...other strategy definitions.

 The "moves" object only contains the data, but in order for a specific
 strategy to be implemented we MUST set the "move" variable to a
 definite property.  This is done like so:

 move = moves.heWhoLivesToFightAnotherDay;

 You MUST also export the move function, in order for your code to run
 So, at the bottom of this code, keep the line that says:

 module.exports = move;

 The "move" function must return "North", "South", "East", "West", or "Stay"
 (Anything else will be interpreted by the game as "Stay")

 The "move" function should accept two arguments that the website will be passing in:
 - a "gameData" object which holds all information about the current state
 of the battle

 - a "helpers" object, which contains useful helper functions
 - check out the helpers.js file to see what is available to you

 (the details of these objects can be found on javascriptbattle.com/#rules)

 Such is the power of Javascript!!!

 */

// Strategy definitions
var moves = {
    // Aggressor
    aggressor: function (gameData, helpers) {
        // Here, we ask if your hero's health is below 30
        if (gameData.activeHero.health <= 30) {
            // If it is, head towards the nearest health well
            return helpers.findNearestHealthWell(gameData);
        } else {
            // Otherwise, go attack someone...anyone.
            return helpers.findNearestEnemy(gameData);
        }
    },

    // Health Nut
    healthNut: function (gameData, helpers) {
        // Here, we ask if your hero's health is below 75
        if (gameData.activeHero.health <= 75) {
            // If it is, head towards the nearest health well
            return helpers.findNearestHealthWell(gameData);
        } else {
            // Otherwise, go mine some diamonds!!!
            return helpers.findNearestNonTeamDiamondMine(gameData);
        }
    },

    // Balanced
    balanced: function (gameData, helpers) {
        //FIXME : fix;
        return null;
    },

    // The "Northerner"
    // This hero will walk North.  Always.
    northener: function (gameData, helpers) {
        var myHero = gameData.activeHero;
        return 'North';
    },

    // The "Blind Man"
    // This hero will walk in a random direction each turn.
    blindMan: function (gameData, helpers) {
        var myHero = gameData.activeHero;
        var choices = ['North', 'South', 'East', 'West'];
        return choices[Math.floor(Math.random() * 4)];
    },

    // The "Priest"
    // This hero will heal nearby friendly champions.
    priest: function (gameData, helpers) {
        var myHero = gameData.activeHero;
        if (myHero.health < 60) {
            return helpers.findNearestHealthWell(gameData);
        } else {
            return helpers.findNearestTeamMember(gameData);
        }
    },

    // The "Unwise Assassin"
    // This hero will attempt to kill the closest enemy hero. No matter what.
    unwiseAssassin: function (gameData, helpers) {
        var myHero = gameData.activeHero;
        if (myHero.health < 30) {
            return helpers.findNearestHealthWell(gameData);
        } else {
            return helpers.findNearestEnemy(gameData);
        }
    },

    // The "Careful Assassin"
    // This hero will attempt to kill the closest weaker enemy hero.
    carefulAssassin: function (gameData, helpers) {
        var myHero = gameData.activeHero;
        if (myHero.health < 50) {
            return helpers.findNearestHealthWell(gameData);
        } else {
            return helpers.findNearestWeakerEnemy(gameData);
        }
    },

    // The "Safe Diamond Miner"
    // This hero will attempt to capture enemy diamond mines.
    safeDiamondMiner: function (gameData, helpers) {
        var myHero = gameData.activeHero;

        //Get stats on the nearest health well
        var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function (boardTile) {
            if (boardTile.type === 'HealthWell') {
                return true;
            }
        });
        var distanceToHealthWell = healthWellStats.distance;
        var directionToHealthWell = healthWellStats.direction;

        if (myHero.health < 40) {
            //Heal no matter what if low health
            return directionToHealthWell;
        } else if (myHero.health < 100 && distanceToHealthWell === 1) {
            //Heal if you aren't full health and are close to a health well already
            return directionToHealthWell;
        } else {
            //If healthy, go capture a diamond mine!
            return helpers.findNearestNonTeamDiamondMine(gameData);
        }
    },

    // The "Selfish Diamond Miner"
    // This hero will attempt to capture diamond mines (even those owned by teammates).
    selfishDiamondMiner: function (gameData, helpers) {
        var myHero = gameData.activeHero;

        //Get stats on the nearest health well
        var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function (boardTile) {
            if (boardTile.type === 'HealthWell') {
                return true;
            }
        });

        var distanceToHealthWell = healthWellStats.distance;
        var directionToHealthWell = healthWellStats.direction;

        if (myHero.health < 40) {
            //Heal no matter what if low health
            return directionToHealthWell;
        } else if (myHero.health < 100 && distanceToHealthWell === 1) {
            //Heal if you aren't full health and are close to a health well already
            return directionToHealthWell;
        } else {
            //If healthy, go capture a diamond mine!
            return helpers.findNearestUnownedDiamondMine(gameData);
        }
    },

    // The "Coward"
    // This hero will try really hard not to die.
    coward: function (gameData, helpers) {
        return helpers.findNearestHealthWell(gameData);
    },

    optimal: function (gameData, helpers) {
        var hero = gameData.activeHero;
        var board = gameData.board;

        var dangerHealth = 70;
        var safeHealth = 80;

        //Get stats on the nearest health well
        var healthWellStats = helpers.findNearestObjectDirectionAndDistance(board, hero, function (boardTile) {
            if (boardTile.type === 'HealthWell') {
                return true;
            }
        });

        //Get stats of nearest non team diamond mine
        var nonTeamDiamondMineStats = helpers.findNearestObjectDirectionAndDistance(board, hero, function (boardTile) {
            if (boardTile.type === 'DiamondMine') {
                if (boardTile.owner) {
                    return boardTile.owner.team !== hero.team;
                } else {
                    return true;
                }
            } else {
                return false;
            }
        });

        //Get stats of nearest enemy
        var enemyStats = helpers.findNearestObjectDirectionAndDistance(board, hero, function(boardTile) {
            return boardTile.type === 'Hero' && boardTile.team !== hero.team;
        });

        //Get stats of nearest weaker enemy
        var weakerEnemyStats = helpers.findNearestObjectDirectionAndDistance(board, hero, function(boardTile) {
            return boardTile.type === 'Hero' && boardTile.team !== hero.team && boardTile.health <= 30;
        });

        //Get stats of nearest weaker team member
        var weakerTeamHeroStats = helpers.findNearestObjectDirectionAndDistance(board, hero, function(boardTile) {
            return boardTile.type === 'Hero' && boardTile.team === hero.team && boardTile.health <= 30;
        });

        //Get stats of nearest grave
        var gravesStats = helpers.findNearestObjectDirectionAndDistance(board, hero, function(boardTile) {
            return boardTile.subType === 'Bones';
        });



        //Heal no matter what if low health
        if (hero.health <= dangerHealth) {
            return healthWellStats.direction;
        }

        //Attack existent worth enemy
        if (weakerEnemyStats.distance === 1) {
            return weakerEnemyStats.direction;
        }

        //Going trough a needy team member: heal him!
        if (weakerTeamHeroStats.distance === 1) {
            return weakerTeamHeroStats.direction;
        }

        //Heal hero if is worth doing it now, although is not in a danger zone
        if (hero.health <= safeHealth && healthWellStats.distance === 1) {
            return healthWellStats.direction;
        }

        //Well... go just capture a diamond mine! If there is any
        if (nonTeamDiamondMineStats.distance > 0) {
            if (Math.floor((Math.random() * 100) + 1) > 90) {
                return 'Stay';
            }

            return nonTeamDiamondMineStats.direction;
        }

        // Get me some bones!!
        if (gravesStats.distance < enemyStats.distance) {
            return gravesStats.direction;
        }

        // Just attack someone...
        return enemyStats.direction;
    }
};

//  Set our heros strategy
var move = moves.optimal;

// Export the move function here
module.exports = move;
