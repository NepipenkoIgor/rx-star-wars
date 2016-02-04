/**
 * Created by igor on 1/29/16.
 */

/*улучшить !!!!*/

/// <reference path="./typings/tsd.d.ts" />

type star={x:number,y:number,size:number,opacity?:number};
type point={x:number,y:number,type?:any,isDead?:any};

/** init canvas*/
let canvasBack:HTMLCanvasElement = <HTMLCanvasElement>document.querySelector('#arena_background');
let ctxBack:CanvasRenderingContext2D = canvasBack.getContext('2d');
canvasBack.height = window.innerHeight;
canvasBack.width = window.innerWidth;

let canvasPlanets:HTMLCanvasElement = <HTMLCanvasElement>document.querySelector('#arena_planets');
let ctxPlanets:CanvasRenderingContext2D = canvasPlanets.getContext('2d');
canvasPlanets.height = window.innerHeight;
canvasPlanets.width = window.innerWidth;


let canvas:HTMLCanvasElement = <HTMLCanvasElement>document.querySelector('#arena');
let ctx:CanvasRenderingContext2D = canvas.getContext('2d');
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;


/** init ships and missels*/
let boom = new Image();
boom.src = "images/boom.png";

let spaceShip = new Image();
spaceShip.src = "images/my_ship.png";

let my_missle = new Image();
my_missle.src = "images/my_missle.png";


let alien_icon = new Image();
alien_icon.src = "images/alien_icon.png";

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

let spaceObjects = [];

let spaceObj1 = new Image();
spaceObj1.src = "images/sun.png";
spaceObjects.push(spaceObj1)

let spaceObj2 = new Image();
spaceObj2.src = "images/sputnik.png";
spaceObjects.push(spaceObj2)

let spaceObj3 = new Image();
spaceObj3.src = "images/saturn.png";
spaceObjects.push(spaceObj3)

let spaceObj4 = new Image();
spaceObj4.src = "images/meteor1.png";
spaceObjects.push(spaceObj4)

let spaceObj5 = new Image();
spaceObj5.src = "images/meteor2.png";
spaceObjects.push(spaceObj5)

let spaceObj6 = new Image();
spaceObj6.src = "images/meteor3.png";
spaceObjects.push(spaceObj6)

/** init consts*/
const SPEED:number = 40;
const STARS_NUM:number = 250;
const PLAYER_POS:number = canvas.height - 100;
const ENEMY_RESP:number = 1500;
const ENEMY_SHOT_RESP:number = 750;
const SHOTING_SPEED:number = 10;
const SCORE_INC:number = 10;
const ALIEN_SPEED:number = 3;
/** util game functions*/
function isVisible(obj) {
    return obj.x > -obj.type.naturalWidth && obj.x < canvas.width + obj.type.naturalWidth &&
        obj.y > -obj.type.naturalHeight && obj.y < canvas.height + obj.type.naturalHeight
}

function collision(target1, target2) {
    return ((target1.x > target2.x ) &&
        (target1.x < target2.x + target2.type.naturalWidth)) &&
        ((target1.y > target2.y) &&
        (target1.y + target1.type.naturalHeight ) < (target2.y + target2.type.naturalHeight) )
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
    ctxBack.fillStyle = '#01162f';
    ctxBack.fillRect(0, 0, canvas.width, canvas.height);
    ctxBack.fillStyle = '#ffffff';
    ctxBack.beginPath();
    stars.forEach((star:star):void=> {
        ctxBack.moveTo(star.x, star.y);
        ctxBack.arc(star.x, star.y, star.size / 2, 0, 2 * Math.PI);
    })
    ctxBack.stroke();
    ctxBack.fill();
}
function pointSpaceObject(spaceObject) {
    ctxPlanets.clearRect(spaceObject.x, spaceObject.y, spaceObject.type.naturalWidth, spaceObject.type.naturalHeight);
    spaceObject.y += 1;
    if (spaceObject.y > canvas.height) {
        spaceObject.y = 0;
    }
    ctxPlanets.drawImage(spaceObject.type, spaceObject.x, spaceObject.y);
    window.requestAnimationFrame(()=> {
        pointSpaceObject(spaceObject);
    })
}

function drawShip(ship) {
    ctx.clearRect(ship.oldX, ship.y, ship.type.naturalWidth, ship.type.naturalHeight);
    ctx.drawImage(spaceShip, ship.x, ship.y);
}


function drawEnemies(enemies, mySpaceShip) {
    enemies.forEach((enemy:any, i)=> {
        if (enemy.isDraw) {
            return;
        }
        enemy.isDraw = true;
        drawEnemy(enemy, mySpaceShip)
    })
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
        })
    }
    enemy.shotsCount++;
    if (enemy.y > canvas.height) {
        ctx.clearRect(enemy.x, enemy.y, enemy.type.naturalWidth, enemy.type.naturalHeight)
        enemy.isDead = true;
        return;
    }
    if (enemy.isDead && !enemy.boom) {
        ctx.clearRect(enemy.x, enemy.y, enemy.type.naturalWidth, enemy.type.naturalHeight)
        enemy.boom = true;
        ctx.drawImage(boom, enemy.x, enemy.y);
        setTimeout(()=> {
            ctx.clearRect(enemy.x, enemy.y, boom.naturalWidth, boom.naturalHeight)
        }, 60)
    }
    if (!enemy.isDead) {
        ctx.clearRect(enemy.x, enemy.y, enemy.type.naturalWidth, enemy.type.naturalHeight)
        enemy.y += ALIEN_SPEED;
        ctx.drawImage(enemy.type, enemy.x, enemy.y);
    }
    enemy.shots.forEach((shot:any)=> {
        if (collision(shot, mySpaceShip)) {
            mySpaceShip.isDead = true;
        }
        ctx.clearRect(shot.x, shot.y, shot.type.naturalWidth, shot.type.naturalHeight)
        shot.y += SHOTING_SPEED;
        ctx.drawImage(alien_missle, shot.x, shot.y);
    });
    window.requestAnimationFrame(()=> {
        drawEnemy(enemy, mySpaceShip)
    })
}

function drawScores(score) {
    ctx.clearRect(0, 0, 400, 100);
    ctx.drawImage(alien_icon, 5, 5);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    let txt = `Score: ${score}`
    ctx.fillText(txt, 40, 43)
}
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
                });
                return stars
            })
    });

StarsStream.subscribe((stars)=> {
    paintStars(stars);
});

let SpaceObjectsStream = Rx.Observable.from(spaceObjects)
    .map((spaceObject,i):any => {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            type: spaceObjects[i]
        }
    })

SpaceObjectsStream.subscribe((spaceObject)=>{
    pointSpaceObject(spaceObject)
})


function startGame() {

    let myStartPosition = {x: canvas.width / 2, y: PLAYER_POS, type: spaceShip, oldX: canvas.width / 2}
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
    let mouseMove = Rx.Observable.fromEvent(canvas, 'mousemove')
    let MySpaceShip = mouseMove
        .map((e:MouseEvent):point=> {
            myStartPosition.oldX = myStartPosition.x;
            myStartPosition.x = e.pageX - spaceShip.naturalWidth / 2
            return myStartPosition
        })
        .startWith(myStartPosition)


    let MyFire = Rx.Observable
        .fromEvent(canvas, 'mousedown')
        .timestamp()
        .debounce(60);


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
                y: PLAYER_POS - spaceShip.naturalHeight / 2,
                type: my_missle,
            });
            return shots.filter(isVisible);
        }, []);

    var MySpaceShipSub = MySpaceShip.subscribe((ship)=> {
        drawShip(ship)
    });

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
            enemies.push(enemy);
            return enemies.filter((enemy:any)=> {
                return !(enemy.isDead || !isVisible(enemy)) || enemy.shots.length;
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


    let Game = Rx.Observable.combineLatest(MySpaceShip, MyShots, Enemies, (mySpaceShip, myShots, enemies)=> {
            return {
                myShots: myShots,
                enemies: enemies,
                mySpaceShip: mySpaceShip
            };
        })
        .sample(20)
        .takeWhile((items)=> {
            if (!items.mySpaceShip.isDead) {
                return true;
            }
            console.log('Game Over');
            items.enemies.forEach((enemy:any)=> {
                enemy.stop = true;
            });
            items.myShots.forEach((shot:any)=> {
                shot.stop = true;
            });
            MySpaceShipSub.dispose();
            ctx.clearRect(items.mySpaceShip.x,
                items.mySpaceShip.y,
                items.mySpaceShip.type.naturalWidth,
                items.mySpaceShip.type.naturalHeight);
            ctx.drawImage(boom, items.mySpaceShip.x, items.mySpaceShip.y)
        });

    Game.subscribe((items)=> {
        let {mySpaceShip, myShots, enemies}=items;
        drawEnemies(enemies, mySpaceShip);
        drawMyShots(myShots, enemies);
        //drawEnemies(enemies);
        drawScores(currentScore)
        //drawShip(mySpaceShip);
    });
    function drawMyShots(shots, enemies) {
        shots.forEach((shot:any, i)=> {
            if (shot.isDraw) {
                return;
            }
            shot.isDraw = true;
            drawShot(shot, enemies)
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

        for (let enemy of enemies) {
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
        window.requestAnimationFrame(()=> {
            drawShot(shot, enemies)
        })
    }

    /**  init first value in shot's stream*/
    //var clickEvent = document.createEvent('MouseEvents');
    //clickEvent.initEvent('mousedown', true, true);
    //canvas.dispatchEvent(clickEvent);
}
startGame()