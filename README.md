[![Build Status]](https://travis-ci.org/flying-sheep/rollup-plugin-postcss-modules)

[Build Status]: https://travis-ci.org/flying-sheep/rollup-plugin-postcss-modules.svg?branch=master

rollup-plugin-postcss-modules
=============================

Using `rollup-plugin-postcss` with [`postcss-modules`](https://github.com/css-modules/postcss-modules) is easy, but there’s only one way to combine them. Also, until [this PR](https://github.com/egoist/rollup-plugin-postcss/pull/127) is merged, there’s no way to use `rollup-plugin-postcss>=1.0` with Typescript.

Just add some regular PostCSS plugins and be on your way.

Two new options exist:

* `writeDefinitions: true` creates `.css.d.ts` files next to every processed `.css` file.
* `modules: { ... }` can be used to pass [options](https://github.com/css-modules/postcss-modules#usage) to the intrinsic `postcss-modules` plugin.

Example
-------

see [here](https://github.com/flying-sheep/rollup-plugin-postcss-modules-example) for a clonable repo.

`rollup.config.js`:
```javascript
import postcss from 'rollup-plugin-postcss-modules'
import typescript from 'rollup-plugin-typescript2'

import autoprefixer from 'autoprefixer'

export default {
	entry: 'src/index.tsx',
	dest: 'dist/bundle.js',
	format: 'iife',
	plugins: [
		postcss({
			extract: true,  // extracts to `${basename(dest)}.css`
			plugins: [autoprefixer()],
			writeDefinitions: true,
			// modules: { ... }
		}),
		typescript(),
	],
}
```

`index.html`
```html
<!doctype html>
<script src=dist/bundle.js></script>
<link rel=stylesheet href=dist/bundle.css>

<main id=main></main>
```

`src/index.tsx`:
```typescript
import * as React from 'react'
import * as ReactDOM from 'react-dom'

import MyComponent from './components/my-component'

document.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(<MyComponent/>, document.querySelector('#main'))
})
```

`src/components/my-component.tsx`:
```typescript
import * as React from 'react'

import style from './my-component.css'

export default class MyClass extends React.Component<{}, {}> {
    render() {
        return <div className={style.myClass} />
    }
}
```

`src/components/my-component.css`:
```css
.my-class { ... }
```
