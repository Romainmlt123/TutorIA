import { render, screen } from '@testing-library/react-native';

import type { MapCity } from '../../logic/regionMap';
import { CityPanel } from './CityPanel';

const CITY: MapCity = {
  id: 'maths-triangles-quadrilateres',
  name: 'Village des Triangles et Quadrilatères',
  monument: 'triangles-quadrilateres',
  status: 'done',
  open: true,
  missing: [],
  recall: undefined,
  center: { x: 0, z: 0 },
  radius: 2,
  levelsDone: 7,
  levelsTotal: 7,
  stars: 18,
};

describe('titre du panneau de village', () => {
  it('passe sur deux lignes pour le nom le plus long', async () => {
    await render(<CityPanel city={CITY} next={undefined} onPrevious={null} onNext={null} />);

    expect(screen.getByText(CITY.name).props.numberOfLines).toBe(2);
  });
});
