/**
 * Created by igor on 1/29/16.
 */
/// <reference path="./typings/tsd.d.ts" />
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function () {
        return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();
}
/** init canvas*/
var area_planets = [];
var canvasBack = document.querySelector('#arena_background');
var ctxBack = canvasBack.getContext('2d');
var canvasPlanets1 = document.querySelector('#arena_planets_1');
var ctxPlanets1 = canvasPlanets1.getContext('2d');
area_planets.push(ctxPlanets1);
var canvasPlanets2 = document.querySelector('#arena_planets_2');
var ctxPlanets2 = canvasPlanets2.getContext('2d');
area_planets.push(ctxPlanets2);
var canvasPlanets3 = document.querySelector('#arena_planets_3');
var ctxPlanets3 = canvasPlanets3.getContext('2d');
area_planets.push(ctxPlanets3);
var canvasPlanets4 = document.querySelector('#arena_planets_4');
var ctxPlanets4 = canvasPlanets4.getContext('2d');
area_planets.push(ctxPlanets4);
var canvasPlanets5 = document.querySelector('#arena_planets_5');
var ctxPlanets5 = canvasPlanets5.getContext('2d');
area_planets.push(ctxPlanets5);
var canvasPlanets6 = document.querySelector('#arena_planets_6');
var ctxPlanets6 = canvasPlanets6.getContext('2d');
area_planets.push(ctxPlanets6);
var canvas = document.querySelector('#arena');
var ctx = canvas.getContext('2d');
var scoreCanvas = document.querySelector('#scores');
var ctxScore = scoreCanvas.getContext('2d');
var positionOfMonitor = document.querySelector('#play_area').getBoundingClientRect().left;
console.log(positionOfMonitor);
/** init ships and missels*/
var boom = new Image();
boom.src = "images/boom.png";
var spaceShip = new Image();
spaceShip.src = "images/my_ship.png";
var my_missle = new Image();
my_missle.src = "images/my_missle.png";
var alien_icon = new Image();
alien_icon.src = "images/alien_icon.png";
var aliens = [];
var alien1 = new Image();
alien1.src = "images/alien-ship1.png";
aliens.push(alien1);
var alien2 = new Image();
alien2.src = "images/alien-ship2.png";
aliens.push(alien2);
var alien3 = new Image();
alien3.src = "images/alien-ship3.png";
aliens.push(alien3);
var alien4 = new Image();
alien4.src = "images/alien-ship4.png";
aliens.push(alien4);
var alien5 = new Image();
alien5.src = "images/alien-ship5.png";
aliens.push(alien5);
var alien_missle = new Image();
alien_missle.src = "images/alien_missle.png";
var spaceObjects = [];
var spaceObj1 = new Image();
spaceObj1.src = "images/sun.png";
spaceObjects.push(spaceObj1);
var spaceObj2 = new Image();
spaceObj2.src = "images/sputnik.png";
spaceObjects.push(spaceObj2);
var spaceObj3 = new Image();
spaceObj3.src = "images/saturn.png";
spaceObjects.push(spaceObj3);
var spaceObj4 = new Image();
spaceObj4.src = "images/meteor1.png";
spaceObjects.push(spaceObj4);
var spaceObj5 = new Image();
spaceObj5.src = "images/meteor2.png";
spaceObjects.push(spaceObj5);
var spaceObj6 = new Image();
spaceObj6.src = "images/meteor3.png";
spaceObjects.push(spaceObj6);
/** init consts*/
var SPEED = 40;
var STARS_NUM = 250;
var PLAYER_POS = canvas.height - 100;
var ENEMY_RESP = 1500;
var ENEMY_SHOT_RESP = 750;
var SHOTING_SPEED = 7;
var SCORE_INC = 10;
var ALIEN_SPEED = 3;
/** util game functions*/
function isVisible(obj) {
    return obj.x > -obj.type.naturalWidth && obj.x < canvas.width + obj.type.naturalWidth &&
        obj.y > -obj.type.naturalHeight && obj.y < canvas.height + obj.type.naturalHeight;
}
function collision(target1, target2) {
    return ((target1.x + target1.type.naturalWidth >= target2.x) &&
        (target1.x <= target2.x + target2.type.naturalWidth)) &&
        ((target1.y > target2.y) &&
            target1.y < (target2.y + target2.type.naturalHeight / 2));
}
//function gameOver(ship, enemies) {
//    return enemies.some((enemy:any)=> {
//        if (collision(ship, enemy)) {
//            return true;
//        }
//        return enemy.shots.some((shot)=> {
//            return collision(shot, ship)
//        })
//    })
//}
function paintStars(stars) {
    ctxBack.fillStyle = '#01162f';
    ctxBack.fillRect(0, 0, canvas.width, canvas.height);
    ctxBack.fillStyle = '#ffffff';
    ctxBack.beginPath();
    stars.forEach(function (star) {
        ctxBack.moveTo(star.x, star.y);
        ctxBack.arc(star.x, star.y, star.size / 2, 0, 2 * Math.PI);
    });
    ctxBack.stroke();
    ctxBack.fill();
}
function pointSpaceObject(spaceObject) {
    area_planets[spaceObject.num].clearRect(spaceObject.x - 3, spaceObject.y - 3, spaceObject.type.naturalWidth + 3, spaceObject.type.naturalHeight + 3);
    spaceObject.y += 1;
    if (spaceObject.y > canvas.height) {
        spaceObject.y = -spaceObject.type.naturalHeight;
    }
    area_planets[spaceObject.num].drawImage(spaceObject.type, spaceObject.x, spaceObject.y);
    window.requestAnimationFrame(function () {
        pointSpaceObject(spaceObject);
    });
}
function drawShip(ship) {
    ctx.clearRect(ship.oldX - 3, ship.y - 3, ship.type.naturalWidth + 3, ship.type.naturalHeight + 3);
    ctx.drawImage(spaceShip, ship.x, ship.y);
}
function drawScores(score) {
    ctxScore.clearRect(0, 0, 200, 100);
    ctxScore.drawImage(alien_icon, 5, 5);
    ctxScore.fillStyle = '#ffffff';
    ctxScore.font = 'bold 26px sans-serif';
    ctxScore.fillText("Score: " + score, 40, 43);
}
/** stream of stars*/
var StarsStream = Rx.Observable.range(1, STARS_NUM)
    .map(function () {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1
    };
})
    .toArray()
    .flatMap(function (stars) {
    return Rx.Observable.timer(0, SPEED)
        .map(function () {
        stars.forEach(function (star) {
            star.y > canvas.height ? star.y = 0 : star.y += 3;
        });
        return stars;
    });
});
StarsStream.subscribe(function (stars) {
    paintStars(stars);
});
var SpaceObjectsStream = Rx.Observable.from(spaceObjects)
    .map(function (spaceObject, i) {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        type: spaceObjects[i],
        num: i
    };
});
SpaceObjectsStream.subscribe(function (spaceObject) {
    pointSpaceObject(spaceObject);
});
function startGame() {
    var myStartPosition = { x: canvas.width / 2, y: PLAYER_POS, type: spaceShip, oldX: canvas.width / 2 };
    //
    //let Key = Rx.Observable.fromEvent(document, 'keydown')
    //    .startWith(myStartPosition)
    //let KeyLeft = Key.filter((e:any)=> {
    //        return e.keyCode === 37
    //    })
    //    .map((e:any)=> {
    //        myStartPosition.oldX = myStartPosition.x;
    //        myStartPosition.x -= 10;
    //        if (myStartPosition.x <= 0) {
    //            myStartPosition.x = 5;
    //        }
    //        return myStartPosition;
    //    })
    //let KeyRight = Key.filter((e:any)=> {
    //        return e.keyCode === 39
    //    })
    //    .map((e:any)=> {
    //        myStartPosition.oldX = myStartPosition.x;
    //        myStartPosition.x += 10;
    //        if (myStartPosition.x + myStartPosition.type.naturalWidth >= canvas.width) {
    //            myStartPosition.x = canvas.width - myStartPosition.type.naturalWidth - 5;
    //        }
    //        return myStartPosition;
    //    })
    //
    //let MySpaceShip = Rx.Observable.merge(KeyLeft, KeyRight)
    //
    //let MyFire = Key
    //    .filter((e:any)=> {
    //        return e.keyCode === 32
    //    })
    //    .timestamp();
    //
    //
    //let MyShots = Rx.Observable
    //    .combineLatest(MySpaceShip, MyFire, (mySpaceShip, MyFire)=> {
    //        return {timestamp: MyFire.timestamp, x: mySpaceShip.x}
    //    })
    //    .distinctUntilChanged((shot) => {
    //        return shot.timestamp
    //    })
    //    .scan((shots, shot)=> {
    //        shots.push({
    //            x: shot.x + spaceShip.naturalWidth / 2 - my_missle.naturalWidth / 2,
    //            y: PLAYER_POS - spaceShip.naturalHeight/ 2,
    //            type: my_missle,
    //        });
    //        return shots.filter(isVisible);
    //    }, [])
    /** stream fo MyShip*/
    var mouseMove = Rx.Observable.fromEvent(canvas, 'mousemove');
    var MySpaceShip = mouseMove
        .map(function (e) {
        myStartPosition.oldX = myStartPosition.x;
        myStartPosition.x = e.pageX - positionOfMonitor - spaceShip.naturalWidth / 2;
        return myStartPosition;
    })
        .startWith(myStartPosition);
    var MyFire = Rx.Observable
        .fromEvent(canvas, 'mousedown')
        .timestamp()
        .debounce(60);
    var MyShots = Rx.Observable
        .combineLatest(MySpaceShip, MyFire, function (MySpaceShip, MyFire) {
        return { timestamp: MyFire.timestamp, x: MySpaceShip.x };
    })
        .distinctUntilChanged(function (shot) {
        return shot.timestamp;
    })
        .scan(function (shots, shot) {
        shots.push({
            x: shot.x + spaceShip.naturalWidth / 2 - my_missle.naturalWidth / 2,
            y: PLAYER_POS - spaceShip.naturalHeight / 2,
            type: my_missle
        });
        return shots.filter(isVisible);
    }, []);
    var MySpaceShipSub = MySpaceShip.subscribe(function (ship) {
        drawShip(ship);
    });
    /** stream fo Aliens*/
    var Enemies = Rx.Observable.timer(0, ENEMY_RESP)
        .scan(function (enemies) {
        var index = Math.floor(Math.random() * aliens.length);
        var alien = aliens[index];
        var enemy = {
            x: Math.random() * (canvas.width - alien.naturalWidth),
            y: -30,
            shots: [],
            isDead: false,
            type: alien
        };
        enemies.push(enemy);
        return enemies.filter(function (enemy) {
            return !(enemy.isDead || !isVisible(enemy)) || enemy.shots.length;
        });
    }, []);
    /** stream of scores*/
    var ScoreSubject = new Rx.Subject();
    var Score = ScoreSubject.scan(function (prev, cur) {
        return prev + cur;
    }, 0).concat(Rx.Observable.return(0));
    var currentScore = 0;
    Score.subscribe(function (score) {
        currentScore = score;
    });
    /** stream of full Game*/
    var Game = Rx.Observable.combineLatest(MySpaceShip, MyShots, Enemies, function (mySpaceShip, myShots, enemies) {
        return {
            myShots: myShots,
            enemies: enemies,
            mySpaceShip: mySpaceShip
        };
    })
        .sample(40)
        .takeWhile(function (items) {
        var mySpaceShip = items.mySpaceShip;
        if (!mySpaceShip.isDead) {
            return true;
        }
        console.log('Game Over');
        MySpaceShipSub.dispose();
        if (!mySpaceShip.collapseWithEnemy) {
            ctx.clearRect(mySpaceShip.x - 3, mySpaceShip.y - 3, mySpaceShip.type.naturalWidth + 3, mySpaceShip.type.naturalHeight + 3);
            ctx.drawImage(boom, mySpaceShip.x, mySpaceShip.y);
        }
        items.myShots.forEach(function (shot) {
            shot.stop = true;
        });
    });
    Game.subscribe(function (items) {
        var mySpaceShip = items.mySpaceShip, myShots = items.myShots, enemies = items.enemies;
        drawEnemies(enemies, mySpaceShip);
        drawMyShots(myShots, enemies);
        drawScores(currentScore);
    });
    function drawMyShots(shots, enemies) {
        shots.forEach(function (shot, i) {
            if (shot.isDraw) {
                return;
            }
            shot.isDraw = true;
            drawShot(shot, enemies);
        });
    }
    function drawShot(shot, enemies) {
        if (shot.stop) {
            return;
        }
        ctx.clearRect(shot.x - 3, shot.y - 3, shot.type.naturalWidth + 3, shot.type.naturalHeight + 3);
        if (shot.y < 0) {
            return;
        }
        for (var _i = 0; _i < enemies.length; _i++) {
            var enemy = enemies[_i];
            if (!enemy.isDead && collision(shot, enemy)) {
                ScoreSubject.onNext(SCORE_INC);
                enemy.isDead = true;
                ctx.clearRect(shot.x - 3, shot.y - 3, shot.type.naturalWidth + 3, shot.type.naturalHeight + 3);
                return;
            }
        }
        shot.y -= SHOTING_SPEED;
        if (!shot.isDead) {
            ctx.drawImage(shot.type, shot.x, shot.y);
        }
        window.requestAnimationFrame(function () {
            drawShot(shot, enemies);
        });
    }
    function drawEnemies(enemies, mySpaceShip) {
        enemies.forEach(function (enemy, i) {
            if (enemy.isDraw) {
                return;
            }
            enemy.isDraw = true;
            drawEnemy(enemy, mySpaceShip);
        });
    }
    function drawEnemy(enemy, mySpaceShip) {
        if (collision(mySpaceShip, enemy) || collision(enemy, mySpaceShip)) {
            MySpaceShipSub.dispose();
            mySpaceShip.isDead = true;
            mySpaceShip.collapseWithEnemy = true;
            ctx.clearRect(mySpaceShip.x - 3, mySpaceShip.y - 3, mySpaceShip.type.naturalWidth + 3, mySpaceShip.type.naturalHeight + 3);
            ctx.clearRect(enemy.x - 3, enemy.y - 3, enemy.type.naturalWidth + 3, enemy.type.naturalHeight + 3);
            ctx.drawImage(boom, mySpaceShip.x, mySpaceShip.y);
            enemy.boom = true;
            return;
        }
        if (mySpaceShip.isDead) {
            return;
        }
        if ((!enemy.shotsCount || enemy.shotsCount > 30) && !enemy.isDead) {
            enemy.shotsCount = 0;
            enemy.shots.push({
                x: enemy.x + enemy.type.naturalWidth / 2 - alien_missle.naturalWidth / 2,
                y: enemy.y + enemy.type.naturalHeight,
                type: alien_missle
            });
        }
        enemy.shotsCount++;
        if (enemy.y > canvas.height) {
            ctx.clearRect(enemy.x - 3, enemy.y - 3, enemy.type.naturalWidth + 3, enemy.type.naturalHeight + 3);
            enemy.isDead = true;
            return;
        }
        if (enemy.isDead && !enemy.boom) {
            ctx.clearRect(enemy.x - 3, enemy.y - 3, enemy.type.naturalWidth + 3, enemy.type.naturalHeight + 3);
            enemy.boom = true;
            ctx.drawImage(boom, enemy.x, enemy.y);
            setTimeout(function () {
                ctx.clearRect(enemy.x - 3, enemy.y - 3, boom.naturalWidth + 3, boom.naturalHeight + 3);
            }, 60);
        }
        if (!enemy.isDead) {
            ctx.clearRect(enemy.x - 3, enemy.y - 3, enemy.type.naturalWidth + 3, enemy.type.naturalHeight + 3);
            enemy.y += ALIEN_SPEED;
            ctx.drawImage(enemy.type, enemy.x, enemy.y);
        }
        enemy.shots.forEach(function (shot) {
            ctx.clearRect(shot.x - 3, shot.y - 3, shot.type.naturalWidth + 3, shot.type.naturalHeight + 3);
            if (collision(shot, mySpaceShip)) {
                mySpaceShip.isDead = true;
                return;
            }
            shot.y += SHOTING_SPEED;
            ctx.drawImage(alien_missle, shot.x, shot.y);
        });
        window.requestAnimationFrame(function () {
            drawEnemy(enemy, mySpaceShip);
        });
    }
    /**  init first value in shot's stream*/
    //var clickEvent = document.createEvent('MouseEvents');
    //clickEvent.initEvent('mousedown', true, true);
    //canvas.dispatchEvent(clickEvent);
}
startGame();
