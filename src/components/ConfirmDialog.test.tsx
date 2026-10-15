import { fireEvent, render, screen } from '@testing-library/react-native';

import type { SpaceTone } from '@/theme';

import { ConfirmDialog } from './ConfirmDialog';

const PARENT: SpaceTone = 'parent';

const base = {
  visible: true as boolean,
  title: 'Supprimer le compte de Léa ?',
  body: 'Toutes ses données seront supprimées.',
  confirmLabel: 'Supprimer définitivement',
  keepLabel: 'Garder le compte',
};

describe('ConfirmDialog (choix sûr d’abord)', () => {
  it('garde quand on touche « Garder », supprime quand on confirme', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    await render(<ConfirmDialog {...base} onConfirm={onConfirm} onCancel={onCancel} />);
    await fireEvent.press(screen.getAllByRole('button', { name: 'Garder le compte' }).at(-1)!);
    expect(onCancel).toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Supprimer définitivement' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('ne supprime qu’une fois la case « définitif » cochée', async () => {
    const onConfirm = jest.fn();
    await render(
      <ConfirmDialog
        {...base}
        tone={PARENT}
        ackLabel="Je comprends que c’est définitif."
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />,
    );
    await fireEvent.press(screen.getByText('Supprimer définitivement'));
    expect(onConfirm).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByLabelText('Je comprends que c’est définitif.'));
    await fireEvent.press(screen.getByText('Supprimer définitivement'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('propose le lien d’export sans fermer', async () => {
    const onExport = jest.fn();
    const onCancel = jest.fn();
    await render(
      <ConfirmDialog
        {...base}
        extra={{ label: 'Télécharger mes données d’abord', onPress: onExport }}
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />,
    );
    await fireEvent.press(screen.getByText('Télécharger mes données d’abord'));
    expect(onExport).toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });
});
