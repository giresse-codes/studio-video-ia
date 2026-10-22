import React from 'react';
import {atelierExtras} from '../../../theme';
import {StageSvg, Title, useScene} from '../atelier';

// 9. Question finale : « Tu charges où ? ».
export const Scene9Question: React.FC = () => {
	const {startMs, springAt, atFraction} = useScene();
	const bubble = springAt(atFraction(0.3));
	return (
		<>
			<Title text="Tu charges" atMs={startMs} y={60} size={120} />
			<Title text="où ?" atMs={startMs + 250} y={190} size={160} color="#FFFFFF" />
			<StageSvg>
				{/* Bulle de commentaire. */}
				<g transform={`translate(435 480) scale(${bubble})`} opacity={bubble}>
					<path d="M -150 -80 H 150 Q 190 -80 190 -40 V 40 Q 190 80 150 80 H -40 L -100 130 L -90 80 H -150 Q -190 80 -190 40 V -40 Q -190 -80 -150 -80 Z" fill={atelierExtras.labelBackground} filter="url(#soft)" />
					{[-80, 0, 80].map((x) => (
						<circle key={x} cx={x} cy={0} r={22} fill={atelierExtras.labelText} />
					))}
				</g>
			</StageSvg>
		</>
	);
};
