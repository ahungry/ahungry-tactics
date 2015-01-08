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

var big_card_hide = null;
function show_big_card(c) {
    $('#big-card').attr({'src':$(c).attr('src')});
    $('#big-card').fadeIn(500);
    clearTimeout(big_card_hide);
    big_card_hide = setTimeout(function() { $('#big-card').fadeOut(500); }, 5000);
}

function menu_roller() {
    if($('.menu-roller').css('display') == 'block') {
	$('.mm-navi').hide();
	$('#hide-mm-2').hide();
	$('#unit-name').hide();
	$('.unit-portrait').hide();
	$('.menu-roller').slideUp(300);
	$('#main-menu').animate({
	    'bottom':'0px',
	    'height':'130px',
	    'font-size':'12px',
	    'left':'0px',
	    'padding':'4px',
	    'width':'500px'
	});
	$('#chat-log').css({'height':'90px'});
	$('#hide-mm').html('+');
	$('#hide-mm').css({'font-size':'20px', 'margin-top':'0px'});
    } else {
	$('.mm-navi').show();
	$('#hide-mm-2').show();
	$('#unit-name').show();
	$('.unit-portrait').show();
	$('.menu-roller').slideDown(300);
	$('#main-menu').animate({
	    'bottom':'0%',
	    'height':'100%',
	    'font-size':'14px',
	    'left':'0%',
	    'padding':'0px',
	    'width':'100%'
	});
	$('#chat-log').css({'height':'190px'});
	$('#hide-mm').html('-');
	$('#hide-mm').css({'font-size':'90px', 'margin-top':'-60px'});
    }
}

$(document).ready(function() {
    $('body').click(function() {
	$('#big-card').fadeOut(500);
	$('#player-list').fadeOut(300);
    });
    $('.expand').click(function() {
	$(this).parent().find('.more').slideToggle();
	return false;
    });
    $('.showme').parent().find('.more').slideDown();
    $('.card').hover(function() { 
	show_big_card(this);
    }, function() {
	$('#big-card').fadeOut(500);
    });
    $('.mm-navi').click(function() {
	var target = $(this).attr('href');
	$('.mm-toggle').removeClass('active').hide();
	$('#main-menu-menu a').removeClass('active');
	$(target).addClass('active').show();
	$(this).addClass('active').show();
	return false;
    });
    $('#hide-mm, #hide-mm-2').click(function() {
	pause_animation = ~pause_animation;
	menu_roller();
	return false;
    });
});
