import getRestResourceUri from './getRestResourceUri';

describe('getRestResourceUri', () => {
	it('returns the rest resource uri for an entity', () => {
		const id = 124;
		const type = 'item';
		const expectedResult = `/${type}/${id}`;

		const actual = getRestResourceUri(id, type);

		expect(actual).to.equal(expectedResult);
	});

	it('returns the correct rest resource uri for an entity of type TrackerItemReference', () => {
		const id = 19567524;
		const type = 'TrackerItemReference';
		const expectedResult = `/item/${id}`;

		const actual = getRestResourceUri(id, type);

		expect(actual).to.equal(expectedResult);
	});
});
