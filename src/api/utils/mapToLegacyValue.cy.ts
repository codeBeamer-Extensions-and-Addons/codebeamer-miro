import mapToLegacyValue from './mapToLegacyValue';

describe('mapToLegacyValue', () => {
	it('maps a given value to a legacy api update-item-call compatible value', () => {
		const clutteredData = {
			id: 12423,
			name: 'Testerinho',
			type: 'TrackerItemReference',
			email: 'this@that.anduh',
			referenceData: [{ some: 'value' }],
		};

		const expected = {
			uri: `/item/${clutteredData.id}`,
			name: clutteredData.name,
		};

		const actual = mapToLegacyValue(clutteredData);

		expect(actual.name).to.equal(expected.name);
		expect(actual.uri).to.equal(expected.uri);
	});

	it('returns a value that already specifies a uri with proper values', () => {
		const clutteredData = {
			id: 12423,
			name: 'Testerinho',
			uri: '/item/12423',
			type: 'TrackerItemReference',
			email: 'this@that.anduh',
			referenceData: [{ some: 'value' }],
		};

		const expected = {
			uri: clutteredData.uri,
			name: clutteredData.name,
		};

		const actual = mapToLegacyValue(clutteredData);

		expect(actual.name).to.equal(expected.name);
		expect(actual.uri).to.equal(expected.uri);
	});
});
