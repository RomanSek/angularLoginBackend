/**
 * Copyright (C) 2015 by Clearcode <http://clearcode.cc>
 * and associates (see AUTHORS).
 *
 * This file is part of [angularLoginBackend].
 *
 * [angularLoginBackend] is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * [angularLoginBackend] is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with [angularLoginBackend].  If not, see <http://www.gnu.org/licenses/>.
 */
(function() {
    'use strict';

    angular.module('ccMockE2E').factory('ccLoginBackend', ['$httpBackend', function($httpBackend) {
        var loginBackend = {
            _register: {},
            config: function(requestIdGetter, sessionGetter, responseOverride, sessionFactory) {
                this.requestIdGetter = requestIdGetter;
                this.responseOverride = responseOverride;
                this.sessionGetter = sessionGetter;
                this.sessionFactory = sessionFactory;
            },
            session: function(username) {
                var expectedHeaders = this._session(username);

                return function(headers) {
                    var result = true,
                        headerName;
                    for(headerName in expectedHeaders) {
                        if(expectedHeaders[headerName] !== headers[headerName]) {
                            result = false;
                            break;
                        }
                    }
                    return result;
                };
            },
            _session: function(username) {
                var session = this._register[username],
                    response;

                if(session) {
                    return this.sessionFactory(session);
                }

                throw new Error('Unexpected login "' + username + '"');
            },
            when: function(method, url, data, headers) {
                var username = this.requestIdGetter(method, url, data, headers),
                    that = this,
                    connection;

                connection = $httpBackend.when(method, url, data, headers);

                return {
                    respond: function(status, data, headers, statusText) {
                        that._register[username] = that.sessionGetter(status, data, headers, statusText);

                        return connection.respond.call(connection, status, data, headers, statusText);
                    }
                };
            }
        };

        return loginBackend;
    }]);
})();
