import type { ConversationSummary } from '@/services/conversations';

import { chatMessagesOf, entryOfParams, groupConversations } from './conversations';

const conversation = (id: string, lastMessageAt: string, chapterId: string | null = null) =>
  ({
    id,
    title: `Discussion ${id}`,
    subjectId: chapterId ? 'maths' : null,
    chapterId,
    lastMessageAt,
  }) satisfies ConversationSummary;

describe('discussions du chat libre', () => {
  it('range les discussions par jour, à l’heure de Paris', () => {
    const now = new Date('2026-10-07T10:00:00Z');
    const groups = groupConversations(
      [
        conversation('a', '2026-10-06T22:30:00Z'), // 0 h 30 le 7 à Paris
        conversation('b', '2026-10-06T08:00:00Z'),
        conversation('c', '2026-10-02T08:00:00Z'),
        conversation('d', '2026-09-01T08:00:00Z'),
        conversation('e', '2026-10-07T09:00:00Z'),
      ],
      now,
    );
    expect(groups.map((g) => [g.group, g.conversations.map((c) => c.id)])).toEqual([
      ['today', ['e', 'a']],
      ['yesterday', ['b']],
      ['week', ['c']],
      ['older', ['d']],
    ]);
  });

  it('relit les messages enregistrés, avec le conseil à part et le visuel', () => {
    const visual = {
      kind: 'board',
      title: 'Étapes',
      description: 'Résolution',
      lines: [],
    } as never;
    expect(
      chatMessagesOf([
        { id: '1', role: 'student', content: 'x ?', visual: null, createdAt: '' },
        {
          id: '2',
          role: 'tutor',
          content: 'On divise par 3.\nConseil : vérifie en remplaçant x.',
          visual,
          createdAt: '',
        },
      ]),
    ).toEqual([
      { id: '1', kind: 'student', text: 'x ?' },
      { id: '2', kind: 'tutor', text: 'On divise par 3.', visual },
      { id: '2-tip', kind: 'tip', text: 'vérifie en remplaçant x.' },
    ]);
  });

  it('« Reprendre » rouvre la dernière discussion du chapitre, sinon en ouvre une nouvelle', () => {
    const list = [
      conversation('libre', '2026-10-07T09:00:00Z'),
      conversation('equations', '2026-10-06T09:00:00Z', 'maths-equations'),
    ];
    const chapter = { subjectId: 'maths', chapterId: 'maths-equations' } as const;
    expect(entryOfParams(true, chapter, undefined)).toBeNull();
    expect(entryOfParams(true, chapter, list)).toMatchObject({
      conversationId: 'equations',
      stored: true,
      topic: chapter,
    });
    expect(entryOfParams(true, {}, list)).toMatchObject({ conversationId: 'libre', topic: {} });
    expect(entryOfParams(true, chapter, [])).toMatchObject({ stored: false, topic: chapter });
    expect(entryOfParams(false, chapter, list)).toMatchObject({ stored: false, topic: chapter });
  });
});
