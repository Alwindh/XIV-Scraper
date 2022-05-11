const router = require("express").Router();
let Listing = require("../models/listing.model");
let Tally = require("../models/tally.model");

router.route("/get").get((req, res) => {
	Listing.find()
		.then((listingResult) => res.json(listingResult))
		.catch((err) => res.status(400).json("Error: " + err));
});

router.route("/add/many").post((req, res) => {
	if (!req.body.length || req.body.length <= 0) {
		res.status(400).json("Post request body must be list");
	}
	const listings = req.body;
	let addedListings = [];
	let errorListings = [];
	let duplicateListings = [];
	let iterationPromise = new Promise((resolve, reject) => {
		listings.forEach((element, index, array) => {
			const itemId = element.itemID;
			const lastUploadTime = element.lastUploadTime;
			const worldId = element.worldID;
			const _id = `${itemId}-${lastUploadTime}-${worldId}`;
			const newListing = new Listing({
				_id,
				itemId,
				lastUploadTime,
				worldId,
			});
			newListing
				.save()
				.then((newListing) => {
					addedListings.push(newListing);
					Tally.findOneAndUpdate(
						{ _id: itemId },
						{ $set: { _id: itemId, itemId: itemId, worldId: worldId }, $inc: { amount: 1 } },
						{ new: true, upsert: true }
					)
						.then(() => {
							if (index === array.length - 1) resolve();
						})
						.catch((err) => {
							if (index === array.length - 1) resolve();
						});
				})
				.catch((err) => {
					if (err.keyValue) {
						duplicateListings.push(newListing);
					} else {
						errorListings.push({ listing: newListing, error: err });
					}
					if (index === array.length - 1) resolve();
				});
		});
	});
	iterationPromise.then(() => {
		console.log("Finished processing " + req.body.length + " requests");
		if (errorListings.length === 0 && addedListings.length > 0) {
			console.log("Finished with status code 201");
			res.status(201).json(addedListings);
		} else if (errorListings.length === 0 && addedListings.length <= 0) {
			console.log("Finished with status code 200");

			res.status(200).json(duplicateListings);
		} else {
			console.log("Finished with status code 400");

			res.status(400).json(errorListings);
		}
	});
});

module.exports = router;
