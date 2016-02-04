/**
 * Created by igor on 1/29/16.
 */
/** init canvas*/
var canvasBack = document.querySelector('#arena_background');
var ctxBack = canvasBack.getContext('2d');
canvasBack.height = window.innerHeight;
canvasBack.width = window.innerWidth;
var canvas = document.querySelector('#arena');
var ctx = canvas.getContext('2d');
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
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
/** init consts*/
var SPEED = 40;
var STARS_NUM = 250;
var PLAYER_POS = canvas.height - 100;
var ENEMY_RESP = 1500;
var ENEMY_SHOT_RESP = 750;
var SHOTING_SPEED = 10;
var SCORE_INC = 10;
var ALIEN_SPEED = 3;
/** util game functions*/
function isVisible(obj) {
    return obj.x > -obj.type.naturalWidth && obj.x < canvas.width + obj.type.naturalWidth &&
        obj.y > -obj.type.naturalHeight && obj.y < canvas.height + obj.type.naturalHeight;
}
function collision(target1, target2) {
    return ((target1.x > target2.x) &&
        (target1.x < target2.x + target2.type.naturalWidth)) &&
        ((target1.y > target2.y) &&
            (target1.y + target1.type.naturalHeight) < (target2.y + target2.type.naturalHeight));
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
function drawShip(ship) {
    ctx.clearRect(ship.oldX, ship.y, ship.type.naturalWidth, ship.type.naturalHeight);
    ctx.drawImage(spaceShip, ship.x, ship.y);
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
    if (enemy.stop) {
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
        ctx.clearRect(enemy.x, enemy.y, enemy.type.naturalWidth, enemy.type.naturalHeight);
        enemy.isDead = true;
        return;
    }
    if (enemy.isDead && !enemy.boom) {
        ctx.clearRect(enemy.x, enemy.y, enemy.type.naturalWidth, enemy.type.naturalHeight);
        enemy.boom = true;
        ctx.drawImage(boom, enemy.x, enemy.y);
        setTimeout(function () {
            ctx.clearRect(enemy.x, enemy.y, boom.naturalWidth, boom.naturalHeight);
        }, 60);
    }
    if (!enemy.isDead) {
        ctx.clearRect(enemy.x, enemy.y, enemy.type.naturalWidth, enemy.type.naturalHeight);
        enemy.y += ALIEN_SPEED;
        ctx.drawImage(enemy.type, enemy.x, enemy.y);
    }
    enemy.shots.forEach(function (shot) {
        if (collision(shot, mySpaceShip)) {
            mySpaceShip.isDead = true;
        }
        ctx.clearRect(shot.x, shot.y, shot.type.naturalWidth, shot.type.naturalHeight);
        shot.y += SHOTING_SPEED;
        ctx.drawImage(alien_missle, shot.x, shot.y);
    });
    window.requestAnimationFrame(function () {
        drawEnemy(enemy, mySpaceShip);
    });
}
function drawScores(score) {
    ctx.clearRect(0, 0, 400, 100);
    ctx.drawImage(alien_icon, 5, 5);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    var txt = "Score: " + score;
    ctx.fillText(txt, 40, 43);
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
        myStartPosition.x = e.pageX - spaceShip.naturalWidth / 2;
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
        .sample(20)
        .takeWhile(function (items) {
        if (!items.mySpaceShip.isDead) {
            return true;
        }
        console.log('Game Over');
        items.enemies.forEach(function (enemy) {
            enemy.stop = true;
        });
        items.myShots.forEach(function (shot) {
            shot.stop = true;
        });
        MySpaceShipSub.dispose();
        ctx.clearRect(items.mySpaceShip.x, items.mySpaceShip.y, items.mySpaceShip.type.naturalWidth, items.mySpaceShip.type.naturalHeight);
        ctx.drawImage(boom, items.mySpaceShip.x, items.mySpaceShip.y);
    });
    Game.subscribe(function (items) {
        var mySpaceShip = items.mySpaceShip, myShots = items.myShots, enemies = items.enemies;
        drawEnemies(enemies, mySpaceShip);
        drawMyShots(myShots, enemies);
        //drawEnemies(enemies);
        drawScores(currentScore);
        //drawShip(mySpaceShip);
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
        ctx.clearRect(shot.x, shot.y, shot.type.naturalWidth, shot.type.naturalHeight);
        if (shot.y < 0) {
            return;
        }
        for (var _i = 0; _i < enemies.length; _i++) {
            var enemy = enemies[_i];
            if (!enemy.isDead && collision(shot, enemy)) {
                ScoreSubject.onNext(SCORE_INC);
                enemy.isDead = true;
                ctx.clearRect(shot.x, shot.y, shot.type.naturalWidth, shot.type.naturalHeight);
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
    /**  init first value in shot's stream*/
    //var clickEvent = document.createEvent('MouseEvents');
    //clickEvent.initEvent('mousedown', true, true);
    //canvas.dispatchEvent(clickEvent);
}
startGame();
