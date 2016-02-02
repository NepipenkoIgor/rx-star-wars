/**
 * Created by igor on 1/29/16.
 */

/// <reference path="./../typings/tsd.d.ts" />

type star={x:number,y:number,size:number};
type point={x:number,y:number};

/** init canvas*/
let canvas:HTMLCanvasElement = document.createElement('canvas');
let ctx:CanvasRenderingContext2D = canvas.getContext('2d');
document.body.appendChild(canvas);
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

/** init ships and missels*/
let spaceShip = new Image();
spaceShip.src = "images/my_ship.png";

let missle = new Image();
missle.src = "images/my_missle.png";

let alien = new Image();
alien.src = "images/alien.gif";

let alien_missle = new Image();
alien_missle.src = "images/alien_missle.png";


/** init consts*/
const SPEED:number = 40;
const STARS_NUM:number = 250;
const PLAYER_POS:number = canvas.height - 100;
const ENEMY_RESP:number = 1500;
const ENEMY_SHOT_RESP:number = 750;
const SHOTING_SPEED:number = 15;
const SCORE_INC:number = 10;

/** util game functions*/
function isVisible(obj) {
    return obj.x > -96 && obj.x < canvas.width + 96 &&
        obj.y > -96 && obj.y < canvas.height + 96
}

function collision(target1, target2) {
    return (target1.x > target2.x - 14 && target1.x < target2.x + 46) &&
        (target1.y > target2.y - 32 && target1.y < target2.y + 32)
}
function gameOver(ship, enemies) {
    return enemies.some((enemy:any)=> {
        //if (collision(ship, enemy)) {
        //    return true;
        //}
        return enemy.shots.some((shot)=> {
            return collision(shot, ship)
        })
    })
}
function paintStars(stars:star[]) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    stars.forEach((star:star):void=> {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size / 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    })
}

function drawShip(x, y) {
    ctx.drawImage(spaceShip, x, y);
}


function drawMyShots(shots, enemies) {
    ctx.fillStyle = '#B8860B';
    shots.forEach((shot:any, i:number)=> {
        for (let enemy of enemies) {
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
    enemies.forEach((enemy:any)=> {
        enemy.y += 5;
        if (!enemy.isDead) {
            ctx.drawImage(alien, enemy.x, enemy.y);
        }
        enemy.shots.forEach((shot:any)=> {
            shot.y += SHOTING_SPEED;
            ctx.drawImage(alien_missle, shot.x, shot.y);
        })
    })
}

function drawScores(score) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`Score: ${score}`, 40, 43)
}

/** stream of stars*/
var StarsStream = Rx.Observable.range(1, STARS_NUM)
    .map(():star => {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 1
        }
    })
    .toArray()
    .flatMap((stars)=> {
        return Rx.Observable.timer(0, SPEED)
            .map(()=> {
                stars.forEach((star:star)=> {
                    star.y > canvas.height ? star.y = 0 : star.y += 3;
                });
                return stars
            })
    });

/** stream fo MyShip*/
let mouseMove = Rx.Observable.fromEvent(canvas, 'mousemove')
let MySpaceShip = mouseMove
    .map((e:MouseEvent):point=> {
        return {x: e.pageX - 32, y: PLAYER_POS}
    })
    .startWith({x: canvas.width / 2, y: PLAYER_POS})


let MyFire = Rx.Observable
    .fromEvent(canvas, 'click')
    .sample(200)
    .timestamp();


let MyShots = Rx.Observable
    .combineLatest(MySpaceShip, MyFire, (MySpaceShip, MyFire)=> {
        return {timestamp: MyFire.timestamp, x: MySpaceShip.x}
    })
    .distinctUntilChanged((shot) => {
        return shot.timestamp
    })
    .scan((shots, shot)=> {
        shots.push({x: shot.x + 16, y: PLAYER_POS});
        return shots;
    }, []);

/** stream fo Aliens*/
var Enemies = Rx.Observable.timer(0, ENEMY_RESP)
    .scan((enemies)=> {
        let enemy = {
            x: Math.random() * canvas.width,
            y: -30,
            shots: [],
            isDead: false
        };
        Rx.Observable.timer(0, ENEMY_SHOT_RESP).subscribe(()=> {
            if (!enemy.isDead) {
                enemy.shots.push({x: enemy.x+16, y: enemy.y})
            }
            enemy.shots.filter(isVisible);
        });
        enemies.push(enemy);
        return enemies.filter((enemy:any)=> {
            return !(enemy.isDead && !enemy.shots.length && !isVisible(enemy))
        });
    }, []);


/** stream of scores*/
let ScoreSubject = new Rx.Subject();
let Score = ScoreSubject.scan((prev:number, cur:number)=> {
    return prev + cur;
}, 0).concat(Rx.Observable.return(0));
let currentScore = 0;
Score.subscribe((score)=> {
    currentScore = score;
});


/** stream of full Game*/
var Game = Rx.Observable.combineLatest(StarsStream, MySpaceShip, MyShots, Enemies, (stars, mySpaceShip, myShots, enemies)=> {
        return {
            stars: stars,
            mySpaceShip: mySpaceShip,
            myShots: myShots,
            enemies: enemies,
        };
    })
    .sample(40)
    .takeWhile((items)=> {
        return !gameOver(items.mySpaceShip, items.enemies)
    });

Game.subscribe((items)=> {
    let {stars, mySpaceShip, myShots, enemies}=items;
    paintStars(stars);
    drawShip(mySpaceShip.x, mySpaceShip.y);
    drawMyShots(myShots, enemies);
    drawEnemies(enemies);
    drawScores(currentScore)
});

/**  init first value in shot's stream*/
canvas.click();
