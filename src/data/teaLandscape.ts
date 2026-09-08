// Scene-space design, not survey/GIS coordinates. All modeled layers share this layout.
export const teaLandscape = {
  width: 26,
  depth: 25.65,
  zonePositions: {
    'dongpo-3': [7.1, -2.5],
    'qingya-1': [-4.2, -1.1],
    'yunjing-2': [7.2, 4.6],
    'beipo-1': [-8.0, 2.8],
    'nangu-1': [-3.5, 5.8],
  } as Record<string, [number, number]>,
  fallbackImage: '/assets/production/chunjian-landscape-v4.png',
};
