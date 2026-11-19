import React from 'react';
import { getLessonById } from '../data/lessons';
import { ExerciseComponentProps, L01WhiteSpace } from './L01WhiteSpace';
import { L02Hierarchy } from './L02Hierarchy';
import { L03Grids } from './L03Grids';
import { L04MacroType } from './L04MacroType';
import { L05FontPairing } from './L05FontPairing';
import { L06ParagraphFlow } from './L06ParagraphFlow';
import { L07MicroType } from './L07MicroType';
import { L08CharacterHygiene } from './L08CharacterHygiene';
import { L09OpticalGeometry } from './L09OpticalGeometry';
import { L10PerceptualColor } from './L10PerceptualColor';
import { L11Iconography } from './L11Iconography';
import { L12ImageFraming } from './L12ImageFraming';
import { L13PrintPrepress } from './L13PrintPrepress';

const REGISTRY: Record<string, React.FC<ExerciseComponentProps>> = {
  '01-whitespace': L01WhiteSpace,
  '02-hierarchy': L02Hierarchy,
  '03-grids': L03Grids,
  '04-macro-type': L04MacroType,
  '05-font-pairing': L05FontPairing,
  '06-paragraph-flow': L06ParagraphFlow,
  '07-micro-type': L07MicroType,
  '08-character-hygiene': L08CharacterHygiene,
  '09-optical-geometry': L09OpticalGeometry,
  '10-perceptual-color': L10PerceptualColor,
  '11-iconography': L11Iconography,
  '12-image-framing': L12ImageFraming,
  '13-print-prepress': L13PrintPrepress,
};

export const ExerciseViewport: React.FC<ExerciseComponentProps & { lessonId: string }> = ({
  lessonId,
  ...props
}) => {
  const lesson = getLessonById(lessonId);
  const Comp = REGISTRY[lessonId] ?? L01WhiteSpace;
  return <Comp {...props} styleWorld={lesson.styleWorld} styleRef={lesson.styleRef} />;
};
