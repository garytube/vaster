import { NowRequest, NowResponse } from '@vercel/node';
import fetch from 'node-fetch';
import xml2js from 'xml2js';
import https from 'https';
import url, { URL } from 'url';
// import http from 'http'
const parser = new xml2js.Parser({
	// trim: true,
	mergeAttrs: true,
	normalizeTags: true,
	normalize: true
});

module.exports = async (req: NowRequest, res: NowResponse) => {
	const target = req.query.target as string;

	if (!target) throw new Error('missing target parameter &target');

	try {
		// 1 ) FETCH XML and scrape content
		const scrapeResponse = await fetch(target);
		const xmlData = await scrapeResponse.text();

		if (!xmlData) throw new Error('no_valid_xml');

		// parse XML and LOOK for Media FIle
		const data = await parser.parseStringPromise(xmlData);
		const mediaFile = data.vast.ad[0].inline[0].creatives[0].creative[0].linear[0].mediafiles[0].mediafile[0];

		if (!mediaFile) throw new Error('no_valid_media_file_in_xml');

		const fileURL = mediaFile._; // media file link
		const fileName = new URL(fileURL).pathname.split('/').pop();

		return res.send(fileURL);
	} catch (error) {
		// todo - add sentry
		console.error('🤐 ' + error);
		res.status(500).json({ error: error.message || 'upsi' });
	}
};
