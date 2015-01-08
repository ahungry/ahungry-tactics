/**
 * Ahungry Tactics - Free as in Freedom multiplayer tactics/TCG game
 * Copyright (C) 2013 Matthew Carter
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

//Vars
//Canvas
var tcan, can, ctx, events;

//initialize
function init() {
    tcan = document.getElementById('tcan');
    if(tcan == null) return;

    can = document.createElement('canvas');
    tcan.appendChild(can);
    can.width = 600;
    can.height = 600;
    can.style.background = '#fff';

    ctx = can.getContext('2d');
    draw();
    window.requestAnimFrame(animator);
    $animate.add_unit(1);
}

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();

var last_now;
function animator(now) {
    TRUE_FPS = 1000 / (now - last_now);
    last_now = now;
    window.requestAnimFrame(animator);
    draw();
}

function draw() {
    //Clear
    ctx.clearRect(0, 0, 600, 600);

    var guy = $animate.get_unit(1);
    if(typeof(guy) != 'undefined') {
    var unit_img = new Image();
    unit_img.src = '/img/units/peasant_sheet.png';
    $animate.set_state(1, 'walk');
    if(guy.flip == true) ctx.scale(-1, 1);
    ctx.drawImage(unit_img, guy.sx, guy.sy, guy.sw, guy.sh, 0, 0, 100, 100);
    if(guy.flip == true) ctx.scale(-1, 1);
    }
}


window.onload=init;
