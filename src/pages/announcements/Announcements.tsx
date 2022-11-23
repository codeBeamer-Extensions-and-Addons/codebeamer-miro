import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setShowAnnouncements } from '../../store/slices/userSettingsSlice';

import './announcements.css';

/**
 * Container for (a) page(s) containing announcements.
 */
export default function Announcements() {
	const dispatch = useDispatch();

	const [dismissing, setDismissing] = useState(false);

	const dismiss = () => {
		setDismissing(true);
		setTimeout(() => {
			dispatch(setShowAnnouncements(false));
		}, 200);
	};

	return (
		<div
			className={`container centered-horizontally announcements ${
				dismissing ? 'shrink' : 'grow'
			}`}
			data-test="announcements"
		>
			<span className="close-button mb-3 clickable">
				<div
					onClick={() => dismiss()}
					className="icon icon-close clickable"
					data-test="close-announcements"
				></div>
			</span>
			<div className="mb-5">
				<h2 className="h2 text-center">
					<svg
						className="pos-adjusted-up wh-40p"
						enableBackground="new 0 0 256 256"
						version="1.1"
						viewBox="0 0 256 256"
						xmlns="http://www.w3.org/2000/svg"
						height="24"
						width="24"
					>
						<path
							d="m142.7 103.9c1.4 12.6 2.6 29.3 21.5 18.5 0.5-0.2 0.9-0.5 1.2-0.7 4.5-6.7-0.2-20.9 5.1-20 5.9 1-1.2 7.6 1.8 12.7 3.1-2.1 3.6-11 7.9-8.3 4.2 2.6-3.4 5.6-3.7 8.9 2.7 1.4 10.4-6 11.4-0.7 0.9 4-9.3 3.4-10.3 5.4 2.1 3.3 12.7 0.7 10.1 6-2.2 4.4-9.4-3.3-13.6-2 1.2 3.7 8.9 4.4 5.7 8-2.9 3.3-6.8-2.5-11.7-7.1-0.6 0.7-1.2 1.4-1.9 2.1-11.9 11.9-26 8.9-33.2-3.5-3.5-6-3.3-9.7-4.3-16.2-1.3 4-2.2 7.8-2.6 11.6-10.5 9.2-19.8 19.1-22.8 34.2 7-5.5 13.6-13.1 20.4-9.8 6.4 3.1 11.4 12.6 13.6 20.2 6.1-2.8 11.2-5.8 12.8-1.6 1.9 5.3-6.8 2.8-9.6 6.4 4 3.1 15.1-2.4 15.7 3.3 0.7 6.9-9.9-0.4-13.6 2.4 0.3 2.6 11.6 6.1 9.1 10.1-3.4 5.3-8.9-5.9-12.3-5.6-1.1 3.8 5.9 10.1 0.3 11.3-5.9 1.2-2.7-8.7-5.2-12.3-5.4 4.2-0.3 14.4-7.2 13.1-6-1.2 4-13.8 2.9-23-2.8-3.3-5.9-6.5-8.9-5.4-6.3 2.5-6.7 9.3-17.9 13.6 8.8 17 33.4 33.9 57.1 32.4 21.4-1.4 46-18.3 36.6-55.5-1.2-4.7-1-6.5 2.1-0.7 14.2 26.8-4.8 72.1-54.3 66.8-58.6-6.2-63.2-56.8-81.2-61.2-4-1-8.1 3.1-11.7 6.2 0.4 8.3 5.1 17.8-0.4 18.4-5.2 0.6-1-6.8-3.7-10.1-3.7 2.9-1.1 14.3-6.5 13.5-6.4-0.9 2.6-8.9 0.8-12.8-2.5-0.3-8.1 9.2-11.2 6-4.2-4.3 7.3-6.7 7.7-9.9-3.2-1.8-10.6 3.2-10.4-2.2 0.2-5.5 8.5-0.5 12.4-2-2.7-5.9-13.1-3.5-10.4-9.5 1.8-3.9 7.4 1.8 13.8 5.3 2-8.1 11.3-21.4 18-21.9 5.4-0.4 9.9 4.1 14.4 8.9-0.2-2.6-0.2-5.2-0.1-7.9 0.5-24.5 9.5-46.2 44.9-61.1 1.4-10.4-9.9-13.4-8-20.8 1.6-5.7 9.5-10.9 16.3-12.7-2.9-5.5-6.5-10.2-2.8-11.9 4.4-2 2.8 5.7 6.1 7.8 2.4-3.6-3-12.7 1.9-13.6 5.8-1 0.2 8.4 2.9 11.4 2.2-0.4 4.4-10.3 8-8.4 4.8 2.6-4.5 7.9-3.9 10.8 3.3 0.7 8.2-5.7 9.6-1 1.4 4.9-7.3 2.8-10.2 5.2 3.9 4.4 12.3-0.5 11.6 5.4-0.6 4.9-10.8-1.8-18.5-1.2-3.3 2.5-7.2 6.1-7 9.4 0.3 5 6.7 9 10.6 13.4 7.4-3.2 6.6-10.9 12-13.8 20-11 51.4 6.3 51.6 14.9 0.1 8.2-17.3 19.7-32.1 23.2-3.5 0.8-6.1-0.5-8.4-1.8-8.8-5.3-11.7 3.1-18.3 9.4"
							fill="#000"
						/>
					</svg>
					<span className="roche-primary">
						codebeamer-cards Version 1.1 Release
					</span>
				</h2>
				<p className="text-center">
					<b>
						Welcome to Version 1.1 of{' '}
						<span className="roche-primary">codebeamer-cards</span>{' '}
						!
					</b>
				</p>
				<p className="mt-5">
					This release adds the ability for you to{' '}
					<b>edit certain attributes</b> of your imported Items{' '}
					<b>right inside Miro</b>.
					<br />
					We've also fixed a few bugs along the way!
				</p>
				<p className="text-center roche-primary mt-3">
					See below to find out how it works!
				</p>
			</div>

			<div>
				<div className="text-center">
					<h5 className="h5 text-underline">Edit an Item</h5>
					<img
						src="/src/assets/images/announcements/v1-1-0_edit.gif"
						alt="Editing an item in-miro"
					/>
					<p className="mt-3">
						Open an Item's details-view by clicking the icon on its
						top right corner. (You may have to first click away the
						"connect" icon in the same place, which doesn't do
						anything on its own!)
					</p>
					<p>
						Then, change any of the following attributes, if your
						Item / Tracker supports them:
						<br />
						Assignee | Team | Version | Subject | Story Points
					</p>
					<p className="mt-3">
						<em>
							The updates you make will reflect on the Item's card
							and on codebeamer once you save.
						</em>
					</p>
				</div>
			</div>

			<div>
				<div className="text-center mt-5">
					<h5 className="h5 text-underline">
						Zoom to the edited Item
					</h5>
					<img
						src="/src/assets/images/announcements/v1-1-0_zoomToCard.gif"
						alt="Zoom to card"
					/>
					<p className="mt-3">
						In case you get lost among your imported cards while
						editing one - use the "zoom to card" button ("eye"-icon)
						in the panel header to get taken to it.
					</p>
				</div>
			</div>

			<div className="announcement-actions mt-5 text-center">
				<h6 className="h6">Additional resources</h6>
				<a
					href="https://github.com/codeBeamer-Extensions-and-Addons/codebeamer-miro/blob/master/CHANGELOG.md"
					target="_blank"
					className="roche-primary-light"
				>
					Detailed Changelog
				</a>{' '}
				|{' '}
				<a
					href="https://github.com/codeBeamer-Extensions-and-Addons/codebeamer-miro/blob/master/README.md"
					target="_blank"
					className="roche-primary-light"
				>
					Github Documentation
				</a>{' '}
				|{' '}
				<a
					href="https://retina.roche.com/cb/wiki/1420850"
					target="_blank"
					className="roche-primary-light"
				>
					Retina Documentation
				</a>
			</div>
			<div className="skip-button mt-3">
				<a
					className="roche-primary-light text-decoration-none clickable"
					onClick={() => dismiss()}
					data-test="skip-announcements"
				>
					To the app -&gt;
				</a>
			</div>
		</div>
	);
}
