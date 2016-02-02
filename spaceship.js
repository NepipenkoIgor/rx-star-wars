/**
 * Created by igor on 1/29/16.
 */
/** init canvas*/
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
document.body.innerHTML = '';
document.body.appendChild(canvas);
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
/** init ships and missels*/
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
/** init consts*/
var SPEED = 40;
var STARS_NUM = 250;
var PLAYER_POS = canvas.height - 100;
var ENEMY_RESP = 1500;
var ENEMY_SHOT_RESP = 750;
var SHOTING_SPEED = 15;
var SCORE_INC = 10;
/** util game functions*/
function isVisible(obj) {
    return obj.x > -obj.type.naturalWidth && obj.x < canvas.width + obj.type.naturalWidth &&
        obj.y > -obj.type.naturalHeight && obj.y < canvas.height + obj.type.naturalHeight;
}
function collision(target1, target2) {
    return (target1.x + target1.type.naturalWidth / 2 > target2.x &&
        target1.x + target1.type.naturalWidth / 2 < target2.x + target2.type.naturalWidth) &&
        (target1.y - target1.type.naturalHeight / 2 > target2.y - target2.type.naturalHeight / 2 &&
            target1.y - target1.type.naturalHeight / 2 < target2.y + target2.type.naturalHeight / 2);
}
function gameOver(ship, enemies) {
    return enemies.some(function (enemy) {
        if (collision(ship, enemy)) {
            return true;
        }
        return enemy.shots.some(function (shot) {
            return collision(shot, ship);
        });
    });
}
function paintStars(stars) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#01162f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    stars.forEach(function (star) {
        window.requestAnimationFrame(function () {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size / 2, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
        });
    });
}
function drawShip(x, y) {
    window.requestAnimationFrame(function () {
        ctx.drawImage(spaceShip, x, y);
    });
}
function drawEnemies(enemies) {
    enemies.forEach(function (enemy) {
        enemy.y += 5;
        if (!enemy.isDead) {
            window.requestAnimationFrame(function () {
                ctx.drawImage(enemy.type, enemy.x, enemy.y);
            });
        }
        enemy.shots.forEach(function (shot) {
            shot.y += SHOTING_SPEED;
            window.requestAnimationFrame(function () {
                ctx.drawImage(alien_missle, shot.x, shot.y);
            });
        });
    });
}
function drawScores(score) {
    window.requestAnimationFrame(function () {
        ctx.drawImage(alien_icon, 5, 5);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText("Score: " + score, 40, 43);
    });
}
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
function startGame() {
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
                star.opacity = getRandomArbitrary(0, 1);
            });
            return stars;
        });
    });
    /** stream fo MyShip*/
    var mouseMove = Rx.Observable.fromEvent(canvas, 'mousemove');
    var MySpaceShip = mouseMove
        .map(function (e) {
        return { x: e.pageX - 32, y: PLAYER_POS, type: spaceShip };
    })
        .startWith({ x: canvas.width / 2, y: PLAYER_POS, type: spaceShip });
    var MyFire = Rx.Observable
        .fromEvent(canvas, 'mousedown')
        .timestamp();
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
            y: PLAYER_POS,
            type: my_missle
        });
        return shots.filter(function (shot) {
            return isVisible(shot);
        });
    }, []);
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
        Rx.Observable.timer(0, ENEMY_SHOT_RESP).subscribe(function () {
            if (!enemy.isDead) {
                enemy.shots.push({
                    x: enemy.x + enemy.type.naturalWidth / 2 - alien_missle.naturalWidth / 2,
                    y: enemy.y + enemy.type.naturalHeight,
                    type: alien_missle
                });
            }
            enemy.shots.filter(isVisible);
        });
        enemies.push(enemy);
        return enemies.filter(function (enemy) {
            enemy.shots = enemy.shots.filter(isVisible);
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
    var Game = Rx.Observable.combineLatest(StarsStream, MySpaceShip, MyShots, Enemies, function (stars, mySpaceShip, myShots, enemies) {
        return {
            stars: stars,
            mySpaceShip: mySpaceShip,
            myShots: myShots,
            enemies: enemies
        };
    })
        .sample(40)
        .takeWhile(function (items) {
        if (!gameOver(items.mySpaceShip, items.enemies)) {
            return true;
        }
        setTimeout(startGame, 2000);
    });
    Game.subscribe(function (items) {
        // window.requestAnimationFrame(()=> {
        var stars = items.stars, mySpaceShip = items.mySpaceShip, myShots = items.myShots, enemies = items.enemies;
        paintStars(stars);
        drawShip(mySpaceShip.x, mySpaceShip.y);
        drawMyShots(myShots, enemies);
        drawEnemies(enemies);
        drawScores(currentScore);
        //})
    });
    function drawMyShots(shots, enemies) {
        ctx.fillStyle = '#B8860B';
        var shoot_indexses = [];
        shots.forEach(function (shot, i) {
            for (var _i = 0; _i < enemies.length; _i++) {
                var enemy = enemies[_i];
                if (!i) {
                    return;
                }
                if (!enemy.isDead && collision(shot, enemy)) {
                    ScoreSubject.onNext(SCORE_INC);
                    enemy.isDead = true;
                    enemy.x = enemy.y = -1000;
                    shoot_indexses.push(i);
                    break;
                }
            }
            shot.y -= SHOTING_SPEED;
            window.requestAnimationFrame(function () {
                ctx.drawImage(my_missle, shot.x, shot.y);
            });
        });
        shoot_indexses.forEach(function (index, i) {
            shots.splice(index - i, 1);
        });
    }
    /**  init first value in shot's stream*/
    var clickEvent = document.createEvent('MouseEvents');
    clickEvent.initEvent('mousedown', true, true);
    canvas.dispatchEvent(clickEvent);
}
startGame();
