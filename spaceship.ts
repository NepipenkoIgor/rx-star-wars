/**
 * Created by igor on 1/29/16.
 */

/// <reference path="./typings/tsd.d.ts" />

type star={x:number,y:number,size:number,opacity?:number};
type point={x:number,y:number,type?:any};

/** init canvas*/
let canvas:HTMLCanvasElement = document.createElement('canvas');
let ctx:CanvasRenderingContext2D = canvas.getContext('2d');
document.body.innerHTML='';
document.body.appendChild(canvas);
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

/** init ships and missels*/
let spaceShip = new Image();
spaceShip.src = "images/my_ship.png";

let my_missle = new Image();
my_missle.src = "images/my_missle.png";

let alien_icon= new Image();
alien_icon.src="images/alien_icon.png";

let aliens = [];

let alien1 = new Image();
alien1.src = "images/alien-ship1.png";
aliens.push(alien1)

let alien2 = new Image();
alien2.src = "images/alien-ship2.png";
aliens.push(alien2)

let alien3 = new Image();
alien3.src = "images/alien-ship3.png";
aliens.push(alien3)

let alien4 = new Image();
alien4.src = "images/alien-ship4.png";
aliens.push(alien4)

let alien5 = new Image();
alien5.src = "images/alien-ship5.png";
aliens.push(alien5)

let alien_missle = new Image();
alien_missle.src = "images/alien_missle.png";

let spaceObjects=[];

let spaceObj1 = new Image();
spaceObj1.src = "images/sun.png";
spaceObjects.push(spaceObj1)

let spaceObj2 = new Image();
spaceObj2.src = "images/sputnik.png";
spaceObjects.push(spaceObj2)

let spaceObj3 = new Image();
spaceObj3.src = "images/saturn.png";
spaceObjects.push(spaceObj3)

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
    return obj.x > -obj.type.naturalWidth && obj.x < canvas.width + obj.type.naturalWidth &&
        obj.y > -obj.type.naturalHeight && obj.y < canvas.height + obj.type.naturalHeight
}

function collision(target1, target2) {
    return (target1.x + target1.type.naturalWidth / 2 > target2.x &&
        target1.x + target1.type.naturalWidth / 2 < target2.x + target2.type.naturalWidth) &&
        (target1.y - target1.type.naturalHeight / 2 > target2.y - target2.type.naturalHeight / 2 &&
        target1.y - target1.type.naturalHeight / 2 < target2.y + target2.type.naturalHeight / 2)
}
function gameOver(ship, enemies) {
    return enemies.some((enemy:any)=> {
        if (collision(ship, enemy)) {
            return true;
        }
        return enemy.shots.some((shot)=> {
            return collision(shot, ship)
        })
    })
}
function paintStars(stars:star[]) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#01162f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    stars.forEach((star:star):void=> {
        //ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size / 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    })
}

function drawShip(x, y) {
    ctx.drawImage(spaceShip, x, y);
}





function drawEnemies(enemies) {
    enemies.forEach((enemy:any)=> {
        enemy.y += 5;
        if (!enemy.isDead) {
            ctx.drawImage(enemy.type, enemy.x, enemy.y);
        }
        enemy.shots.forEach((shot:any)=> {
            shot.y += SHOTING_SPEED;
            ctx.drawImage(alien_missle, shot.x, shot.y);
        })
    })
}

function drawScores(score) {
    ctx.drawImage(alien_icon, 5, 5);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`Score: ${score}`, 40, 43)
}
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function startGame(){
    /** stream of stars*/
    let StarsStream = Rx.Observable.range(1, STARS_NUM)
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
                        star.opacity=getRandomArbitrary(0,1)
                    });
                    return stars
                })
        });


    /** stream fo MyShip*/
    let mouseMove = Rx.Observable.fromEvent(canvas, 'mousemove')
    let MySpaceShip = mouseMove
        .map((e:MouseEvent):point=> {
            return {x: e.pageX - 32, y: PLAYER_POS, type: spaceShip}
        })
        .startWith({x: canvas.width / 2, y: PLAYER_POS, type: spaceShip})


    let MyFire = Rx.Observable
        .fromEvent(canvas, 'click')
        .timestamp();


    let MyShots = Rx.Observable
        .combineLatest(MySpaceShip, MyFire, (MySpaceShip, MyFire)=> {
            return {timestamp: MyFire.timestamp, x: MySpaceShip.x}
        })
        .distinctUntilChanged((shot) => {
            return shot.timestamp
        })
        .scan((shots, shot)=> {
            shots.push({
                x: shot.x + spaceShip.naturalWidth / 2 - my_missle.naturalWidth / 2,
                y: PLAYER_POS,
                type: my_missle,
            });
            return shots;
        }, []);

    /** stream fo Aliens*/
    let Enemies = Rx.Observable.timer(0, ENEMY_RESP)
        .scan((enemies)=> {
            let index = Math.floor(Math.random() * aliens.length);
            let alien = aliens[index];
            let enemy = {
                x: Math.random() * (canvas.width - alien.naturalWidth),
                y: -30,
                shots: [],
                isDead: false,
                type: alien
            };

            Rx.Observable.timer(0, ENEMY_SHOT_RESP).subscribe(()=> {
                if (!enemy.isDead) {
                    enemy.shots.push({
                        x: enemy.x + enemy.type.naturalWidth / 2 - alien_missle.naturalWidth / 2,
                        y: enemy.y + enemy.type.naturalHeight,
                        type: alien_missle
                    })
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
    let Game = Rx.Observable.combineLatest(StarsStream, MySpaceShip, MyShots, Enemies, (stars, mySpaceShip, myShots, enemies)=> {
            return {
                stars: stars,
                mySpaceShip: mySpaceShip,
                myShots: myShots,
                enemies: enemies,
            };
        })
        .sample(40)
        .takeWhile((items)=> {
            if(!gameOver(items.mySpaceShip, items.enemies)){
               return true;
            }
            //ctx.clearRect(0, 0, canvas.width, canvas.height);
            setTimeout(startGame,2000);
        });

    Game.subscribe((items)=> {
        window.requestAnimationFrame(()=>{
            let {stars, mySpaceShip, myShots, enemies}=items;
            paintStars(stars);
            drawShip(mySpaceShip.x, mySpaceShip.y);
            drawMyShots(myShots, enemies);
            drawEnemies(enemies);
            drawScores(currentScore)
        })
    });
    function drawMyShots(shots, enemies) {
        ctx.fillStyle = '#B8860B';
        let shoot_indexses = [];
        shots.forEach((shot:any, i:number)=> {
            for (let enemy of enemies) {
                if (!i) {
                    return;
                }
                if (!enemy.isDead && collision(shot, enemy)) {
                    ScoreSubject.onNext(SCORE_INC);
                    enemy.isDead = true;
                    enemy.x = enemy.y = -1000;
                    shoot_indexses.push(i)
                    break;
                }
            }
            shot.y -= SHOTING_SPEED;
            ctx.drawImage(my_missle, shot.x, shot.y);
        });
        shoot_indexses.forEach((index, i)=> {
            shots.splice(index - i, 1)
        })
    }
    /**  init first value in shot's stream*/
    canvas.click();
}
startGame()
