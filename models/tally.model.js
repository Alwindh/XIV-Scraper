const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TallySchema = new Schema(
	{
		_id: { type: Number, required: true },
		itemId: { type: Number, required: true },
		itemName: { type: String, required: true },
		amount: { type: Number, required: true },
	},
	{
		timestamps: true,
	}
);

const Tally = mongoose.model("tally", TallySchema);

module.exports = Tally;
