import {execSync} from 'child_process';

import fs from 'fs-extra';
import glob from 'glob';

import packageJSON from '../package.json';

describe('build', () => {
  beforeAll(() => {
    // Running clean shall remove the entire build directory. Including
    // `build/cache/jest` which is Jest's cache location. Removing Jest's cache
    // in the middle of it running understandably has undesirable effects -
    // it crashes jest.
    // The clean:build script (ran as part of the prebuild step) removes the
    // build directory with the exception of the build/cache folder so that
    // Jest can keep its cache and keep running.
    execSync('yarn run build');
  });

  it('generates lib files in ./', () => {
    expect(fs.existsSync('./index.js')).toBe(true);
    expect(fs.existsSync('./index.es.js')).toBe(true);
    expect(fs.existsSync('./styles.css')).toBe(true);
    expect(fs.existsSync('./styles.min.css')).toBe(true);
  });

  it('generates a ./styles/foundation dir with spacing.scss', () => {
    expect(fs.existsSync('./styles/foundation/_spacing.scss')).toBe(true);
  });

  it('generates sass entries files in ./styles dir', () => {
    expect(fs.existsSync('./styles/global.scss')).toBe(true);
    expect(fs.existsSync('./styles/foundation.scss')).toBe(true);
    expect(fs.existsSync('./styles/shared.scss')).toBe(true);
    expect(fs.existsSync('./styles/components.scss')).toBe(true);
  });

  it('generates a ./styles.scss sass entry point in root', () => {
    expect(fs.existsSync('./styles.scss')).toBe(true);
  });

  it('generates fully namespaced CSS for root components', () => {
    expect(fs.readFileSync('./styles/components.scss', 'utf8')).toMatch(
      '.Polaris-Button{',
    );
  });

  it('generates fully namespaced CSS for nested components', () => {
    expect(fs.readFileSync('./styles/components.scss', 'utf8')).toMatch(
      '.Polaris-ResourceList-BulkActions__BulkActionButton{',
    );
  });

  it('generates typescript definition files', () => {
    expect(fs.existsSync('./types/latest/src/index.d.ts')).toBe(true);

    // Downleveled for consumers on older TypeScript versions
    expect(fs.existsSync('./types/3.4/src/index.d.ts')).toBe(true);
  });

  it('replaces occurrences of POLARIS_VERSION', () => {
    const initialValue = {
      withTemplate: [],
      withString: [],
    } as {withTemplate: string[]; withString: string[]};

    const results = glob
      .sync('./{index.*,styles.*,esnext/**/*.{js,css,scss},styles/**/*.scss}')
      .reduce((result, file) => {
        const contents = fs.readFileSync(file, 'utf-8');

        if (contents.includes('POLARIS_VERSION')) {
          result.withTemplate.push(file);
        }

        if (contents.includes(packageJSON.version)) {
          result.withString.push(file);
        }

        return result;
      }, initialValue);

    const expectedFiles = [
      './esnext/components/AppProvider/AppProvider.processed.scss',
      './esnext/configure.js',
      './index.es.js',
      './index.js',
      './styles.css',
      './styles.min.css',
      './styles/components.scss',
    ];

    expect(results.withTemplate).toStrictEqual([]);

    expect(results.withString).toStrictEqual(expectedFiles);
  });

  describe('esnext', () => {
    it('facilitates production builds without typescript', () => {
      expect(fs.existsSync('esnext/index.js')).toBe(true);
    });

    it('preserves classes to facilitate class-level tree shaking', () => {
      // `Collapsible` deeply ties into the react class based life-cycles methods, so is likely to be one of the last components converted to a function.
      expect(
        fs.readFileSync('esnext/components/Collapsible/Collapsible.js', 'utf8'),
      ).toMatch('class Collapsible');
    });

    it('converts jsx so we have control over Babel transforms', () => {
      expect(
        fs.readFileSync('esnext/components/Stack/Stack.js', 'utf8'),
      ).not.toMatch(/return <div .+?<\/div>/);
    });

    it('provides scss files', () => {
      expect(
        fs.existsSync('esnext/components/Stack/Stack.processed.scss'),
      ).toBe(true);
    });

    it('preserves CSS class names to give consumers control over minification', () => {
      expect(
        fs.readFileSync('esnext/components/Stack/Stack.processed.scss', 'utf8'),
      ).toMatch('.Stack');
    });

    it('preserves ES scss imports', () => {
      const indexContents = fs.readFileSync(
        'esnext/components/Avatar/Avatar.js',
        'utf8',
      );
      expect(indexContents).toMatch(
        "import styles from './Avatar.processed.scss';",
      );
    });

    it('gives consumers control over global.scss', () => {
      const indexContents = fs.readFileSync('esnext/index.js', 'utf8');
      expect(indexContents).not.toMatch(/import '.+\.scss'/);
    });
  });
});
