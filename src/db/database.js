const mariadb = require('mariadb');
const pool = mariadb.createPool({
	host: 'localhost',
    port: 3806,
	user: 'root',
	password: 'root',
	database: 'chameleon',
	connectionLimit: 10,
    allowPublicKeyRetrieval: true,
});

const emptyOrRow = async (rows) => {
	if (!rows) {
		return [];
	}
	return rows;
};

const query = async (sql, params) => {
    // let sqlConnection = undefined;
	// let results = [];

	try {
		let sqlConnection = await pool.getConnection();
		try {
			let results = await sqlConnection.query(sql, params);
			return results;
		} catch (err) {
			console.error(err);
			throw err;
		} finally {
			if (sqlConnection) return sqlConnection.end();
		}
	} catch (error) {
		console.log(error);
	}

	
};

module.exports = {
    query,
    emptyOrRow,
    pool
}
