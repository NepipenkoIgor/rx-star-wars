/**
 * Created by igor on 1/29/16.
 */
/** init canvas*/
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
/** init ships and missels*/
var spaceShip = new Image();
spaceShip.src = "images/my_ship.png";
var missle = new Image();
missle.src = "images/my_missle.png";
var alien = new Image();
alien.src = "images/alien.gif";
var alien_missle = new Image();
alien_missle.src = "images/alien_missle.png";
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
    return obj.x > -96 && obj.x < canvas.width + 96 &&
        obj.y > -96 && obj.y < canvas.height + 96;
}
function collision(target1, target2) {
    return (target1.x > target2.x - 14 && target1.x < target2.x + 46) &&
        (target1.y > target2.y - 32 && target1.y < target2.y + 32);
}
function gameOver(ship, enemies) {
    return enemies.some(function (enemy) {
        //if (collision(ship, enemy)) {
        //    return true;
        //}
        return enemy.shots.some(function (shot) {
            return collision(shot, ship);
        });
    });
}
function paintStars(stars) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    stars.forEach(function (star) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size / 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    });
}
function drawShip(x, y) {
    ctx.drawImage(spaceShip, x, y);
}
function drawMyShots(shots, enemies) {
    ctx.fillStyle = '#B8860B';
    shots.forEach(function (shot, i) {
        for (var _i = 0; _i < enemies.length; _i++) {
            var enemy = enemies[_i];
            if (!i) {
                return;
            }
            if (!enemy.isDead && collision(shot, enemy)) {
                ScoreSubject.onNext(SCORE_INC);
                enemy.isDead = true;
                enemy.x = enemy.y = -100;
                break;
            }
        }
        shot.y -= SHOTING_SPEED;
        ctx.drawImage(missle, shot.x, shot.y);
        //ctx.drawImage(missle, shot.xR, shot.yR);
    });
}
function drawEnemies(enemies) {
    enemies.forEach(function (enemy) {
        enemy.y += 5;
        if (!enemy.isDead) {
            ctx.drawImage(alien, enemy.x, enemy.y);
        }
        enemy.shots.forEach(function (shot) {
            shot.y += SHOTING_SPEED;
            ctx.drawImage(alien_missle, shot.x, shot.y);
        });
    });
}
function drawScores(score) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText("Score: " + score, 40, 43);
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
/** stream fo MyShip*/
var mouseMove = Rx.Observable.fromEvent(canvas, 'mousemove');
var MySpaceShip = mouseMove
    .map(function (e) {
    return { x: e.pageX - 32, y: PLAYER_POS };
})
    .startWith({ x: canvas.width / 2, y: PLAYER_POS });
var MyFire = Rx.Observable
    .fromEvent(canvas, 'click')
    .sample(200)
    .timestamp();
var MyShots = Rx.Observable
    .combineLatest(MySpaceShip, MyFire, function (MySpaceShip, MyFire) {
    return { timestamp: MyFire.timestamp, x: MySpaceShip.x };
})
    .distinctUntilChanged(function (shot) {
    return shot.timestamp;
})
    .scan(function (shots, shot) {
    shots.push({ x: shot.x + 16, y: PLAYER_POS });
    return shots;
}, []);
/** stream fo Aliens*/
var Enemies = Rx.Observable.timer(0, ENEMY_RESP)
    .scan(function (enemies) {
    var enemy = {
        x: Math.random() * canvas.width,
        y: -30,
        shots: [],
        isDead: false
    };
    Rx.Observable.timer(0, ENEMY_SHOT_RESP).subscribe(function () {
        if (!enemy.isDead) {
            enemy.shots.push({ x: enemy.x + 16, y: enemy.y });
        }
        enemy.shots.filter(isVisible);
    });
    enemies.push(enemy);
    return enemies.filter(function (enemy) {
        return !(enemy.isDead && !enemy.shots.length && !isVisible(enemy));
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
    return !gameOver(items.mySpaceShip, items.enemies);
});
Game.subscribe(function (items) {
    var stars = items.stars, mySpaceShip = items.mySpaceShip, myShots = items.myShots, enemies = items.enemies;
    paintStars(stars);
    drawShip(mySpaceShip.x, mySpaceShip.y);
    drawMyShots(myShots, enemies);
    drawEnemies(enemies);
    drawScores(currentScore);
});
/**  init first value in shot's stream*/
canvas.click();
