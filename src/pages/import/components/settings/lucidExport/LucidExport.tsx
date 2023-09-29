import React, { useState } from 'react';
import { useImportedItems } from '../../../../../hooks/useImportedItems';

import FileSaver from 'file-saver';

interface CompressedItem {
	id: string;
	coordinates: {
		x: number;
		y: number;
	};
}

export default function LucidExport() {
	const importedItems = useImportedItems();

	const [isLoading, setIsLoading] = useState(false);
	const [animateSuccess, setAnimateSuccess] = useState(false);
	const [exported, setExported] = useState(false);

	const showSuccessAnimation = () => {
		setAnimateSuccess(true);
		setTimeout(() => {
			setAnimateSuccess(false);
		}, 3500);
	};

	const generateLucidExportJSON = () => {
		if (!importedItems?.length) {
			console.warn('No codebeamer-cards found on the board');
			return;
		}

		setIsLoading(true);

		const compressedItems = importedItems.map((i) => {
			return {
				id: i.itemId,
				coordinates: {
					x: i.coordinates?.x ?? 0,
					y: i.coordinates?.y ?? 0,
				},
			};
		});

		const blob = new Blob([JSON.stringify(compressedItems)], {
			type: 'application/json',
		});
        FileSaver.saveAs(blob, `miro-export-${new Date().toISOString().substring(0,10)}.json`, { autoBom: false });

		showSuccessAnimation();
		setIsLoading(false);
		setExported(true);
	};

	return (
		<div className="centered">
			{!animateSuccess && (
				<button
					onClick={generateLucidExportJSON}
					disabled={isLoading}
					className={`mt-3 fade-in button button-primary ${
						isLoading ? 'button-loading' : ''
					}`}
					data-test="submit"
				>
					Export
				</button>
			)}
			{animateSuccess && (
				<span>
					<svg
						className="checkmark"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 52 52"
					>
						<circle
							className="checkmark__circle"
							cx="26"
							cy="26"
							r="25"
							fill="none"
						/>
						<path
							className="checkmark__check"
							fill="none"
							d="M14.1 27.2l7.1 7.2 16.7-16.8"
						/>
					</svg>
				</span>
			)}
			<p className="mt-3" style={{ width: '150%', textAlign: 'center' }}>
				{exported ? (
					<span className="fade-in">
						Thanks for using codebeamer-cards for Miro! <br />
						We hope you'll enjoy using{' '}
						<a href="https://github.com/codeBeamer-Extensions-and-Addons/codebeamer-lucidspark/wiki">
							codebeamer-cards for Lucidspark
						</a>{' '}
						as well.
					</span>
				) : (
					<span>
						Want to migrate your imported cards from Miro to
						Lucidspark? Click the above button to generate a{' '}
						<em>json</em> file that you can then import with{' '}
						<a href="https://github.com/codeBeamer-Extensions-and-Addons/codebeamer-lucidspark/wiki">
							codebeamer-cards for Lucidspark
						</a>
						.
					</span>
				)}
			</p>
		</div>
	);
}
