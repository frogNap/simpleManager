(function() {

    'use strict';

    var q = require('q');

    module.exports = function(dbPool) {

        function queryFromPool(queryCallback) {
            var deferred = q.defer();

            dbPool.getConnection(function(connectionError, connection){

                if(connectionError) {

                    deferred.reject();
                } else {
                    queryCallback(deferred, connection);
                    connection.release();
                }
            });

            return deferred.promise;
        }

        return {
            getAll: function() {

                return queryFromPool(function(deferred, connection) {

                    connection.query('SELECT * FROM church', null, function(queryError, rows) {

                        if(queryError)
                            deferred.reject();
                        else
                            deferred.resolve(rows);
                    });
                });
            },
            add: function(newChurch) {

                return queryFromPool(function(deferred, connection) {

                    connection.query('INSERT INTO church (name, user_id, cnpj, address, city, state, zipcode, phone_number) ' +
                                        'VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [newChurch.name, newChurch.user_id || null, newChurch.cnpj, newChurch.address, newChurch.city,
                            newChurch.state, newChurch.zipcode || null, newChurch.phone_number], function(queryError, resultInfo) {

                            if(queryError)
                                deferred.reject();
                            else
                                deferred.resolve(resultInfo.insertId);
                        });
                });
            },
            getById: function(churchId) {

                return queryFromPool(function(deferred, connection) {

                    connection.query('SELECT * FROM church WHERE id = ?', [churchId], function(queryError, row) {

                        if(queryError)
                            deferred.reject();
                        else
                            deferred.resolve(row);
                    });
                });
            },
            update: function(churchId, updatedChurch) {

                return queryFromPool(function(deferred, connection) {

                    connection.query('UPDATE church SET name = ?, user_id = ?, cnpj = ?' +
                        ', address = ?, city = ?, state = ?, zipcode = ?, phone_number = ? WHERE id = ?',
                        [updatedChurch.name, updatedChurch.user_id || null, updatedChurch.cnpj,
                            updatedChurch.address, updatedChurch.city, updatedChurch.state, updatedChurch.zipcode || null,
                            updatedChurch.phone_number, churchId], function(queryError) {

                            if(queryError)
                                deferred.reject();
                            else
                                deferred.resolve();
                        });
                });
            },
            removeById: function(churchId) {

                return queryFromPool(function(deferred, connection) {

                    connection.query('DELETE FROM church WHERE id = ?', [churchId], function(queryError) {

                        if(queryError)
                            deferred.reject();
                        else
                            deferred.resolve();
                    });
                });
            }
        };
    };
})();