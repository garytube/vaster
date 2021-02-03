import { NowRequest, NowResponse } from '@vercel/node';
import fetch from 'node-fetch';
import xml2js from 'xml2js';
const parser = new xml2js.Parser({
	// trim: true,
	mergeAttrs: true,
	normalizeTags: true,
	normalize: true
});

module.exports = async (req: NowRequest, res: NowResponse) => {
	const target = req.query.target as string;

	if (!target) {
		return res.send('missing target &target');
	}

	console.log(target);

	// // fetch XML
	try {
		const scrape = await fetch(target);
		const xmlData = await scrape.text();

		if (xmlData) {
			const data = await parser.parseStringPromise(xmlData);
			const mediaFile = data.vast.ad[0].inline[0].creatives[0].creative[0].linear[0].mediafiles[0].mediafile[0];

			if (mediaFile) {
				const fileURL = mediaFile._;
				res.redirect(303, fileURL);
			} else {
				res.status(404).send('no media file url was found');
			}
		} else {
			res.status(404).send('noting found in that xml');
		}
	} catch (error) {
		res.status(500).json(JSON.stringify(error));
	}
};
