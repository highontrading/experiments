import React from 'react';
import {Composition} from 'remotion';
import {Trailer} from './Trailer';
import {TL, FPS} from './lib';

const frames = Math.round(TL.total * FPS);
export const Root: React.FC = () => (
  <>
    <Composition id="Trailer16x9" component={Trailer} durationInFrames={frames} fps={FPS} width={1920} height={1080} />
    <Composition id="Trailer9x16" component={Trailer} durationInFrames={frames} fps={FPS} width={1080} height={1920} />
  </>
);
