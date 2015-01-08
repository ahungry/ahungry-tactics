;; Ahungry Tactics - Free as in Freedom multiplayer tactics/TCG game
;; Copyright (C) 2013 Matthew Carter
;; 
;; This program is free software: you can redistribute it and/or modify
;; it under the terms of the GNU Affero General Public License as published by
;; the Free Software Foundation, either version 3 of the License, or
;; (at your option) any later version.
;; 
;; This program is distributed in the hope that it will be useful,
;; but WITHOUT ANY WARRANTY; without even the implied warranty of
;; MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
;; GNU Affero General Public License for more details.
;; 
;; You should have received a copy of the GNU Affero General Public License
;; along with this program.  If not, see <http://www.gnu.org/licenses/>.

;; Quick and dirty way to allow socket.io javascript to call
;; on different lisp functions and move data around via JSON

(defpackage :ahungry-tactics
  (:use :cl :jsown :clsql :cl-ppcre)
  (:export :join-game :set-action :request-cards :request-signin
	   :request-change-job :request-hand :request-chat :request-chat
	   :request-give-card :request-jobs :request-deck :zone-change))
