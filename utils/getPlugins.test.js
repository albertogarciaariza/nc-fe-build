process.argv.push('--quiet');

describe('Test getPlugins.js', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('Should load a plugin from string', () => {
    jest.mock('postcss-fe-build-test-a', () => () => 'mocked-plugin-a', { virtual: true });

    const getPlugins = require('./getPlugins');
    const plugins = ['postcss-fe-build-test-a'];
    const result = getPlugins(plugins);

    expect(result).toHaveLength(1);
    expect(result[0]()).toBe('mocked-plugin-a');
  });

  it('Should load a plugin from [plugin, options] format', () => {
    jest.mock('postcss-fe-build-test-b', () => ({
      default: (opts) => `mocked-plugin-b:${JSON.stringify(opts)}`
    }), { virtual: true });

    const getPlugins = require('./getPlugins');
    const plugins = [['postcss-fe-build-test-b', { extractAll: false }]];
    const result = getPlugins(plugins);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe('mocked-plugin-b:{"extractAll":false}');
  });


  it('Should ignore falsy values in plugin list', () => {
    jest.mock('postcss-fe-build-test-c', () => () => 'mocked-plugin-a', { virtual: true });

    const getPlugins = require('./getPlugins');
    const plugins = [null, undefined, false, 'postcss-fe-build-test-c'];
    const result = getPlugins(plugins);

    expect(result).toHaveLength(1);
    expect(result[0]()).toBe('mocked-plugin-a');
  });

  it('Should throw on invalid plugin entry', () => {
    const getPlugins = require('./getPlugins');

    const invalidPlugins = [{ foo: 'bar' }, 123, true];
    invalidPlugins.forEach(plugin => {
      expect(() => getPlugins([plugin])).toThrow('Invalid plugin entry');
    });
  });
});
