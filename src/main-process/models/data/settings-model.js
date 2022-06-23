const crypto = require('crypto');
const {DataTypes} = require('sequelize');
const {connectDatabase} = require('../../common/database');
const utils = require('../../common/utils');

const {sequelize} = connectDatabase();
const attributes = {
	cryptoIv: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	accessKeyId: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	secretAccessKey: {
		type: DataTypes.STRING,
		allowNull: true,
		get() {
			return utils.decrypt({
				value: Buffer.from(this.getDataValue('secretAccessKey'), 'base64'),
				iv: Buffer.from(this.getDataValue('cryptoIv'), 'base64'),
			}).toString();
		},
		set(value) {
			const iv = crypto.randomBytes(16);

			this.setDataValue('cryptoIv', iv.toString('base64'));
			this.setDataValue(
				'secretAccessKey',
				utils.encrypt({value: Buffer.from(value, 'utf8'), iv}).toString('base64'),
			);
		},
	},
	region: {
		type: DataTypes.STRING,
		allowNull: true,
	},
};
const options = {
	indexes: [],
};
const Model = sequelize.define('settings', attributes, options);

module.exports = Model;
