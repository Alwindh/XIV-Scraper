const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ListingSchema = new Schema(
	{
		_id: { type: String, required: true },
		itemId: { type: Number, required: true },
		lastUploadTime: { type: Number, required: true },
		worldId: { type: Number, required: true },
	},
	{
		timestamps: true,
	}
);

const Listing = mongoose.model("listing", ListingSchema);

module.exports = Listing;
