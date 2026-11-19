import { assetUrl } from '../engine/assetUrl';

export interface JointPoint {
  label: string;
  y: number; // Normalized [0..1] vertical position in source photo
  x?: number;
}

export interface TangentLine {
  axis: 'x' | 'y';
  pos: number; // Normalized [0..1]
  label: string;
}

export interface EditorialPhotoMeta {
  id: string;
  title: string;
  url: string;
  naturalWidth: number;
  naturalHeight: number;
  kind: 'portrait' | 'full-body' | 'architecture' | 'still-life';
  eyeLineY?: number;
  eyeCenterX?: number;
  hairlineY?: number;
  topOfHeadY?: number;
  gazeDir?: -1 | 0 | 1;
  naturalHorizonY?: number;
  naturalTiltDeg?: number;
  joints: JointPoint[];
  tangentLines: TangentLine[];
}

export const EDITORIAL_PHOTOS: EditorialPhotoMeta[] = [
  {
    id: 'portrait-architect',
    title: 'Studio Portrait: Architect',
    url: assetUrl('photos/portrait-architect.webp'),
    naturalWidth: 896,
    naturalHeight: 1200,
    kind: 'portrait',
    topOfHeadY: 0.245,
    hairlineY: 0.285,
    eyeLineY: 0.345,
    eyeCenterX: 0.54,
    gazeDir: 1,
    joints: [
      { label: 'Shoulders', y: 0.51 },
      { label: 'Elbows', y: 0.79 },
      { label: 'Wrists & Hands', y: 0.835 },
    ],
    tangentLines: [
      { axis: 'x', pos: 0.75, label: 'Door frame vertical' },
      { axis: 'x', pos: 0.19, label: 'Jacket left contour' },
    ],
  },
  {
    id: 'figure-ceramicist',
    title: 'Full Figure: Ceramicist',
    url: assetUrl('photos/figure-ceramicist.webp'),
    naturalWidth: 896,
    naturalHeight: 1200,
    kind: 'full-body',
    topOfHeadY: 0.15,
    hairlineY: 0.175,
    eyeLineY: 0.205,
    eyeCenterX: 0.47,
    gazeDir: -1,
    joints: [
      { label: 'Shoulders', y: 0.305 },
      { label: 'Elbows', y: 0.44 },
      { label: 'Hips', y: 0.55 },
      { label: 'Wrists', y: 0.58 },
      { label: 'Knees', y: 0.74 },
      { label: 'Ankles', y: 0.865 },
    ],
    tangentLines: [
      { axis: 'x', pos: 0.635, label: 'Oak table edge' },
      { axis: 'x', pos: 0.355, label: 'Left arm contour' },
    ],
  },
  {
    id: 'figure-dancer',
    title: 'Full Figure: Contemporary Study',
    url: assetUrl('photos/figure-dancer.webp'),
    naturalWidth: 896,
    naturalHeight: 1200,
    kind: 'full-body',
    topOfHeadY: 0.268,
    hairlineY: 0.295,
    eyeLineY: 0.312,
    eyeCenterX: 0.495,
    gazeDir: -1,
    joints: [
      { label: 'Shoulders', y: 0.39 },
      { label: 'Extended Elbow', y: 0.475 },
      { label: 'Extended Wrist', y: 0.54 },
      { label: 'Hips', y: 0.55 },
      { label: 'Knees', y: 0.715 },
      { label: 'Ankles', y: 0.85 },
    ],
    tangentLines: [
      { axis: 'x', pos: 0.23, label: 'Extended fingertips' },
      { axis: 'x', pos: 0.62, label: 'Right arm edge' },
    ],
  },
  {
    id: 'editorial-gallery',
    title: 'Architectural Horizon: Concrete Gallery',
    url: assetUrl('photos/editorial-gallery.webp'),
    naturalWidth: 1200,
    naturalHeight: 805,
    kind: 'architecture',
    topOfHeadY: 0.46,
    hairlineY: 0.475,
    eyeLineY: 0.485,
    eyeCenterX: 0.495,
    gazeDir: 1,
    naturalHorizonY: 0.655,
    naturalTiltDeg: 0,
    joints: [
      { label: 'Shoulders', y: 0.53 },
      { label: 'Knees', y: 0.72 },
      { label: 'Ankles', y: 0.785 },
    ],
    tangentLines: [
      { axis: 'x', pos: 0.475, label: 'Concrete column seam' },
      { axis: 'x', pos: 0.53, label: 'Visitor coat edge' },
    ],
  },
];

export const STILL_LIFE_PHOTOS = {
  ceramic: assetUrl('photos/still-ceramic.webp'),
  coffee: assetUrl('photos/still-coffee.webp'),
  gallery: assetUrl('photos/editorial-gallery.webp'),
};
