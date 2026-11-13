import React from 'react';
import {Composition} from 'remotion';
import {ADS} from "./ads";
import {FPS, W, H, useFonts} from './lib';
const withFonts = (C: React.FC) => () => { useFonts(); return <C />; };
export const Root: React.FC = () => (
  <>
    {ADS.map((a) => (
      <Composition key={a.id} id={a.id} component={withFonts(a.C)} durationInFrames={Math.round(a.dur * FPS)} fps={FPS} width={W} height={H} />
    ))}
  </>
);
