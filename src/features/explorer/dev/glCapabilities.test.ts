import { GL, readGlCapabilities, type GlProbeContext } from './glCapabilities';

/** Contexte factice : `getParameter` lit une table, et lève une erreur pour un nom inconnu. */
function fakeContext(
  parameters: Record<number, unknown>,
  extensions: string[] | null,
): GlProbeContext {
  return {
    getParameter: (name: number) => {
      if (!(name in parameters)) throw new Error(`getParameter(${name}) non pris en charge`);
      return parameters[name];
    },
    getExtension: (name: string) => (extensions?.includes(name) ? {} : null),
    getSupportedExtensions: () => extensions,
  };
}

describe('capacités du contexte 3D (atelier)', () => {
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => undefined));
  afterEach(() => jest.restoreAllMocks());

  it('lit les limites, les noms du pilote et les extensions', () => {
    const caps = readGlCapabilities(
      fakeContext(
        {
          [GL.MAX_TEXTURE_SIZE]: 4096,
          [GL.MAX_RENDERBUFFER_SIZE]: 8192,
          [GL.MAX_SAMPLES]: 4,
          [GL.RENDERER]: 'Mali-G715',
          [GL.VENDOR]: 'ARM',
          [GL.VERSION]: 'OpenGL ES 3.2',
        },
        ['OES_texture_float', 'EXT_color_buffer_half_float'],
      ),
    );
    expect(caps).toMatchObject({
      maxTextureSize: 4096,
      maxRenderbufferSize: 8192,
      maxSamples: 4,
      renderer: 'Mali-G715',
      vendor: 'ARM',
      version: 'OpenGL ES 3.2',
      extensions: ['EXT_color_buffer_half_float', 'OES_texture_float'],
    });
    expect(caps.webAssembly).toBe(typeof WebAssembly);
  });

  it('préfère les noms non masqués du pilote quand le navigateur les donne', () => {
    const caps = readGlCapabilities(
      fakeContext(
        {
          [GL.RENDERER]: 'WebKit WebGL',
          [GL.VENDOR]: 'WebKit',
          [GL.UNMASKED_RENDERER]: 'Intel Iris Xe',
          [GL.UNMASKED_VENDOR]: 'Intel',
        },
        ['WEBGL_debug_renderer_info'],
      ),
    );
    expect(caps.renderer).toBe('Intel Iris Xe');
    expect(caps.vendor).toBe('Intel');
  });

  it('laisse vide ce que le contexte refuse ou ne donne pas, sans tout abandonner', () => {
    const caps = readGlCapabilities(
      fakeContext({ [GL.MAX_TEXTURE_SIZE]: 2048, [GL.MAX_SAMPLES]: null }, null),
    );
    expect(caps).toMatchObject({
      maxTextureSize: 2048,
      maxRenderbufferSize: null,
      maxSamples: null,
      renderer: null,
      extensions: [],
    });
  });

  it('garde les limites quand la liste des extensions est refusée', () => {
    const broken: GlProbeContext = {
      ...fakeContext({ [GL.MAX_TEXTURE_SIZE]: 4096, [GL.RENDERER]: 'Adreno 740' }, null),
      getExtension: () => {
        throw new Error('getExtension refusé');
      },
      getSupportedExtensions: () => {
        throw new Error('getSupportedExtensions refusé');
      },
    };
    expect(readGlCapabilities(broken)).toMatchObject({
      maxTextureSize: 4096,
      renderer: 'Adreno 740',
      extensions: [],
    });
  });
});
