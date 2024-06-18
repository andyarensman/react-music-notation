# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.json", "./tsconfig.node.json"],
    tsconfigRootDir: __dirname,
  },
};
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

## Sizing:

To determine the position of note heads, you take the font size of the Leland font and divide it by 8. So we are currently using font size 32px, which equates to 4px being the height of the note heads.I don't think pixels should be cut in half, so right now the font size options are 2:16, 3:24, 4:32, 5:40, 6:48, etc. This means I will likely need to limit the user to these font ratios.

To determine the sizing of the staff lines, you need to first double the note head size. We're at 4, so that gives us 8. We need to split this up by our line thickness and the gap between the lines. I want the lines `.line` to be 1px in thickness right now, so the gap `.staff` should be 7px. Larger font sizes may require thicker lines, which will need some testing.

The height of the leland font is not 32px, it is much larger at 129px (for this font size). We will use that as cushioning so we need to take the total height of our staff lines, subtract it from 129, and divide it by 2 to get our top and bottom border. The total height of the staff lines is 33px, so that gives us 48px margins for `.staff`.

Things are mostly looking good now except for the C Clef which seems to be slightly off center.

## Beaming:

I'm not quite sure how this will work. Wether it will be within the note component or within the measure component. SVG is probably the only way to do it. Not sure how the view window will work either.

- [Make Awesome SVG Animations with CSS // 7 Useful Techniques](https://www.youtube.com/watch?v=UTHgr6NLeEw)
- [SVG image without aspect ratio](https://stackoverflow.com/questions/50226255/scale-svg-image-without-aspect-ratio)

## Resources:

- [video about musescore font](https://www.youtube.com/watch?v=XGo4PJd1lng)
- [Leland music fonts](https://github.com/MuseScoreFonts/Leland)
- [standard music font layout](https://w3c.github.io/smufl/latest/index.html)
- [musicXML wiki](https://www.w3.org/2021/06/musicxml40/)
- [Tool for viewing all font symbols](https://fontdrop.info/)
- [May need this for font conversion](https://www.fontsquirrel.com/tools/webfont-generator)
- [Subset web fonts](https://web.dev/learn/performance/optimize-web-fonts#:~:text=Note%3A%20The%20only%20time%20you,font%20formats%20other%20than%20WOFF2.)
- [Deep Controls Addon docs](https://www.npmjs.com/package/storybook-addon-deep-controls)
