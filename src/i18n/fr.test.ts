import { fr } from './fr';

describe('libellés des villages', () => {
  it('utilise le masculin dans les chaînes affichées et accessibles', () => {
    expect(fr.explorer.regionSign('Nombres', 1, 3, 2, 'En cours')).toContain('1 village validé');
    expect(fr.explorer.regionSign('Nombres', 2, 3, 2, 'En cours')).toContain('2 villages validés');
    expect(fr.explorer.toConsolidate(1)).toBe('1 village à consolider');
    expect(fr.explorer.toConsolidate(2)).toBe('2 villages à consolider');
    expect(fr.explorer.cityTab).toBe('Village');
    expect(fr.explorer.previousCity).toBe('Village précédent');
    expect(fr.explorer.nextCity).toBe('Village suivant');
    expect(fr.explorer.cityStatus.done).toBe('validé');
    expect(fr.explorer.cityStatus.locked).toBe('fermé');
    expect(fr.explorer.celebration.cityDone('Village des Relatifs')).toBe(
      'Bravo, Village des Relatifs est validé !',
    );
    expect(fr.explorer.level.locked.bilan(2)).toContain('du village');
    expect(fr.explorer.level.opening.evaluation('Bilan des Relatifs', 6)).toContain(
      'bilan du village',
    );
    expect(fr.explorer.level.retryBody.evaluation).toContain('valider le village');
    expect(fr.profile.trophies.names['ville-parfaite']).toBe('Village parfait');
    expect(fr.avatar.condition.cities(1)).toBe('Valide ton premier village');
    expect(fr.avatar.condition.cities(3)).toBe('Valide 3 villages');
    expect(fr.avatar.condition.perfectCities(1)).toContain('d’un village');
    expect(fr.avatar.condition.perfectCities(3)).toContain('de 3 villages');
  });
});
