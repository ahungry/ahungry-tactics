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

;; put in this crap for centos fix
(push #P"/usr/lib/mysql" CLSQL-SYS:*FOREIGN-LIBRARY-SEARCH-PATHS*)
(clsql:push-library-path "/usr/lib64/mysql/")
(uffi:load-foreign-library "/usr/lib64/mysql/libmysqlclient.so.16")
