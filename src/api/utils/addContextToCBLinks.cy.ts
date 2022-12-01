import addContextToCBLinks from './addContextToCBLinks';

const sampleText = `<span class="wikIContent"><p>This is a ref to <img src="/cb/images/issuetypes/user.gif" data-hover-tooltip-target="" class="customizable-tracker-icon" style="background-color:#5f5f5f; margin-right:2px;"><a class="interwikilink" href="/cb/userdata/55" title="[USER:2222]>pjotr</a>, one of our users.</p></span>`;

describe('addContextToCBLinks', () => {
	it('replaces relative- with absolute path to codebeamer resources', () => {
		const mockCbAddress = 'https://mockbeamer.com/cb';

		const expectedResult = `<span class="wikIContent"><p>This is a ref to <img src="${mockCbAddress}/images/issuetypes/user.gif" data-hover-tooltip-target="" class="customizable-tracker-icon" style="background-color:#5f5f5f; margin-right:2px;"><a target="_blank" class="interwikilink" href="${mockCbAddress}/userdata/55" title="[USER:2222]>pjotr</a>, one of our users.</p></span>`;

		const result = addContextToCBLinks(mockCbAddress, sampleText);

		expect(result).to.equal(expectedResult);
	});
});
